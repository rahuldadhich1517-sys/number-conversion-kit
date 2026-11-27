import { describe, it, expect } from "vitest";
import {
  baseConvertAll,
  getBaseConversionResults,
  formatBaseConversion,
} from "../../src/base-convert-all";
import { NumberConversionError } from "../../src/shared";

describe("base-convert-all", () => {
  it("converts 255n into binary, decimal, hex, and octal simultaneously", () => {
    const res = baseConvertAll(255n);
    expect(res.binary).toBe("11111111");
    expect(res.decimal).toBe("255");
    expect(res.hexadecimal).toBe("FF");
    expect(res.octal).toBe("377");
    expect(res.bigIntValue).toBe(255n);
    expect(res.isNegative).toBe(false);
  });

  it("handles number input within safe range", () => {
    const res = baseConvertAll(42);
    expect(res.binary).toBe("101010");
    expect(res.decimal).toBe("42");
    expect(res.hexadecimal).toBe("2A");
    expect(res.octal).toBe("52");
  });

  it("handles string input in various formats", () => {
    const res = baseConvertAll("100");
    expect(res.decimal).toBe("100");

    const hexRes = baseConvertAll("0xFF");
    expect(hexRes.decimal).toBe("255");

    const binRes = baseConvertAll("0b1010");
    expect(binRes.decimal).toBe("10");

    const octRes = baseConvertAll("0o77");
    expect(octRes.decimal).toBe("63");
  });

  it("handles negative integers preserving signs", () => {
    const res = baseConvertAll(-255n);
    expect(res.binary).toBe("-11111111");
    expect(res.decimal).toBe("-255");
    expect(res.hexadecimal).toBe("-FF");
    expect(res.octal).toBe("-377");
    expect(res.isNegative).toBe(true);
  });

  it("supports prefixes when configured", () => {
    const res = baseConvertAll(255n, { includePrefix: true });
    expect(res.binary).toBe("0b11111111");
    expect(res.decimal).toBe("255");
    expect(res.hexadecimal).toBe("0xFF");
    expect(res.octal).toBe("0o377");
  });

  it("supports lowercase hex when configured", () => {
    const res = baseConvertAll(255n, { uppercaseHex: false });
    expect(res.hexadecimal).toBe("ff");
  });

  it("formats base conversion results with formatBaseConversion", () => {
    const res = getBaseConversionResults(65535n);
    const formatted = formatBaseConversion(res, {
      groupDigitsConfig: {
        binary: 4,
        hex: 2,
        separator: " ",
      },
      uppercaseHex: true,
    });
    expect(formatted.binary).toBe("1111 1111 1111 1111");
    expect(formatted.hexadecimal).toBe("FF FF");
  });

  it("rejects unsafe or invalid numbers", () => {
    expect(() => baseConvertAll(Number.MAX_SAFE_INTEGER + 10)).toThrowError(
      NumberConversionError
    );
    expect(() => baseConvertAll(NaN)).toThrowError(NumberConversionError);
    expect(() => baseConvertAll(Infinity)).toThrowError(NumberConversionError);
    expect(() => baseConvertAll(3.14)).toThrowError(NumberConversionError);
    expect(() => baseConvertAll("")).toThrowError(NumberConversionError);
    expect(() => baseConvertAll("not-a-number")).toThrowError(NumberConversionError);
  });
});
