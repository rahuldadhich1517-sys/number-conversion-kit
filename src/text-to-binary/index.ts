import {
  NumberConversionError,
  stringToUtf8Bytes,
  utf8BytesToString,
  bytesToAscii,
} from "../shared";

export interface TextToBinaryOptions {
  /**
   * Separator between 8-bit bytes (e.g. " " or ""). Default is " ".
   */
  separator?: string;
  /**
   * Optional prefix for each byte (e.g. "0b" or ""). Default is "".
   */
  prefix?: string;
  /**
   * Group bits within each byte (e.g. nibbles of 4).
   */
  byteGrouping?: boolean;
}

export interface BinaryToTextOptions {
  /**
   * Character encoding: "utf-8" or "ascii". Default is "utf-8".
   */
  encoding?: "utf-8" | "ascii";
  /**
   * Throw error on invalid byte sequence. Default is false (replaces with ).
   */
  fatal?: boolean;
}

export interface TextBinaryInfo {
  binary: string;
  byteLength: number;
  charCount: number;
  text: string;
  encoding: string;
  hasReplacementCharacters: boolean;
}

function cleanBinary(binary: string): string {
  let cleaned = binary.trim();
  cleaned = cleaned.replace(/[\s-]/g, "");
  cleaned = cleaned.replace(/0[bB]/g, "");
  return cleaned;
}

/**
 * Validates whether the binary string represents valid 8-bit byte groups.
 */
export function validateBinaryBytes(binary: string): boolean {
  try {
    const cleaned = cleanBinary(binary);
    if (cleaned.length === 0) return false;
    if (cleaned.length % 8 !== 0) return false;
    return /^[01]+$/.test(cleaned);
  } catch {
    return false;
  }
}

/**
 * Converts text into binary representation of its UTF-8 bytes.
 */
export function textToBinary(text: string, options: TextToBinaryOptions = {}): string {
  const bytes = stringToUtf8Bytes(text);
  const sep = options.separator !== undefined ? options.separator : " ";
  const prefix = options.prefix ?? "";

  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]!.toString(2).padStart(8, "0");
    if (options.byteGrouping) {
      parts.push(`${prefix}${b.slice(0, 4)}_${b.slice(4)}`);
    } else {
      parts.push(`${prefix}${b}`);
    }
  }
  return parts.join(sep);
}

/**
 * Converts binary byte string back into text.
 */
export function binaryToText(binary: string, options: BinaryToTextOptions = {}): string {
  const cleaned = cleanBinary(binary);
  if (cleaned.length === 0) {
    return "";
  }
  if (cleaned.length % 8 !== 0) {
    throw new NumberConversionError(
      `Binary byte sequence length must be a multiple of 8 bits (got ${cleaned.length}): "${binary}"`,
      "INCOMPLETE_BYTE_SEQUENCE",
      { binary, length: cleaned.length }
    );
  }
  if (!/^[01]+$/.test(cleaned)) {
    throw new NumberConversionError(
      `Invalid binary digit in byte sequence: "${binary}"`,
      "INVALID_BINARY",
      { binary }
    );
  }

  const byteLength = cleaned.length / 8;
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    const byteStr = cleaned.slice(i * 8, i * 8 + 8);
    bytes[i] = parseInt(byteStr, 2);
  }

  const encoding = options.encoding ?? "utf-8";
  if (encoding === "ascii") {
    return bytesToAscii(bytes, options.fatal ?? false);
  }
  return utf8BytesToString(bytes, { fatal: options.fatal ?? false });
}

/**
 * Returns detailed metadata for binary text conversion.
 */
export function getTextBinaryInfo(input: string, options: BinaryToTextOptions = {}): TextBinaryInfo {
  const text = binaryToText(input, options);
  const cleaned = cleanBinary(input);
  const byteLength = cleaned.length / 8;
  const encoding = options.encoding ?? "utf-8";
  const hasReplacementCharacters = text.includes("\uFFFD");

  return {
    binary: input,
    byteLength,
    charCount: [...text].length,
    text,
    encoding,
    hasReplacementCharacters,
  };
}
