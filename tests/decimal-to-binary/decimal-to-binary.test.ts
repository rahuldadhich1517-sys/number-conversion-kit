import { describe, it, expect } from "vitest";
import {
  decimalToBinary,
  validateDecimalInteger,
  formatBinaryInteger,
} from "../../src/decimal-to-binary";
import { NumberConversionError } from "../../src/shared";

describe("decimal-to-binary", () => {
  it("converts decimal values to binary strings", () => {
    expect(decimalToBinary(0)).toBe("0");
    expect(decimalToBinary(1)).toBe("1");
    expect(decimalToBinary(10)).toBe("1010");
    expect(decimalToBinary(255)).toBe("11111111");
    expect(decimalToBinary("255")).toBe("11111111");
    expect(decimalToBinary(255n)).toBe("11111111");
  });

  it("handles negative decimals in mathematical mode", () => {
    expect(decimalToBinary(-10)).toBe("-1010");
    expect(decimalToBinary("-255")).toBe("-11111111");
    expect(decimalToBinary(-255n)).toBe("-11111111");
  });

  it("handles negative decimals in two's complement mode", () => {
    expect(decimalToBinary(-5, { mode: "twos-complement", bitWidth: 8 })).toBe("11111011");
    expect(decimalToBinary(-1, { mode: "twos-complement", bitWidth: 8 })).toBe("11111111");
    expect(decimalToBinary(5, { mode: "twos-complement", bitWidth: 8 })).toBe("00000101");
  });

  it("throws INTEGER_OUT_OF_RANGE in two's complement mode when overflowing bit width", () => {
    expect(() =>
      decimalToBinary(128, { mode: "twos-complement", bitWidth: 8 })
    ).toThrowError(NumberConversionError);
    expect(() =>
      decimalToBinary(-129, { mode: "twos-complement", bitWidth: 8 })
    ).toThrowError(NumberConversionError);
  });

  it("supports prefix and grouping options", () => {
    const res = decimalToBinary(255, { prefix: true, groupSize: 4, groupSeparator: "_" });
    expect(res).toBe("0b1111_1111");
  });

  it("validates decimal integers with validateDecimalInteger", () => {
    expect(validateDecimalInteger("123")).toBe(true);
    expect(validateDecimalInteger("-123")).toBe(true);
    expect(validateDecimalInteger(123)).toBe(true);
    expect(validateDecimalInteger(123n)).toBe(true);
    expect(validateDecimalInteger("123_456")).toBe(true);
    expect(validateDecimalInteger("")).toBe(false);
    expect(validateDecimalInteger("12.34")).toBe(false);
    expect(validateDecimalInteger(3.14)).toBe(false);
    expect(validateDecimalInteger(NaN)).toBe(false);
    expect(validateDecimalInteger(Infinity)).toBe(false);
  });

  it("formats binary integer with formatBinaryInteger with various options", () => {
    expect(formatBinaryInteger("1010", { prefix: true, minWidth: 8 })).toBe("0b00001010");
    expect(formatBinaryInteger("+1010", { prefix: false })).toBe("1010");
    expect(formatBinaryInteger("-1010", { prefix: true })).toBe("-0b1010");
    expect(formatBinaryInteger("11110000", { groupSize: 4, groupSeparator: "_" })).toBe("1111_0000");
    expect(() => formatBinaryInteger("102")).toThrowError(NumberConversionError);
  });

  it("rejects invalid inputs with descriptive errors", () => {
    expect(() => decimalToBinary("abc")).toThrowError(NumberConversionError);
    expect(() => decimalToBinary("")).toThrowError(NumberConversionError);
    expect(() => decimalToBinary(3.14)).toThrowError(NumberConversionError);
    // @ts-expect-error test invalid type
    expect(() => decimalToBinary({})).toThrowError(NumberConversionError);
  });
});
