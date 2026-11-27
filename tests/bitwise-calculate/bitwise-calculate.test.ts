import { describe, it, expect } from "vitest";
import {
  bitwiseCalculate,
  bitwiseAnd,
  bitwiseOr,
  bitwiseXor,
  bitwiseNot,
  leftShift,
  rightShift,
  unsignedRightShift,
  formatBitwiseResult,
} from "../../src/bitwise-calculate";
import { NumberConversionError } from "../../src/shared";

describe("bitwise-calculate", () => {
  describe("32-bit Number operations", () => {
    it("evaluates AND, OR, XOR, NOT on 32-bit Numbers", () => {
      expect(bitwiseAnd(12, 10)).toBe(8);
      expect(bitwiseOr(12, 10)).toBe(14);
      expect(bitwiseXor(12, 10)).toBe(6);
      expect(bitwiseNot(12)).toBe(-13);
    });

    it("evaluates shifts on 32-bit Numbers", () => {
      expect(leftShift(5, 2)).toBe(20);
      expect(rightShift(-20, 2)).toBe(-5);
      expect(unsignedRightShift(-1, 0)).toBe(4294967295);
      expect(unsignedRightShift(-20, 2)).toBe(1073741819);
    });
  });

  describe("arbitrary-width BigInt operations", () => {
    it("evaluates AND, OR, XOR, NOT on BigInts", () => {
      expect(bitwiseAnd(12n, 10n)).toBe(8n);
      expect(bitwiseOr(12n, 10n)).toBe(14n);
      expect(bitwiseXor(12n, 10n)).toBe(6n);
      expect(bitwiseNot(12n)).toBe(-13n);
    });

    it("evaluates shifts on BigInts", () => {
      expect(leftShift(5n, 2n)).toBe(20n);
      expect(rightShift(-20n, 2n)).toBe(-5n);
      const huge = 1n << 100n;
      expect(rightShift(huge, 50n)).toBe(1n << 50n);
    });

    it("rejects unsigned right shift for BigInt with UNSUPPORTED_UNSIGNED_BIGINT_SHIFT", () => {
      expect(() => unsignedRightShift(10n, 2n)).toThrowError(NumberConversionError);
      try {
        unsignedRightShift(10n, 2n);
      } catch (err) {
        expect((err as NumberConversionError).code).toBe("UNSUPPORTED_UNSIGNED_BIGINT_SHIFT");
      }
    });

    it("rejects mixing BigInt and Number operands", () => {
      expect(() => bitwiseAnd(10n, 5)).toThrowError(NumberConversionError);
      expect(() => bitwiseOr(10, 5n)).toThrowError(NumberConversionError);
    });
  });

  describe("shift validation", () => {
    it("rejects negative shift counts", () => {
      expect(() => leftShift(5, -1)).toThrowError(NumberConversionError);
      expect(() => rightShift(5n, -1n)).toThrowError(NumberConversionError);
    });

    it("rejects unreasonably large shifts", () => {
      expect(() => leftShift(5n, 20000000n)).toThrowError(NumberConversionError);
    });
  });

  describe("bitwiseCalculate orchestrator and formatBitwiseResult", () => {
    it("calculates detailed breakdown for BigInt operation", () => {
      const res = bitwiseCalculate({
        operation: "AND",
        left: 12n,
        right: 10n,
      });
      expect(res.operation).toBe("AND");
      expect(res.isBigInt).toBe(true);
      expect(res.value).toBe(8n);
      expect(res.decimal).toBe("8");
      expect(res.binary).toBe("1000");
      expect(res.hexadecimal).toBe("8");
      expect(res.explanation).toContain("Bitwise AND");
    });

    it("calculates breakdown for 32-bit Number operation with signed and unsigned values", () => {
      const res = bitwiseCalculate({
        operation: "NOT",
        left: 0,
      });
      expect(res.operation).toBe("NOT");
      expect(res.value).toBe(-1);
      expect(res.signed32).toBe(-1);
      expect(res.unsigned32).toBe(4294967295);
      expect(res.binary).toBe("11111111111111111111111111111111");
      expect(res.hexadecimal).toBe("FFFFFFFF");
    });

    it("formats bitwise results nicely with lowercase and BigInt", () => {
      const res = bitwiseCalculate({
        operation: "OR",
        left: 12,
        right: 10,
      });
      const formatted = formatBitwiseResult(res, {
        includePrefix: true,
        groupSize: 4,
        uppercaseHex: false,
      });
      expect(formatted.hex).toBe("0xe");
      expect(formatted.binary).toBe("0b0000 0000 0000 0000 0000 0000 0000 1110");

      const bigRes = bitwiseCalculate({
        operation: "XOR",
        left: 255n,
        right: 15n,
      });
      const formattedBig = formatBitwiseResult(bigRes, {
        uppercaseHex: false,
        includePrefix: true,
      });
      expect(formattedBig.hex).toBe("0xf0");
    });

    it("handles LEFT_SHIFT and RIGHT_SHIFT in bitwiseCalculate", () => {
      const ls = bitwiseCalculate({ operation: "LEFT_SHIFT", left: 1, right: 2 });
      expect(ls.value).toBe(4);
      const rs = bitwiseCalculate({ operation: "RIGHT_SHIFT", left: 16, right: 2 });
      expect(rs.value).toBe(4);
      const urs = bitwiseCalculate({ operation: "UNSIGNED_RIGHT_SHIFT", left: -1, right: 0 });
      expect(urs.value).toBe(4294967295);
    });

    it("throws when right operand is missing for binary operation or invalid op", () => {
      expect(() =>
        bitwiseCalculate({
          operation: "AND",
          left: 10,
        })
      ).toThrowError(NumberConversionError);

      expect(() =>
        bitwiseCalculate({
          // @ts-expect-error test invalid op
          operation: "UNKNOWN",
          left: 10,
        })
      ).toThrowError(NumberConversionError);
    });
  });
});
