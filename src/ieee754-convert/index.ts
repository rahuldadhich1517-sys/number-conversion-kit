import { NumberConversionError } from "../shared";

export type IEEE754Format = "float32" | "float64";

export type IEEE754Classification =
  | "positive_zero"
  | "negative_zero"
  | "positive_infinity"
  | "negative_infinity"
  | "nan"
  | "subnormal"
  | "normalized";

export interface IEEE754Breakdown {
  format: IEEE754Format;
  decimalValue: number;
  actualFloatValue: number;
  signBit: "0" | "1";
  exponentBits: string;
  mantissaBits: string;
  completeBitSequence: string;
  hexadecimal: string;
  biasedExponent: number;
  unbiasedExponent: number | null;
  exponentBias: number;
  signInterpretation: "+" | "-";
  classification: IEEE754Classification;
  isNormalized: boolean;
  isSubnormal: boolean;
  isZero: boolean;
  isInfinity: boolean;
  isNaN: boolean;
  roundedFromFloat64?: boolean;
}

export interface IEEE754ConvertOptions {
  format?: IEEE754Format;
}

/**
 * Converts a 32-bit floating point number into its 32-bit binary string.
 */
export function float32ToBits(value: number): string {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, value, false); // big-endian
  const u32 = view.getUint32(0, false);
  return u32.toString(2).padStart(32, "0");
}

/**
 * Converts a 64-bit floating point number into its 64-bit binary string.
 */
export function float64ToBits(value: number): string {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, value, false); // big-endian
  const high = view.getUint32(0, false);
  const low = view.getUint32(4, false);
  return high.toString(2).padStart(32, "0") + low.toString(2).padStart(32, "0");
}

/**
 * Converts a 32-bit binary string to a 32-bit floating point number.
 */
export function bitsToFloat32(bits: string): number {
  const clean = bits.replace(/[_ ]/g, "");
  if (clean.length !== 32 || !/^[01]+$/.test(clean)) {
    throw new NumberConversionError(
      `Invalid float32 bit sequence: expected exactly 32 bits, got ${clean.length}`,
      "INVALID_IEEE754_BITS",
      { bits: clean, length: clean.length }
    );
  }
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  const u32 = parseInt(clean, 2);
  view.setUint32(0, u32, false);
  return view.getFloat32(0, false);
}

/**
 * Converts a 64-bit binary string to a 64-bit floating point number.
 */
export function bitsToFloat64(bits: string): number {
  const clean = bits.replace(/[_ ]/g, "");
  if (clean.length !== 64 || !/^[01]+$/.test(clean)) {
    throw new NumberConversionError(
      `Invalid float64 bit sequence: expected exactly 64 bits, got ${clean.length}`,
      "INVALID_IEEE754_BITS",
      { bits: clean, length: clean.length }
    );
  }
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  const high = parseInt(clean.slice(0, 32), 2);
  const low = parseInt(clean.slice(32, 64), 2);
  view.setUint32(0, high, false);
  view.setUint32(4, low, false);
  return view.getFloat64(0, false);
}

/**
 * Inspects and breaks down IEEE 754 representation of any number.
 */
export function getIEEE754Breakdown(
  value: number,
  format: IEEE754Format = "float64"
): IEEE754Breakdown {
  if (typeof value !== "number") {
    throw new NumberConversionError(
      `Input must be a number, received ${typeof value}`,
      "INVALID_INPUT",
      { value }
    );
  }

  if (format !== "float32" && format !== "float64") {
    throw new NumberConversionError(
      `Invalid IEEE 754 format: "${format as string}". Must be "float32" or "float64".`,
      "INVALID_IEEE754_FORMAT",
      { format }
    );
  }

  const isF32 = format === "float32";
  const bitString = isF32 ? float32ToBits(value) : float64ToBits(value);

  // Retrieve the actual value stored in that representation
  const actualFloatValue = isF32 ? bitsToFloat32(bitString) : value;
  const roundedFromFloat64 = isF32 && !Object.is(actualFloatValue, value);

  const signBit = bitString[0] as "0" | "1";
  const expLen = isF32 ? 8 : 11;
  const bias = isF32 ? 127 : 1023;
  const maxBiasedExp = isF32 ? 255 : 2047;

  const exponentBits = bitString.slice(1, 1 + expLen);
  const mantissaBits = bitString.slice(1 + expLen);

  const biasedExponent = parseInt(exponentBits, 2);
  const isMantissaZero = !mantissaBits.includes("1");

  let classification: IEEE754Classification;
  let unbiasedExponent: number | null = null;
  let isNormalized = false;
  let isSubnormal = false;
  let isZero = false;
  let isInfinity = false;
  let isNaNValue = false;

  if (biasedExponent === maxBiasedExp) {
    if (isMantissaZero) {
      isInfinity = true;
      classification = signBit === "0" ? "positive_infinity" : "negative_infinity";
    } else {
      isNaNValue = true;
      classification = "nan";
    }
  } else if (biasedExponent === 0) {
    if (isMantissaZero) {
      isZero = true;
      classification = signBit === "0" ? "positive_zero" : "negative_zero";
      unbiasedExponent = 0;
    } else {
      isSubnormal = true;
      classification = "subnormal";
      unbiasedExponent = 1 - bias; // subnormal exponent rule: 1 - bias
    }
  } else {
    isNormalized = true;
    classification = "normalized";
    unbiasedExponent = biasedExponent - bias;
  }

  // Hex representation
  let hexadecimal = "";
  for (let i = 0; i < bitString.length; i += 4) {
    const nibble = bitString.slice(i, i + 4);
    hexadecimal += parseInt(nibble, 2).toString(16).toUpperCase();
  }

  return {
    format,
    decimalValue: value,
    actualFloatValue,
    signBit,
    exponentBits,
    mantissaBits,
    completeBitSequence: bitString,
    hexadecimal,
    biasedExponent,
    unbiasedExponent,
    exponentBias: bias,
    signInterpretation: signBit === "0" ? "+" : "-",
    classification,
    isNormalized,
    isSubnormal,
    isZero,
    isInfinity,
    isNaN: isNaNValue,
    roundedFromFloat64,
  };
}

/**
 * Converts number to IEEE 754 breakdown.
 */
export function ieee754Convert(
  input: number,
  options: IEEE754ConvertOptions = {}
): IEEE754Breakdown {
  return getIEEE754Breakdown(input, options.format ?? "float64");
}
