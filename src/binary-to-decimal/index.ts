import {
  parseBigIntFromBase,
  bigIntToSafeNumber,
  groupDigits,
} from "../shared";

export interface BinaryToDecimalOptions {
  /**
   * Return result as a JavaScript safe number.
   * Throws UNSAFE_NUMBER if value exceeds safe integer range.
   */
  asNumber?: boolean;
  /**
   * Return result as decimal string.
   */
  asString?: boolean;
  /**
   * Allow "0b" or "0B" prefix. Default is true.
   */
  allowPrefix?: boolean;
  /**
   * Allow underscore or space digit separators. Default is true.
   */
  allowSeparators?: boolean;
  /**
   * Allow leading "+" or "-" sign. Default is true.
   */
  allowSign?: boolean;
}

export interface ValidateBinaryOptions {
  allowPrefix?: boolean;
  allowSeparators?: boolean;
  allowSign?: boolean;
}

export interface FormatBinaryOptions {
  prefix?: boolean | string;
  groupSize?: number;
  groupSeparator?: string;
  minWidth?: number;
  padChar?: string;
}

/**
 * Validates whether the given string is a valid binary integer.
 */
export function validateBinary(input: string, options: ValidateBinaryOptions = {}): boolean {
  try {
    parseBigIntFromBase(input, 2, {
      allowPrefix: options.allowPrefix ?? true,
      allowSeparators: options.allowSeparators ?? true,
      allowSign: options.allowSign ?? true,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Parses a binary string into BigInt.
 */
export function parseBinary(input: string, options: ValidateBinaryOptions = {}): bigint {
  const { value } = parseBigIntFromBase(input, 2, {
    allowPrefix: options.allowPrefix ?? true,
    allowSeparators: options.allowSeparators ?? true,
    allowSign: options.allowSign ?? true,
  });
  return value;
}

/**
 * Formats a binary string with optional prefixes, grouping, and padding.
 */
export function formatBinary(input: string, options: FormatBinaryOptions = {}): string {
  const { isNegative, rawDigits } = parseBigIntFromBase(input, 2, {
    allowPrefix: true,
    allowSeparators: true,
    allowSign: true,
  });

  let digits = rawDigits;
  if (options.minWidth && options.minWidth > digits.length) {
    const padChar = options.padChar ?? "0";
    digits = padChar.repeat(options.minWidth - digits.length) + digits;
  }

  if (options.groupSize && options.groupSize > 0) {
    digits = groupDigits(digits, options.groupSize, options.groupSeparator ?? " ", "rtl");
  }

  let prefixStr = "";
  if (typeof options.prefix === "string") {
    prefixStr = options.prefix;
  } else if (options.prefix === true) {
    prefixStr = "0b";
  }

  const sign = isNegative ? "-" : "";
  return `${sign}${prefixStr}${digits}`;
}

/**
 * Converts a binary integer string into decimal.
 * Returns BigInt by default, or safe number / string based on options.
 */
export function binaryToDecimal(
  input: string,
  options?: { asNumber: true; asString?: false; allowPrefix?: boolean; allowSeparators?: boolean; allowSign?: boolean }
): number;
export function binaryToDecimal(
  input: string,
  options: { asString: true; asNumber?: false; allowPrefix?: boolean; allowSeparators?: boolean; allowSign?: boolean }
): string;
export function binaryToDecimal(
  input: string,
  options?: BinaryToDecimalOptions
): bigint | number | string;
export function binaryToDecimal(
  input: string,
  options: BinaryToDecimalOptions = {}
): bigint | number | string {
  const { value } = parseBigIntFromBase(input, 2, {
    allowPrefix: options.allowPrefix ?? true,
    allowSeparators: options.allowSeparators ?? true,
    allowSign: options.allowSign ?? true,
  });

  if (options.asNumber) {
    return bigIntToSafeNumber(value);
  }
  if (options.asString) {
    return value.toString(10);
  }
  return value;
}
