import { describe, it, expect } from "vitest";
import {
  NumberConversionError,
  validateBase,
  validateBitWidth,
  validateSafeIntegerNumber,
  validateShiftCount,
  charToDigit,
  parseBigIntFromBase,
  formatBigIntToBase,
  bigIntToSafeNumber,
  groupDigits,
  stringToUtf8Bytes,
  utf8BytesToString,
  bytesToAscii,
  bytesToLatin1,
} from "../../src/shared";

describe("shared modules", () => {
  describe("errors.ts", () => {
    it("creates NumberConversionError with code and details", () => {
      const err = new NumberConversionError("Test error", "INVALID_INPUT", { foo: "bar" });
      expect(err.name).toBe("NumberConversionError");
      expect(err.code).toBe("INVALID_INPUT");
      expect(err.details).toEqual({ foo: "bar" });
      expect(err.message).toBe("Test error");
    });
  });

  describe("validation.ts", () => {
    it("validates base", () => {
      expect(() => validateBase(2)).not.toThrow();
      expect(() => validateBase(36)).not.toThrow();
      expect(() => validateBase(1)).toThrow(NumberConversionError);
      expect(() => validateBase(37)).toThrow(NumberConversionError);
      expect(() => validateBase(10.5)).toThrow(NumberConversionError);
      // @ts-expect-error test non-number
      expect(() => validateBase("10")).toThrow(NumberConversionError);
    });

    it("validates bit width", () => {
      expect(() => validateBitWidth(1)).not.toThrow();
      expect(() => validateBitWidth(64)).not.toThrow();
      expect(() => validateBitWidth(4096)).not.toThrow();
      expect(() => validateBitWidth(0)).toThrow(NumberConversionError);
      expect(() => validateBitWidth(-1)).toThrow(NumberConversionError);
      expect(() => validateBitWidth(5000)).toThrow(NumberConversionError);
      expect(() => validateBitWidth(8.5)).toThrow(NumberConversionError);
      // @ts-expect-error test non-number
      expect(() => validateBitWidth("8")).toThrow(NumberConversionError);
    });

    it("validates safe integer number", () => {
      expect(() => validateSafeIntegerNumber(0)).not.toThrow();
      expect(() => validateSafeIntegerNumber(42)).not.toThrow();
      expect(() => validateSafeIntegerNumber(-42)).not.toThrow();
      expect(() => validateSafeIntegerNumber(Number.MAX_SAFE_INTEGER)).not.toThrow();
      expect(() => validateSafeIntegerNumber(NaN)).toThrow(NumberConversionError);
      expect(() => validateSafeIntegerNumber(Infinity)).toThrow(NumberConversionError);
      expect(() => validateSafeIntegerNumber(-Infinity)).toThrow(NumberConversionError);
      expect(() => validateSafeIntegerNumber(3.14)).toThrow(NumberConversionError);
      expect(() => validateSafeIntegerNumber(Number.MAX_SAFE_INTEGER + 10)).toThrow(NumberConversionError);
      // @ts-expect-error test non-number
      expect(() => validateSafeIntegerNumber("42")).toThrow(NumberConversionError);
    });

    it("validates shift count", () => {
      expect(validateShiftCount(0)).toBe(0n);
      expect(validateShiftCount(5)).toBe(5n);
      expect(validateShiftCount(5n)).toBe(5n);
      expect(() => validateShiftCount(-1)).toThrow(NumberConversionError);
      expect(() => validateShiftCount(-1n)).toThrow(NumberConversionError);
      expect(() => validateShiftCount(1.5)).toThrow(NumberConversionError);
      // @ts-expect-error non number/bigint
      expect(() => validateShiftCount("5")).toThrow(NumberConversionError);
      expect(() => validateShiftCount(2000000)).toThrow(NumberConversionError);
    });
  });

  describe("bigint.ts", () => {
    it("maps characters to digits", () => {
      expect(charToDigit("0", 10)).toBe(0);
      expect(charToDigit("9", 10)).toBe(9);
      expect(charToDigit("A", 16)).toBe(10);
      expect(charToDigit("f", 16)).toBe(15);
      expect(charToDigit("z", 36)).toBe(35);
      expect(charToDigit("Z", 36)).toBe(35);
      expect(() => charToDigit("A", 10)).toThrow(NumberConversionError);
      expect(() => charToDigit("?", 10)).toThrow(NumberConversionError);
    });

    it("parses BigInt from base with various options", () => {
      expect(parseBigIntFromBase("1010", 2).value).toBe(10n);
      expect(parseBigIntFromBase("-1010", 2).value).toBe(-10n);
      expect(parseBigIntFromBase("+1010", 2).value).toBe(10n);
      expect(parseBigIntFromBase("0b1010", 2).value).toBe(10n);
      expect(parseBigIntFromBase("0B1010", 2).value).toBe(10n);
      expect(parseBigIntFromBase("0x1F", 16).value).toBe(31n);
      expect(parseBigIntFromBase("0X1F", 16).value).toBe(31n);
      expect(parseBigIntFromBase("0o77", 8).value).toBe(63n);
      expect(parseBigIntFromBase("0O77", 8).value).toBe(63n);

      // @ts-expect-error non-string
      expect(() => parseBigIntFromBase(123, 10)).toThrow(NumberConversionError);
      expect(() => parseBigIntFromBase("", 10)).toThrow(NumberConversionError);
      expect(() => parseBigIntFromBase("   ", 10)).toThrow(NumberConversionError);
      expect(() => parseBigIntFromBase("0b", 2)).toThrow(NumberConversionError);
    });

    it("formats BigInt to base with padding, grouping, prefixes", () => {
      expect(formatBigIntToBase(0n, 10)).toBe("0");
      expect(formatBigIntToBase(255n, 16, { uppercase: true })).toBe("FF");
      expect(formatBigIntToBase(255n, 16, { uppercase: false })).toBe("ff");
      expect(formatBigIntToBase(-255n, 16, { uppercase: true })).toBe("-FF");
      expect(formatBigIntToBase(7n, 2, { minWidth: 8 })).toBe("00000111");
      expect(formatBigIntToBase(255n, 2, { groupSize: 4, groupSeparator: "_" })).toBe("1111_1111");
      expect(formatBigIntToBase(15n, 8, { prefix: true })).toBe("0o17");
      expect(formatBigIntToBase(15n, 16, { prefix: true, uppercase: true })).toBe("0XF");
      expect(formatBigIntToBase(15n, 16, { prefix: true, uppercase: false })).toBe("0xf");
      expect(formatBigIntToBase(15n, 2, { prefix: "0b" })).toBe("0b1111");
    });

    it("converts BigInt to safe number or throws", () => {
      expect(bigIntToSafeNumber(42n)).toBe(42);
      expect(bigIntToSafeNumber(BigInt(Number.MAX_SAFE_INTEGER))).toBe(Number.MAX_SAFE_INTEGER);
      expect(() => bigIntToSafeNumber(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toThrow(
        NumberConversionError
      );
      expect(() => bigIntToSafeNumber(BigInt(Number.MIN_SAFE_INTEGER) - 1n)).toThrow(
        NumberConversionError
      );
    });
  });

  describe("text.ts", () => {
    it("handles groupDigits ltr and rtl", () => {
      expect(groupDigits("1234567", 3, ",", "rtl")).toBe("1,234,567");
      expect(groupDigits("1234567", 3, ",", "ltr")).toBe("123,456,7");
      expect(groupDigits("123", 0)).toBe("123");
      expect(groupDigits("", 3)).toBe("");
    });

    it("encodes and decodes utf8", () => {
      const bytes = stringToUtf8Bytes("hello");
      expect(utf8BytesToString(bytes)).toBe("hello");
      // @ts-expect-error non-string
      expect(() => stringToUtf8Bytes(123)).toThrow(NumberConversionError);
    });

    it("handles bytesToAscii and fatal errors", () => {
      const asciiBytes = new Uint8Array([65, 66, 67]);
      expect(bytesToAscii(asciiBytes)).toBe("ABC");

      const invalidBytes = new Uint8Array([65, 200, 67]);
      expect(bytesToAscii(invalidBytes, false)).toBe("A\uFFFDC");
      expect(() => bytesToAscii(invalidBytes, true)).toThrow(NumberConversionError);
    });

    it("handles bytesToLatin1", () => {
      const latin1Bytes = new Uint8Array([233, 224]);
      expect(bytesToLatin1(latin1Bytes)).toBe("éà");
    });
  });
});
