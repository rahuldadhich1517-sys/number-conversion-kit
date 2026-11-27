import { describe, it, expect } from "vitest";
import {
  hexToText,
  textToHex,
  validateHexBytes,
  getHexTextInfo,
} from "../../src/hex-to-text";
import { NumberConversionError } from "../../src/shared";

describe("hex-to-text", () => {
  it("converts ASCII text to hex and back", () => {
    const text = "Hello World";
    const hex = textToHex(text);
    expect(hex).toBe("48656C6C6F20576F726C64");
    expect(hexToText(hex)).toBe(text);
  });

  it("converts multibyte UTF-8 and emoji correctly", () => {
    const text = "Hello 🌍! 你好";
    const hex = textToHex(text);
    expect(hexToText(hex)).toBe(text);
  });

  it("supports separator and prefix options in textToHex", () => {
    const hex = textToHex("Hello", {
      uppercase: true,
      separator: " ",
    });
    expect(hex).toBe("48 65 6C 6C 6F");

    const prefixed = textToHex("Hi", { prefix: "0x", separator: "," });
    expect(prefixed).toBe("0x48,0x69");
  });

  it("handles empty input gracefully", () => {
    expect(textToHex("")).toBe("");
    expect(hexToText("")).toBe("");
  });

  it("supports ASCII encoding and Latin-1 encoding", () => {
    const asciiHex = textToHex("ABC");
    expect(hexToText(asciiHex, { encoding: "ascii" })).toBe("ABC");
    expect(hexToText(asciiHex, { encoding: "latin-1" })).toBe("ABC");
  });

  it("throws INCOMPLETE_BYTE_SEQUENCE for odd-length hex strings", () => {
    expect(() => hexToText("486")).toThrowError(NumberConversionError);
    try {
      hexToText("486");
    } catch (err) {
      expect((err as NumberConversionError).code).toBe("INCOMPLETE_BYTE_SEQUENCE");
    }
  });

  it("handles invalid UTF-8 bytes with fatal vs non-fatal modes", () => {
    // 0xFF 0xFF is invalid UTF-8 sequence
    const invalidUtf8Hex = "FFFF";
    expect(hexToText(invalidUtf8Hex, { fatal: false })).toBe("\uFFFD\uFFFD");
    expect(() => hexToText(invalidUtf8Hex, { fatal: true })).toThrowError(
      NumberConversionError
    );
  });

  it("validates hex bytes with validateHexBytes", () => {
    expect(validateHexBytes("48656C6C6F")).toBe(true);
    expect(validateHexBytes("48 65 6C")).toBe(true);
    expect(validateHexBytes("0x48 0x65")).toBe(true);
    expect(validateHexBytes("")).toBe(false);
    expect(validateHexBytes("486")).toBe(false); // odd length
    expect(validateHexBytes("ZZZZ")).toBe(false);
  });

  it("returns detailed metadata from getHexTextInfo", () => {
    const info = getHexTextInfo("48656C6C6F");
    expect(info.byteLength).toBe(5);
    expect(info.charCount).toBe(5);
    expect(info.text).toBe("Hello");
    expect(info.encoding).toBe("utf-8");
    expect(info.hasReplacementCharacters).toBe(false);
  });
});
