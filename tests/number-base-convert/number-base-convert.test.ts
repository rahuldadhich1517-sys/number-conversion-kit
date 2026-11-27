import { describe, it, expect } from "vitest";
import {
  numberBaseConvert,
  parseBaseInteger,
  formatBaseInteger,
  validateBase,
  getBaseConversionInfo,
} from "../../src/number-base-convert";
import { NumberConversionError } from "../../src/shared";

describe("number-base-convert", () => {
  it("converts between arbitrary bases 2 to 36", () => {
    expect(numberBaseConvert("1010", 2, 10)).toBe("10");
    expect(numberBaseConvert("FF", 16, 2)).toBe("11111111");
    expect(numberBaseConvert("123", 10, 36)).toBe("3F");
    expect(numberBaseConvert("Z", 36, 10)).toBe("35");
    expect(numberBaseConvert("35", 10, 36)).toBe("Z");
  });

  it("tests every base from 2 to 36 round-trip with arbitrary values", () => {
    const testVal = 123456789n;
    for (let b = 2; b <= 36; b++) {
      const encoded = formatBaseInteger(testVal, b);
      const decoded = parseBaseInteger(encoded, b);
      expect(decoded).toBe(testVal);
    }
  });

  it("handles negative numbers across bases", () => {
    expect(numberBaseConvert("-1010", 2, 16)).toBe("-A");
    expect(numberBaseConvert("-FF", 16, 10)).toBe("-255");
  });

  it("supports large arbitrary-size BigInt values", () => {
    const huge = (1n << 100n) - 1n;
    const bin = formatBaseInteger(huge, 2);
    const hex = numberBaseConvert(bin, 2, 16);
    expect(parseBaseInteger(hex, 16)).toBe(huge);
  });

  it("rejects bases outside 2..36", () => {
    expect(() => validateBase(1)).toThrowError(NumberConversionError);
    expect(() => validateBase(37)).toThrowError(NumberConversionError);
    expect(() => numberBaseConvert("10", 1, 10)).toThrowError(NumberConversionError);
    expect(() => numberBaseConvert("10", 10, 37)).toThrowError(NumberConversionError);
  });

  it("rejects invalid digits for the chosen base", () => {
    expect(() => numberBaseConvert("12", 2, 10)).toThrowError(NumberConversionError);
    expect(() => numberBaseConvert("1G", 16, 10)).toThrowError(NumberConversionError);
  });

  it("returns rich breakdown from getBaseConversionInfo", () => {
    const info = getBaseConversionInfo("1010", 2, 16);
    expect(info.fromBase).toBe(2);
    expect(info.toBase).toBe(16);
    expect(info.result).toBe("A");
    expect(info.bigIntValue).toBe(10n);
    expect(info.digitCount).toBe(1);
  });
});
