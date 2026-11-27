import {
  NumberConversionError,
  parseBigIntFromBase,
  bigIntToSafeNumber,
  validateBitWidth,
  groupDigits,
} from "../shared";

export interface HexToDecimalOptions {
  /**
   * Return result as safe JavaScript number.
   * Throws UNSAFE_NUMBER if value exceeds safe integer range.
   */
  asNumber?: boolean;
  /**
   * Return result as decimal string.
   */
  asString?: boolean;
  /**
   * Allow "0x" or "0X" prefix. Default is true.
   */
  allowPrefix?: boolean;
  /**
   * Allow underscore or space digit separators. Default is true.
   */
  allowSeparators?: boolean;
  /**
   * Optional signed two's complement interpretation with explicit bit width.
   * e.g. for signedBitWidth = 8, 0xFF is interpreted as -1.
   */
  signedBitWidth?: number;
}

export interface ValidateHexOptions {
  allowPrefix?: boolean;
  allowSeparators?: boolean;
  allowSign?: boolean;
}

export interface FormatDecimalOptions {
  groupSize?: number;
  groupSeparator?: string;
}

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
 * Formats a decimal result with optional digit grouping.
 */
export function formatDecimalResult(
  value: bigint | number,
  options: FormatDecimalOptions = {}
): string {
  const str = value.toString();
  if (!options.groupSize || options.groupSize <= 0) {
    return str;
  }
  const isNeg = str.startsWith("-");
  const digits = isNeg ? str.slice(1) : str;
  const grouped = groupDigits(digits, options.groupSize, options.groupSeparator ?? ",", "rtl");
  return isNeg ? `-${grouped}` : grouped;
}

/**
 * Converts hexadecimal integers into decimal.
 * Returns BigInt by default, or safe number / string according to options.
 */
export function hexToDecimal(
  input: string,
  options?: { asNumber: true; asString?: false; allowPrefix?: boolean; allowSeparators?: boolean; signedBitWidth?: number }
): number;
export function hexToDecimal(
  input: string,
  options: { asString: true; asNumber?: false; allowPrefix?: boolean; allowSeparators?: boolean; signedBitWidth?: number }
): string;
export function hexToDecimal(
  input: string,
  options?: HexToDecimalOptions
): bigint | number | string;
export function hexToDecimal(
  input: string,
  options: HexToDecimalOptions = {}
): bigint | number | string {
  const { value } = parseBigIntFromBase(input, 16, {
    allowPrefix: options.allowPrefix ?? true,
    allowSeparators: options.allowSeparators ?? true,
    allowSign: true,
  });

  let finalValue = value;

  if (options.signedBitWidth !== undefined) {
    const width = options.signedBitWidth;
    validateBitWidth(width);

    const mask = (1n << BigInt(width)) - 1n;
    if (finalValue < 0n || finalValue > mask) {
      throw new NumberConversionError(
        `Hex value 0x${value.toString(16)} exceeds ${width}-bit range [0, 0x${mask.toString(16)}].`,
        "INTEGER_OUT_OF_RANGE",
        { value: value.toString(16), bitWidth: width }
      );
    }

    const signBit = 1n << BigInt(width - 1);
    if ((finalValue & signBit) !== 0n) {
      // Negative in two's complement
      finalValue = finalValue - (1n << BigInt(width));
    }
  }

  if (options.asNumber) {
    return bigIntToSafeNumber(finalValue);
  }
  if (options.asString) {
    return finalValue.toString(10);
  }
  return finalValue;
}
