import { describe, it, expect } from "vitest";
import {
  textToBinary,
  binaryToText,
  validateBinaryBytes,
  getTextBinaryInfo,
} from "../../src/text-to-binary";
import { NumberConversionError } from "../../src/shared";

describe("text-to-binary", () => {
  it("converts ASCII text to binary and back", () => {
    const text = "Hi";
    const bin = textToBinary(text);
    expect(bin).toBe("01001000 01101001");
    expect(binaryToText(bin)).toBe("Hi");
  });

  it("converts multibyte UTF-8 characters and emoji", () => {
    const text = "Rust 🦀";
    const bin = textToBinary(text);
    expect(binaryToText(bin)).toBe(text);
  });

  it("supports byte grouping and prefixes", () => {
    const bin = textToBinary("A", { byteGrouping: true, prefix: "0b" });
    expect(bin).toBe("0b0100_0001");
  });

  it("validates binary bytes with validateBinaryBytes", () => {
    expect(validateBinaryBytes("01001000 01101001")).toBe(true);
    expect(validateBinaryBytes("0b01001000")).toBe(true);
    expect(validateBinaryBytes("0100100")).toBe(false); // 7 bits, incomplete byte
    expect(validateBinaryBytes("")).toBe(false);
    expect(validateBinaryBytes("01001002")).toBe(false);
  });

  it("throws INCOMPLETE_BYTE_SEQUENCE on non-multiple of 8 bits", () => {
    expect(() => binaryToText("0100100")).toThrowError(NumberConversionError);
    try {
      binaryToText("0100100");
    } catch (err) {
      expect((err as NumberConversionError).code).toBe("INCOMPLETE_BYTE_SEQUENCE");
    }
  });

  it("handles invalid UTF-8 bytes with fatal option", () => {
    // 11111111 is invalid leading byte in UTF-8
    const invalidBin = "11111111 11111111";
    expect(binaryToText(invalidBin, { fatal: false })).toBe("\uFFFD\uFFFD");
    expect(() => binaryToText(invalidBin, { fatal: true })).toThrowError(
      NumberConversionError
    );
  });

  it("returns detailed metadata from getTextBinaryInfo", () => {
    const info = getTextBinaryInfo("01001000 01101001");
    expect(info.byteLength).toBe(2);
    expect(info.charCount).toBe(2);
    expect(info.text).toBe("Hi");
    expect(info.hasReplacementCharacters).toBe(false);
  });
});
