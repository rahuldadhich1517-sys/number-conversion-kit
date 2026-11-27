import { describe, it, expect } from "vitest";
import {
  toTwosComplement,
  fromTwosComplement,
  getTwosComplementInfo,
  validateBitWidth,
  validateSignedIntegerRange,
} from "../../src/twos-complement";
import { NumberConversionError } from "../../src/shared";

describe("twos-complement", () => {
  describe("toTwosComplement", () => {
    it("converts -5n to 8-bit two's complement", () => {
      const res = toTwosComplement(-5n, 8);
      expect(res.binary).toBe("11111011");
      expect(res.hexadecimal).toBe("FB");
      expect(res.unsignedValue).toBe(251n);
      expect(res.isNegative).toBe(true);
    });

    it("converts positive integers", () => {
      const res = toTwosComplement(5n, 8);
      expect(res.binary).toBe("00000101");
      expect(res.hexadecimal).toBe("05");
      expect(res.isNegative).toBe(false);
    });

    it("handles boundary values for 8, 16, 32, 64 bits", () => {
      // 8-bit: -128 to 127
      expect(toTwosComplement(-128n, 8).binary).toBe("10000000");
      expect(toTwosComplement(127n, 8).binary).toBe("01111111");

      // 16-bit: -32768 to 32767
      expect(toTwosComplement(-32768n, 16).binary).toBe("1000000000000000");
      expect(toTwosComplement(32767n, 16).binary).toBe("0111111111111111");

      // 32-bit: -2147483648 to 2147483647
      expect(toTwosComplement(-2147483648n, 32).binary).toBe("1" + "0".repeat(31));

      // 64-bit min
      const min64 = -(1n << 63n);
      expect(toTwosComplement(min64, 64).binary).toBe("1" + "0".repeat(63));
    });

    it("supports includePrefix option", () => {
      const res = toTwosComplement(-5n, 8, { includePrefix: true });
      expect(res.binary).toBe("0b11111011");
      expect(res.hexadecimal).toBe("0xFB");
    });

    it("rejects out-of-range signed integers", () => {
      expect(() => toTwosComplement(128n, 8)).toThrowError(NumberConversionError);
      expect(() => toTwosComplement(-129n, 8)).toThrowError(NumberConversionError);
      // @ts-expect-error test invalid type
      expect(() => toTwosComplement({}, 8)).toThrowError(NumberConversionError);
      expect(() => toTwosComplement("", 8)).toThrowError(NumberConversionError);
      expect(() => toTwosComplement("not-int", 8)).toThrowError(NumberConversionError);
    });
  });

  describe("fromTwosComplement", () => {
    it("decodes 8-bit binary '11111011' with radix 2 to -5n", () => {
      expect(fromTwosComplement("11111011", 2)).toBe(-5n);
    });

    it("decodes positive binary '00000101' with radix 2 to 5n", () => {
      expect(fromTwosComplement("00000101", 2)).toBe(5n);
    });

    it("decodes hex 'FB' with radix 16 to -5n when width is 8", () => {
      expect(fromTwosComplement("FB", 16, 8)).toBe(-5n);
      expect(fromTwosComplement("0xFB", 16)).toBe(-5n);
      expect(fromTwosComplement("0x7F", 16)).toBe(127n);
      expect(fromTwosComplement("0b11111011", 2)).toBe(-5n);
    });

    it("rejects unsupported radix or overflow bit patterns", () => {
      expect(() => fromTwosComplement("10", 10)).toThrowError(NumberConversionError);
      expect(() => fromTwosComplement("111111111", 2, 8)).toThrowError(NumberConversionError);
    });

    it("supports options object", () => {
      expect(fromTwosComplement("11111011", { radix: 2, bitWidth: 8 })).toBe(-5n);
    });

    it("rejects empty or invalid bit patterns", () => {
      expect(() => fromTwosComplement("", 2)).toThrowError(NumberConversionError);
      expect(() => fromTwosComplement("102", 2)).toThrowError(NumberConversionError);
    });
  });

  describe("getTwosComplementInfo and range validation", () => {
    it("provides complete analysis of a number", () => {
      const info = getTwosComplementInfo(-5, 8);
      expect(info.bitWidth).toBe(8);
      expect(info.signBit).toBe("1");
      expect(info.minSigned).toBe(-128n);
      expect(info.maxSigned).toBe(127n);
      expect(info.maxUnsigned).toBe(255n);
      expect(info.binary).toBe("11111011");
      expect(info.hexadecimal).toBe("FB");
    });

    it("validates bit width", () => {
      expect(() => validateBitWidth(0)).toThrowError(NumberConversionError);
      expect(() => validateBitWidth(-5)).toThrowError(NumberConversionError);
      expect(() => validateBitWidth(5000)).toThrowError(NumberConversionError);
    });

    it("validates signed range", () => {
      expect(() => validateSignedIntegerRange(1000n, 8)).toThrowError(NumberConversionError);
    });
  });
});
