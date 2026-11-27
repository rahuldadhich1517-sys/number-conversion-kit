import {
  NumberConversionError,
  parseBigIntFromBase,
  formatBigIntToBase,
  groupDigits,
} from "../shared";

export interface HexToBinaryOptions {
  /**
   * Include "0b" prefix in binary output.
   */
  prefix?: boolean | string;
  /**
   * Preserve input leading zeros by converting each hex character into 4 binary bits.
   * Default is false (standard numerical conversion).
   */
  preserveLeadingZeros?: boolean;
  /**
   * Pad output to a multiple of 4 bits (nibble alignment).
   */
  nibbleAligned?: boolean;
  /**
   * Fixed bit width for output with zero padding.
   */
  bitWidth?: number;
  /**
   * Allow "0x" or "0X" prefix in input. Default is true.
   */
  allowPrefix?: boolean;
  /**
   * Allow underscores or spaces as separators. Default is true.
   */
  allowSeparators?: boolean;
  /**
   * Group bits in chunks (e.g. 4 for nibbles, 8 for bytes).
   */
  groupSize?: number;
  /**
   * Group separator, e.g. " ".
   */
  groupSeparator?: string;
}

export interface ValidateHexOptions {
  allowPrefix?: boolean;
  allowSeparators?: boolean;
  allowSign?: boolean;
}

export interface ParseHexOptions {
  allowPrefix?: boolean;
  allowSeparators?: boolean;
  allowSign?: boolean;
}

const HEX_TO_NIBBLE: Record<string, string> = {
  "0": "0000", "1": "0001", "2": "0010", "3": "0011",
  "4": "0100", "5": "0101", "6": "0110", "7": "0111",
  "8": "1000", "9": "1001", "a": "1010", "b": "1011",
  "c": "1100", "d": "1101", "e": "1110", "f": "1111",
  "A": "1010", "B": "1011", "C": "1100", "D": "1101",
  "E": "1110", "F": "1111",
};

/**
 * Validates whether the given string is a valid hexadecimal integer.
 */
export function validateHexadecimal(input: string, options: ValidateHexOptions = {}): boolean {
  try {
    parseBigIntFromBase(input, 16, {
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
 * Parses a hexadecimal string into BigInt.
 */
export function parseHexadecimal(input: string, options: ParseHexOptions = {}): bigint {
  const { value } = parseBigIntFromBase(input, 16, {
    allowPrefix: options.allowPrefix ?? true,
    allowSeparators: options.allowSeparators ?? true,
    allowSign: options.allowSign ?? true,
  });
  return value;
}

/**
 * Converts a hexadecimal integer string into binary.
 */
export function hexToBinary(input: string, options: HexToBinaryOptions = {}): string {
  const { isNegative, rawDigits, value } = parseBigIntFromBase(input, 16, {
    allowPrefix: options.allowPrefix ?? true,
    allowSeparators: options.allowSeparators ?? true,
    allowSign: true,
  });

  let binaryStr: string;

  if (options.preserveLeadingZeros) {
    let bits = "";
    for (let i = 0; i < rawDigits.length; i++) {
      const char = rawDigits[i]!;
      const nibble = HEX_TO_NIBBLE[char];
      if (!nibble) {
        throw new NumberConversionError(`Invalid hex character: '${char}'`, "INVALID_HEXADECIMAL");
      }
      bits += nibble;
    }
    binaryStr = bits;
  } else {
    // Pure numerical BigInt conversion
    binaryStr = formatBigIntToBase(value < 0n ? -value : value, 2);
  }

  if (options.nibbleAligned && binaryStr.length % 4 !== 0) {
    const padCount = 4 - (binaryStr.length % 4);
    binaryStr = "0".repeat(padCount) + binaryStr;
  }

  if (options.bitWidth && options.bitWidth > binaryStr.length) {
    binaryStr = "0".repeat(options.bitWidth - binaryStr.length) + binaryStr;
  }

  if (options.groupSize && options.groupSize > 0) {
    binaryStr = groupDigits(binaryStr, options.groupSize, options.groupSeparator ?? " ", "rtl");
  }

  let prefixStr = "";
  if (typeof options.prefix === "string") {
    prefixStr = options.prefix;
  } else if (options.prefix === true) {
    prefixStr = "0b";
  }

  const sign = isNegative ? "-" : "";
  return `${sign}${prefixStr}${binaryStr}`;
}
