import { describe, it, expect } from "vitest";
import {
  binaryToDecimal,
  validateBinary,
  parseBinary,
  formatBinary,
} from "../../src/binary-to-decimal";
import { NumberConversionError } from "../../src/shared";

describe("binary-to-decimal", () => {
  it("converts basic binary integers to BigInt by default", () => {
    expect(binaryToDecimal("0")).toBe(0n);
    expect(binaryToDecimal("1")).toBe(1n);
    expect(binaryToDecimal("1010")).toBe(10n);
    expect(binaryToDecimal("11111111")).toBe(255n);
    expect(binaryToDecimal("0b11111111")).toBe(255n);
    expect(binaryToDecimal("0B1010")).toBe(10n);
  });

  it("handles negative binary integers", () => {
    expect(binaryToDecimal("-1010")).toBe(-10n);
    expect(binaryToDecimal("-0b1111")).toBe(-15n);
    expect(binaryToDecimal("+1010")).toBe(10n);
  });

  it("handles separators when allowed", () => {
    expect(binaryToDecimal("1111_0000")).toBe(240n);
    expect(binaryToDecimal("1111 0000")).toBe(240n);
    expect(binaryToDecimal("0b1111_0000")).toBe(240n);
  });

  it("supports large arbitrary-size BigInt values without precision loss", () => {
    const bit64 = "1".repeat(64);
    const expected = (1n << 64n) - 1n;
    expect(binaryToDecimal(bit64)).toBe(expected);

    const bit128 = "10" + "0".repeat(126);
    expect(binaryToDecimal(bit128)).toBe(1n << 127n);
  });

  it("returns safe Number when requested", () => {
    const res = binaryToDecimal("1010", { asNumber: true });
    expect(res).toBe(10);
    expect(typeof res).toBe("number");
  });

  it("throws UNSAFE_NUMBER when value exceeds safe integer range and asNumber is true", () => {
    const unsafeBits = "1" + "0".repeat(54); // 2^54 > MAX_SAFE_INTEGER
    expect(() => binaryToDecimal(unsafeBits, { asNumber: true })).toThrowError(
      NumberConversionError
    );
    try {
      binaryToDecimal(unsafeBits, { asNumber: true });
    } catch (err) {
      expect((err as NumberConversionError).code).toBe("UNSAFE_NUMBER");
    }
  });

  it("returns decimal string when asString is true", () => {
    const res = binaryToDecimal("11111111", { asString: true });
    expect(res).toBe("255");
    expect(typeof res).toBe("string");
  });

  it("validates binary strings correctly with validateBinary", () => {
    expect(validateBinary("1010")).toBe(true);
    expect(validateBinary("0b1010")).toBe(true);
    expect(validateBinary("1010_0101")).toBe(true);
    expect(validateBinary("")).toBe(false);
    expect(validateBinary("1020")).toBe(false);
    expect(validateBinary("abc")).toBe(false);
  });

  it("parses binary into BigInt with parseBinary", () => {
    expect(parseBinary("1101")).toBe(13n);
  });

  it("formats binary with formatBinary", () => {
    expect(formatBinary("1010", { prefix: true })).toBe("0b1010");
    expect(formatBinary("1010", { prefix: "0b", minWidth: 8 })).toBe("0b00001010");
    expect(formatBinary("11110000", { groupSize: 4, groupSeparator: "_" })).toBe("1111_0000");
  });

  it("throws clear errors on empty or invalid inputs", () => {
    expect(() => binaryToDecimal("")).toThrowError(NumberConversionError);
    expect(() => binaryToDecimal("   ")).toThrowError(NumberConversionError);
    expect(() => binaryToDecimal("10201")).toThrowError(NumberConversionError);
  });
});
