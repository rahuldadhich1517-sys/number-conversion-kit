import {
  NumberConversionError,
  validateBitWidth,
  validateSafeIntegerNumber,
} from "../shared";

export { validateBitWidth } from "../shared";

export interface ToTwosComplementOptions {
  includePrefix?: boolean;
}

export interface TwosComplementResult {
  value: bigint;
  bitWidth: number;
  binary: string;
  hexadecimal: string;
  decimal: string;
  unsignedValue: bigint;
  isNegative: boolean;
}

export interface TwosComplementInfo {
  value: bigint;
  bitWidth: number;
  isNegative: boolean;
  signBit: "0" | "1";
  minSigned: bigint;
  maxSigned: bigint;
  maxUnsigned: bigint;
  binary: string;
  hexadecimal: string;
  unsignedValue: bigint;
  signedRangeDescription: string;
  unsignedRangeDescription: string;
}

/**
 * Validates that signed integer fits within the two's complement range for the given bit width.
 */
export function validateSignedIntegerRange(value: bigint, bitWidth: number): void {
  validateBitWidth(bitWidth);
  const min = -(1n << BigInt(bitWidth - 1));
  const max = (1n << BigInt(bitWidth - 1)) - 1n;

  if (value < min || value > max) {
    throw new NumberConversionError(
      `Value ${value.toString()} is out of signed range [${min.toString()}, ${max.toString()}] for ${bitWidth}-bit width.`,
      "INTEGER_OUT_OF_RANGE",
      { value: value.toString(), bitWidth, min: min.toString(), max: max.toString() }
    );
  }
}

function normalizeBigInt(input: bigint | number | string): bigint {
  if (typeof input === "bigint") return input;
  if (typeof input === "number") {
    validateSafeIntegerNumber(input);
    return BigInt(input);
  }
  if (typeof input === "string") {
    const trimmed = input.trim().replace(/[_ ]/g, "");
    if (trimmed.length === 0) {
      throw new NumberConversionError("Input string cannot be empty", "EMPTY_INPUT");
    }
    try {
      return BigInt(trimmed);
    } catch {
      throw new NumberConversionError(
        `Invalid integer string: "${input}"`,
        "INVALID_DECIMAL",
        { input }
      );
    }
  }
  throw new NumberConversionError(
    `Unsupported input type: ${typeof input}`,
    "INVALID_INPUT",
    { input }
  );
}

/**
 * Converts a signed integer to fixed-width two's complement representations.
 */
export function toTwosComplement(
  value: bigint | number | string,
  bitWidth: number,
  options: ToTwosComplementOptions = {}
): TwosComplementResult {
  validateBitWidth(bitWidth);
  const bigVal = normalizeBigInt(value);
  validateSignedIntegerRange(bigVal, bitWidth);

  const mask = (1n << BigInt(bitWidth)) - 1n;
  const unsignedVal = bigVal < 0n ? (bigVal & mask) : bigVal;

  let binary = unsignedVal.toString(2);
  if (binary.length < bitWidth) {
    binary = "0".repeat(bitWidth - binary.length) + binary;
  }

  const hexChars = Math.ceil(bitWidth / 4);
  let hex = unsignedVal.toString(16).toUpperCase();
  if (hex.length < hexChars) {
    hex = "0".repeat(hexChars - hex.length) + hex;
  }

  if (options.includePrefix) {
    binary = `0b${binary}`;
    hex = `0x${hex}`;
  }

  return {
    value: bigVal,
    bitWidth,
    binary,
    hexadecimal: hex,
    decimal: bigVal.toString(),
    unsignedValue: unsignedVal,
    isNegative: bigVal < 0n,
  };
}

/**
 * Converts a two's complement bit pattern string back into a signed BigInt.
 * Can be called as:
 * - `fromTwosComplement(bits, 2)` (radix 2, bitWidth inferred from bits length)
 * - `fromTwosComplement(bits, 2, 8)` (radix 2, explicit bitWidth 8)
 * - `fromTwosComplement(bits, { radix?: number, bitWidth?: number })`
 */
