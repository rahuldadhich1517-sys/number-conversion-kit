import { NumberConversionError } from "./errors";
import { validateBase } from "./validation";

export const DIGITS_LOWER = "0123456789abcdefghijklmnopqrstuvwxyz";
export const DIGITS_UPPER = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Returns character to digit value for a given base.
 */
export function charToDigit(char: string, base: number): number {
  const code = char.charCodeAt(0);
  let val = -1;
  // '0'-'9': 48-57
  if (code >= 48 && code <= 57) {
    val = code - 48;
  }
  // 'A'-'Z': 65-90
  else if (code >= 65 && code <= 90) {
    val = code - 65 + 10;
  }
  // 'a'-'z': 97-122
  else if (code >= 97 && code <= 122) {
    val = code - 97 + 10;
  }

  if (val < 0 || val >= base) {
    throw new NumberConversionError(
      `Invalid digit '${char}' for base ${base}.`,
      "INVALID_DIGIT_FOR_BASE",
      { char, base }
    );
  }
  return val;
}

export interface ParseBigIntOptions {
  allowPrefix?: boolean;
  allowSeparators?: boolean;
  allowSign?: boolean;
}

/**
 * Parses an integer string in any base 2..36 into a BigInt without precision loss.
 */
export function parseBigIntFromBase(
  input: string,
  base: number,
  options: ParseBigIntOptions = {}
): { value: bigint; isNegative: boolean; rawDigits: string; prefix: string } {
  validateBase(base);

  if (typeof input !== "string") {
    throw new NumberConversionError(
      `Input must be a string, received ${typeof input}`,
      "INVALID_INPUT",
      { input }
    );
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new NumberConversionError("Input string cannot be empty", "EMPTY_INPUT");
  }

  let index = 0;
  let isNegative = false;

  if (options.allowSign !== false) {
    if (trimmed[0] === "-") {
      isNegative = true;
      index++;
    } else if (trimmed[0] === "+") {
      index++;
    }
  }

  // Check prefix
  let prefix = "";
  if (options.allowPrefix !== false) {
    const rem = trimmed.slice(index);
    if (base === 2 && (rem.startsWith("0b") || rem.startsWith("0B"))) {
      prefix = rem.slice(0, 2);
      index += 2;
    } else if (base === 16 && (rem.startsWith("0x") || rem.startsWith("0X"))) {
      prefix = rem.slice(0, 2);
      index += 2;
    } else if (base === 8 && (rem.startsWith("0o") || rem.startsWith("0O"))) {
      prefix = rem.slice(0, 2);
      index += 2;
    }
  }

  let digitsPart = trimmed.slice(index);
  if (options.allowSeparators !== false) {
    // Support underscores or spaces as separators if configured/allowed
    digitsPart = digitsPart.replace(/[_ ]/g, "");
  }

  if (digitsPart.length === 0) {
    throw new NumberConversionError(
      `No valid digits found in input: "${input}"`,
      "INVALID_INPUT",
      { input }
    );
  }

  const baseBig = BigInt(base);
  let result = 0n;

  for (let i = 0; i < digitsPart.length; i++) {
    const char = digitsPart[i]!;
    const digitVal = charToDigit(char, base);
    result = result * baseBig + BigInt(digitVal);
  }

  const finalVal = isNegative ? -result : result;
  return {
    value: finalVal,
    isNegative,
    rawDigits: digitsPart,
    prefix,
  };
}

export interface FormatBigIntOptions {
  uppercase?: boolean;
  prefix?: boolean | string;
  minWidth?: number;
  groupSize?: number;
  groupSeparator?: string;
  padChar?: string;
}

/**
 * Formats a BigInt into a string of the specified base (2..36).
 */
export function formatBigIntToBase(
  value: bigint,
  base: number,
  options: FormatBigIntOptions = {}
): string {
  validateBase(base);

  const isNegative = value < 0n;
  const absValue = isNegative ? -value : value;

  const alphabet = options.uppercase ? DIGITS_UPPER : DIGITS_LOWER;
  const baseBig = BigInt(base);

  let digits: string;
  if (absValue === 0n) {
    digits = "0";
  } else {
    let current = absValue;
    const chars: string[] = [];
    while (current > 0n) {
      const rem = Number(current % baseBig);
      chars.push(alphabet[rem]!);
      current = current / baseBig;
    }
    digits = chars.reverse().join("");
  }

  // Padding
  if (options.minWidth && options.minWidth > digits.length) {
    const padChar = options.padChar ?? "0";
    digits = padChar.repeat(options.minWidth - digits.length) + digits;
  }

  // Grouping
  if (options.groupSize && options.groupSize > 0) {
    const sep = options.groupSeparator ?? " ";
    const len = digits.length;
    const groups: string[] = [];
    const rem = len % options.groupSize;
    if (rem > 0) {
      groups.push(digits.slice(0, rem));
    }
    for (let i = rem; i < len; i += options.groupSize) {
      groups.push(digits.slice(i, i + options.groupSize));
    }
    digits = groups.join(sep);
  }

  // Prefix
  let prefixStr = "";
  if (typeof options.prefix === "string") {
    prefixStr = options.prefix;
  } else if (options.prefix === true) {
    if (base === 2) prefixStr = "0b";
    else if (base === 8) prefixStr = "0o";
    else if (base === 16) prefixStr = options.uppercase ? "0X" : "0x";
  }

  return isNegative ? `-${prefixStr}${digits}` : `${prefixStr}${digits}`;
}

/**
 * Converts BigInt to safe number or throws UNSAFE_NUMBER.
 */
export function bigIntToSafeNumber(val: bigint): number {
  if (val > BigInt(Number.MAX_SAFE_INTEGER) || val < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new NumberConversionError(
      `Value ${val.toString()} exceeds JavaScript safe integer range [${Number.MIN_SAFE_INTEGER}, ${Number.MAX_SAFE_INTEGER}].`,
      "UNSAFE_NUMBER",
      { value: val.toString() }
    );
  }
  return Number(val);
}
