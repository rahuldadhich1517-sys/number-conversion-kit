import {
  NumberConversionError,
  stringToUtf8Bytes,
  utf8BytesToString,
  bytesToAscii,
  bytesToLatin1,
} from "../shared";

export interface HexToTextOptions {
  /**
   * Character encoding: "utf-8", "ascii", or "latin-1".
   * Default is "utf-8".
   */
  encoding?: "utf-8" | "ascii" | "latin-1";
  /**
   * Throw error on invalid byte sequence. Default is false (replaces with ).
   */
  fatal?: boolean;
}

export interface TextToHexOptions {
  /**
   * Uppercase hexadecimal characters. Default is true.
   */
  uppercase?: boolean;
  /**
   * Separator between bytes (e.g. " " or ""). Default is "".
   */
  separator?: string;
  /**
   * Prefix for each byte (e.g. "0x" or ""). Default is "".
   */
  prefix?: string;
}

export interface HexTextInfo {
  hex: string;
  byteLength: number;
  charCount: number;
  text: string;
  encoding: string;
  hasReplacementCharacters: boolean;
}

function cleanHex(hex: string): string {
  let cleaned = hex.trim();
  // Strip spaces, dashes, colons
  cleaned = cleaned.replace(/[\s-:]/g, "");
  // Strip 0x/0X prefix per-byte if someone did "0x480x65" or leading "0x"
  cleaned = cleaned.replace(/0[xX]/g, "");
  return cleaned;
}

/**
 * Validates whether the given string is a valid sequence of hexadecimal bytes (even length, hex chars).
 */
export function validateHexBytes(hex: string): boolean {
  try {
    const cleaned = cleanHex(hex);
    if (cleaned.length === 0) return false;
    if (cleaned.length % 2 !== 0) return false;
    return /^[0-9a-fA-F]+$/.test(cleaned);
  } catch {
    return false;
  }
}

/**
 * Converts hexadecimal bytes into text.
 */
export function hexToText(hex: string, options: HexToTextOptions = {}): string {
  const cleaned = cleanHex(hex);
  if (cleaned.length === 0) {
    return "";
  }
  if (cleaned.length % 2 !== 0) {
    throw new NumberConversionError(
      `Hex string must have an even number of characters (got ${cleaned.length}): "${hex}"`,
      "INCOMPLETE_BYTE_SEQUENCE",
      { hex, length: cleaned.length }
    );
  }
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
    throw new NumberConversionError(
      `Invalid hexadecimal character in byte sequence: "${hex}"`,
      "INVALID_HEXADECIMAL",
      { hex }
    );
  }

  const byteLength = cleaned.length / 2;
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    const byteStr = cleaned.slice(i * 2, i * 2 + 2);
    bytes[i] = parseInt(byteStr, 16);
  }

  const encoding = options.encoding ?? "utf-8";
  if (encoding === "ascii") {
    return bytesToAscii(bytes, options.fatal ?? false);
  }
  if (encoding === "latin-1") {
    return bytesToLatin1(bytes);
  }
  return utf8BytesToString(bytes, { fatal: options.fatal ?? false });
}

/**
 * Converts text into hexadecimal bytes.
 */
export function textToHex(text: string, options: TextToHexOptions = {}): string {
  const bytes = stringToUtf8Bytes(text);
  const sep = options.separator ?? "";
  const prefix = options.prefix ?? "";
  const uppercase = options.uppercase ?? true;

  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    let hex = bytes[i]!.toString(16).padStart(2, "0");
    if (uppercase) hex = hex.toUpperCase();
    parts.push(`${prefix}${hex}`);
  }
  return parts.join(sep);
}

/**
 * Returns detailed byte and encoding metadata for hex text conversion.
 */
export function getHexTextInfo(input: string, options: HexToTextOptions = {}): HexTextInfo {
  const text = hexToText(input, options);
  const cleaned = cleanHex(input);
  const byteLength = cleaned.length / 2;
  const encoding = options.encoding ?? "utf-8";
  const hasReplacementCharacters = text.includes("\uFFFD");

  return {
    hex: input,
    byteLength,
    charCount: [...text].length, // Unicode code point count
    text,
    encoding,
    hasReplacementCharacters,
  };
}
