import {
  NumberConversionError,
  validateSafeIntegerNumber,
  formatBigIntToBase,
  validateBitWidth,
} from "../shared";

export interface DecimalToBinaryOptions {
  /**
   * Include "0b" prefix. Default is false.
   */
  prefix?: boolean | string;
  /**
   * Minimum bit width for zero padding.
   */
  bitWidth?: number;
  /**
   * Zero pad to bitWidth or byte boundary (multiples of 8).
   */
  padZero?: boolean;
  /**
   * Signed negative representation mode:
   * - "mathematical": outputs mathematical negative sign, e.g. "-1010"
   * - "twos-complement": outputs fixed-width two's complement binary representation.
   * Default is "mathematical".
   */
  mode?: "mathematical" | "twos-complement";
  /**
   * Group bits in chunks (e.g. 4 for nibbles, 8 for bytes).
   */
  groupSize?: number;
  /**
   * Group separator, e.g. " ".
   */
  groupSeparator?: string;
}

export interface FormatBinaryIntegerOptions {
  prefix?: boolean | string;
  minWidth?: number;
  groupSize?: number;
  groupSeparator?: string;
}

/**
 * Validates whether the input is a valid decimal integer.
 */
export function validateDecimalInteger(input: bigint | number | string): boolean {
  try {
    if (typeof input === "bigint") return true;
    if (typeof input === "number") {
      validateSafeIntegerNumber(input);
      return true;
    }
    if (typeof input === "string") {
      const trimmed = input.trim();
      if (trimmed.length === 0) return false;
      // Must only contain optional sign and digits 0-9 (with optional separators _ or space)
      const clean = trimmed.replace(/[_ ]/g, "");
      if (!/^[+-]?\d+$/.test(clean)) return false;
      BigInt(clean);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Formats a binary integer string with optional prefix, padding and grouping.
 */
export function formatBinaryInteger(
  binary: string,
  options: FormatBinaryIntegerOptions = {}
): string {
  let isNeg = false;
  let raw = binary.trim();
  if (raw.startsWith("-")) {
    isNeg = true;
    raw = raw.slice(1);
  } else if (raw.startsWith("+")) {
    raw = raw.slice(1);
  }

  if (raw.startsWith("0b") || raw.startsWith("0B")) {
    raw = raw.slice(2);
  }

  raw = raw.replace(/[_ ]/g, "");
  if (!/^[01]+$/.test(raw)) {
    throw new NumberConversionError(`Invalid binary digits: "${binary}"`, "INVALID_BINARY");
  }

  if (options.minWidth && options.minWidth > raw.length) {
    raw = "0".repeat(options.minWidth - raw.length) + raw;
  }

  let formatted = raw;
  if (options.groupSize && options.groupSize > 0) {
    const sep = options.groupSeparator ?? " ";
    const rem = formatted.length % options.groupSize;
    const parts: string[] = [];
    if (rem > 0) {
      parts.push(formatted.slice(0, rem));
    }
    for (let i = rem; i < formatted.length; i += options.groupSize) {
      parts.push(formatted.slice(i, i + options.groupSize));
    }
    formatted = parts.join(sep);
  }

  let prefixStr = "";
  if (typeof options.prefix === "string") {
    prefixStr = options.prefix;
  } else if (options.prefix === true) {
    prefixStr = "0b";
  }

  return isNeg ? `-${prefixStr}${formatted}` : `${prefixStr}${formatted}`;
}

/**
 * Converts decimal integers into binary string.
 */
export function decimalToBinary(
  input: bigint | number | string,
  options: DecimalToBinaryOptions = {}
): string {
  let val: bigint;
  if (typeof input === "bigint") {
    val = input;
  } else if (typeof input === "number") {
    validateSafeIntegerNumber(input);
    val = BigInt(input);
  } else if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      throw new NumberConversionError("Decimal input string cannot be empty", "EMPTY_INPUT");
    }
    const clean = trimmed.replace(/[_ ]/g, "");
    if (!/^[+-]?\d+$/.test(clean)) {
      throw new NumberConversionError(
        `Invalid decimal integer input: "${input}"`,
        "INVALID_DECIMAL",
        { input }
      );
    }
    val = BigInt(clean);
  } else {
    throw new NumberConversionError(
      `Unsupported decimal input type: ${typeof input}`,
      "INVALID_INPUT",
      { input }
    );
  }

  if (options.mode === "twos-complement") {
    const width = options.bitWidth ?? 32;
    validateBitWidth(width);

    const minSigned = -(1n << BigInt(width - 1));
    const maxSigned = (1n << BigInt(width - 1)) - 1n;

    if (val < minSigned || val > maxSigned) {
      throw new NumberConversionError(
        `Integer ${val.toString()} out of range for ${width}-bit two's complement [${minSigned}, ${maxSigned}].`,
        "INTEGER_OUT_OF_RANGE",
        { value: val.toString(), bitWidth: width, min: minSigned.toString(), max: maxSigned.toString() }
      );
    }

    const mask = (1n << BigInt(width)) - 1n;
    const unsignedVal = val < 0n ? (val & mask) : val;
    let bitStr = unsignedVal.toString(2);
    if (bitStr.length < width) {
      bitStr = "0".repeat(width - bitStr.length) + bitStr;
    }

    return formatBinaryInteger(bitStr, {
      prefix: options.prefix,
      groupSize: options.groupSize,
      groupSeparator: options.groupSeparator,
    });
  }

  // Mathematical mode
  return formatBigIntToBase(val, 2, {
    prefix: options.prefix,
    minWidth: options.bitWidth,
    groupSize: options.groupSize,
    groupSeparator: options.groupSeparator,
  });
}