export function fromTwosComplement(
  bits: string,
  radixOrOptions?: number | { radix?: number; bitWidth?: number },
  explicitBitWidth?: number
): bigint {
  if (typeof bits !== "string") {
    throw new NumberConversionError(
      `Bits must be a string, received ${typeof bits}`,
      "INVALID_INPUT",
      { bits }
    );
  }

  let radix = 2;
  let bitWidth: number | undefined = explicitBitWidth;

  if (typeof radixOrOptions === "number") {
    radix = radixOrOptions;
  } else if (typeof radixOrOptions === "object" && radixOrOptions !== null) {
    radix = radixOrOptions.radix ?? 2;
    bitWidth = radixOrOptions.bitWidth ?? bitWidth;
  }

  let cleaned = bits.trim().replace(/[_ ]/g, "");
  if (cleaned.length === 0) {
    throw new NumberConversionError("Bits string cannot be empty", "EMPTY_INPUT");
  }

  if (radix === 2) {
    if (cleaned.startsWith("0b") || cleaned.startsWith("0B")) {
      cleaned = cleaned.slice(2);
    }
    if (!/^[01]+$/.test(cleaned)) {
      throw new NumberConversionError(
        `Invalid binary bit pattern: "${bits}"`,
        "INVALID_BINARY",
        { bits }
      );
    }
  } else if (radix === 16) {
    if (cleaned.startsWith("0x") || cleaned.startsWith("0X")) {
      cleaned = cleaned.slice(2);
    }
    if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
      throw new NumberConversionError(
        `Invalid hexadecimal bit pattern: "${bits}"`,
        "INVALID_HEXADECIMAL",
        { bits }
      );
    }
  } else {
    throw new NumberConversionError(
      `Unsupported radix for two's complement decoding: ${radix}. Must be 2 or 16.`,
      "INVALID_BASE",
      { radix }
    );
  }

  const effectiveWidth = bitWidth ?? (radix === 2 ? cleaned.length : cleaned.length * 4);
  validateBitWidth(effectiveWidth);

  // Parse unsigned value
  let unsignedVal: bigint;
  if (radix === 2) {
    unsignedVal = BigInt(`0b${cleaned}`);
  } else {
    unsignedVal = BigInt(`0x${cleaned}`);
  }

  const maxUnsigned = (1n << BigInt(effectiveWidth)) - 1n;
  if (unsignedVal > maxUnsigned) {
    throw new NumberConversionError(
      `Bit pattern "${bits}" exceeds ${effectiveWidth}-bit maximum capacity.`,
      "INTEGER_OUT_OF_RANGE",
      { bits, effectiveWidth }
    );
  }

  const signBit = 1n << BigInt(effectiveWidth - 1);
  if ((unsignedVal & signBit) !== 0n) {
    // Negative
    return unsignedVal - (1n << BigInt(effectiveWidth));
  }
  return unsignedVal;
}

/**
 * Returns comprehensive two's complement analysis for any value and bit width.
 */
export function getTwosComplementInfo(
  value: bigint | number | string,
  bitWidth: number
): TwosComplementInfo {
  validateBitWidth(bitWidth);
  const bigVal = normalizeBigInt(value);
  validateSignedIntegerRange(bigVal, bitWidth);

  const minSigned = -(1n << BigInt(bitWidth - 1));
  const maxSigned = (1n << BigInt(bitWidth - 1)) - 1n;
  const maxUnsigned = (1n << BigInt(bitWidth)) - 1n;

  const mask = maxUnsigned;
  const unsignedVal = bigVal < 0n ? (bigVal & mask) : bigVal;

  let binary = unsignedVal.toString(2);
  if (binary.length < bitWidth) {
    binary = "0".repeat(bitWidth - binary.length) + binary;
  }

  const hexChars = Math.ceil(bitWidth / 4);
  let hex = unsignedVal.toString(16).toUpperCase();
  if (hex.length < hexChars) {
    hex = "0".repeat(hexChars - hex.length) + hex;
  }

  const signBit = binary[0] as "0" | "1";

  return {
    value: bigVal,
    bitWidth,
    isNegative: bigVal < 0n,
    signBit,
    minSigned,
    maxSigned,
    maxUnsigned,
    binary,
    hexadecimal: hex,
    unsignedValue: unsignedVal,
    signedRangeDescription: `[${minSigned.toString()}, ${maxSigned.toString()}]`,
    unsignedRangeDescription: `[0, ${maxUnsigned.toString()}]`,
  };
}
