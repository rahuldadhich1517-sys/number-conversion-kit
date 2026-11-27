import { NumberConversionError } from "./errors";

/**
 * Formats a string by grouping digits with a separator.
 */
export function groupDigits(
  str: string,
  groupSize: number,
  separator: string = " ",
  direction: "rtl" | "ltr" = "rtl"
): string {
  if (groupSize <= 0) return str;
  if (!str) return str;

  if (direction === "ltr") {
    const parts: string[] = [];
    for (let i = 0; i < str.length; i += groupSize) {
      parts.push(str.slice(i, i + groupSize));
    }
    return parts.join(separator);
  } else {
    const parts: string[] = [];
    const rem = str.length % groupSize;
    if (rem > 0) {
      parts.push(str.slice(0, rem));
    }
    for (let i = rem; i < str.length; i += groupSize) {
      parts.push(str.slice(i, i + groupSize));
    }
    return parts.join(separator);
  }
}

/**
 * Encodes string to UTF-8 Uint8Array using standard TextEncoder.
 */
export function stringToUtf8Bytes(text: string): Uint8Array {
  if (typeof text !== "string") {
    throw new NumberConversionError(
      `Text must be a string, received ${typeof text}`,
      "INVALID_INPUT",
      { text }
    );
  }
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

/**
 * Decodes UTF-8 Uint8Array to string using TextDecoder.
 */
export function utf8BytesToString(
  bytes: Uint8Array,
  options: { fatal?: boolean } = {}
): string {
  try {
    const decoder = new TextDecoder("utf-8", { fatal: options.fatal ?? false });
    return decoder.decode(bytes);
  } catch (err) {
    throw new NumberConversionError(
      `Invalid UTF-8 byte sequence: ${(err as Error).message}`,
      "INVALID_UTF8"
    );
  }
}

/**
 * Decodes bytes as ASCII characters, checking if any byte > 127.
 */
export function bytesToAscii(bytes: Uint8Array, fatal: boolean = false): string {
  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]!;
    if (b > 127) {
      if (fatal) {
        throw new NumberConversionError(
          `Byte 0x${b.toString(16).toUpperCase()} at position ${i} is outside ASCII range (0-127).`,
          "INVALID_INPUT",
          { position: i, byte: b }
        );
      }
      result += "\uFFFD";
    } else {
      result += String.fromCharCode(b);
    }
  }
  return result;
}

/**
 * Decodes bytes as ISO-8859-1 (Latin-1).
 */
export function bytesToLatin1(bytes: Uint8Array): string {
  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]!);
  }
  return result;
}
