import { describe, it, expect } from "vitest";
import {
  hexToDecimal,
  validateHexadecimal,
  formatDecimalResult,
} from "../../src/hex-to-decimal";
import { NumberConversionError } from "../../src/shared";

describe("hex-to-decimal", () => {
  it("converts hex to BigInt by default", () => {
    expect(hexToDecimal("0")).toBe(0n);
    expect(hexToDecimal("A")).toBe(10n);
    expect(hexToDecimal("a")).toBe(10n);
    expect(hexToDecimal("FF")).toBe(255n);
    expect(hexToDecimal("0xFF")).toBe(255n);
    expect(hexToDecimal("-0xFF")).toBe(-255n);
  });

  it("supports large hex values without losing precision", () => {
    const hex = "10000000000000000"; // 2^64
    expect(hexToDecimal(hex)).toBe(1n << 64n);
  });

  it("returns safe Number when asNumber is true", () => {
    const res = hexToDecimal("FF", { asNumber: true });
    expect(res).toBe(255);
    expect(typeof res).toBe("number");
  });

  it("throws UNSAFE_NUMBER when asNumber is true and value exceeds safe range", () => {
    const hugeHex = "20000000000000"; // > 9007199254740991
    expect(() => hexToDecimal(hugeHex, { asNumber: true })).toThrowError(
      NumberConversionError
    );
  });

  it("returns decimal string when asString is true", () => {
    const res = hexToDecimal("FF", { asString: true });
    expect(res).toBe("255");
    expect(typeof res).toBe("string");
  });

  it("supports signed interpretation with explicit bit width", () => {
    // 0xFF in 8-bit two's complement is -1
    expect(hexToDecimal("FF", { signedBitWidth: 8 })).toBe(-1n);
    // 0x7F in 8-bit is +127
    expect(hexToDecimal("7F", { signedBitWidth: 8 })).toBe(127n);
    // 0x80 in 8-bit is -128
    expect(hexToDecimal("80", { signedBitWidth: 8 })).toBe(-128n);
  });

  it("rejects hex value exceeding signed bit width range", () => {
    expect(() => hexToDecimal("100", { signedBitWidth: 8 })).toThrowError(
      NumberConversionError
    );
  });

  it("formats decimal result with formatDecimalResult", () => {
    expect(formatDecimalResult(1000000)).toBe("1000000");
    expect(formatDecimalResult(1000000, { groupSize: 3, groupSeparator: "," })).toBe(
      "1,000,000"
    );
    expect(formatDecimalResult(-1000000n, { groupSize: 3, groupSeparator: "," })).toBe(
      "-1,000,000"
    );
  });

  it("validates hexadecimal directly from hex-to-decimal", () => {
    expect(validateHexadecimal("0xABC")).toBe(true);
    expect(validateHexadecimal("xyz")).toBe(false);
  });

  it("rejects invalid hex strings", () => {
    expect(() => hexToDecimal("")).toThrowError(NumberConversionError);
    expect(() => hexToDecimal("0xG1")).toThrowError(NumberConversionError);
  });
});
