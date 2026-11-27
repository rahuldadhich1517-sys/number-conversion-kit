import { describe, it, expect } from "vitest";
import {
  hexToBinary,
  validateHexadecimal,
  parseHexadecimal,
} from "../../src/hex-to-binary";
import { NumberConversionError } from "../../src/shared";

describe("hex-to-binary", () => {
  it("converts hexadecimal to binary strings numerically", () => {
    expect(hexToBinary("0")).toBe("0");
    expect(hexToBinary("A")).toBe("1010");
    expect(hexToBinary("a")).toBe("1010");
    expect(hexToBinary("FF")).toBe("11111111");
    expect(hexToBinary("0xFF")).toBe("11111111");
    expect(hexToBinary("-0xFF")).toBe("-11111111");
  });

  it("preserves leading zeros when requested by mapping each hex char to 4 bits", () => {
    expect(hexToBinary("0F", { preserveLeadingZeros: true })).toBe("00001111");
    expect(hexToBinary("00A5", { preserveLeadingZeros: true })).toBe("0000000010100101");
  });

  it("supports nibble alignment and bitWidth", () => {
    expect(hexToBinary("7", { nibbleAligned: true })).toBe("0111");
    expect(hexToBinary("7", { bitWidth: 8 })).toBe("00000111");
  });

  it("supports prefix and grouping", () => {
    const res = hexToBinary("FF", { prefix: true, groupSize: 4, groupSeparator: " " });
    expect(res).toBe("0b1111 1111");
  });

  it("validates hexadecimal with validateHexadecimal", () => {
    expect(validateHexadecimal("1A3F")).toBe(true);
    expect(validateHexadecimal("0x1A3F")).toBe(true);
    expect(validateHexadecimal("-0x1A3F")).toBe(true);
    expect(validateHexadecimal("1a_3f")).toBe(true);
    expect(validateHexadecimal("")).toBe(false);
    expect(validateHexadecimal("1G3F")).toBe(false);
  });

  it("parses hexadecimal into BigInt with parseHexadecimal", () => {
    expect(parseHexadecimal("FF")).toBe(255n);
    expect(parseHexadecimal("0x100")).toBe(256n);
  });

  it("handles very large hex strings without precision loss", () => {
    const hex = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"; // 128-bit
    const bin = hexToBinary(hex);
    expect(bin).toBe("1".repeat(128));
  });

  it("rejects invalid characters", () => {
    expect(() => hexToBinary("XYZ")).toThrowError(NumberConversionError);
  });
});
