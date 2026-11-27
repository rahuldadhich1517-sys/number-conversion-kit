import {
  validateBase,
  parseBigIntFromBase,
  formatBigIntToBase,
} from "../shared";

export { validateBase } from "../shared";

export interface NumberBaseConvertOptions {
  uppercase?: boolean;
  prefix?: boolean | string;
  minWidth?: number;
  groupSize?: number;
  groupSeparator?: string;
  allowPrefix?: boolean;
  allowSeparators?: boolean;
}

export interface ParseBaseOptions {
  allowPrefix?: boolean;
  allowSeparators?: boolean;
  allowSign?: boolean;
}

export interface FormatBaseOptions {
  uppercase?: boolean;
  prefix?: boolean | string;
  minWidth?: number;
  groupSize?: number;
  groupSeparator?: string;
  padChar?: string;
}

export interface BaseConversionInfo {
  input: string;
  fromBase: number;
  toBase: number;
  bigIntValue: bigint;
  isNegative: boolean;
  result: string;
  digitCount: number;
}

/**
 * Parses an integer string in a given base (2..36) into a BigInt.
 */
export function parseBaseInteger(
  input: string,
  base: number,
  options: ParseBaseOptions = {}
): bigint {
  validateBase(base);
  const { value } = parseBigIntFromBase(input, base, options);
  return value;
}

/**
 * Formats a BigInt into a string of the specified base (2..36).
 */
export function formatBaseInteger(
  value: bigint,
  base: number,
  options: FormatBaseOptions = {}
): string {
  validateBase(base);
  return formatBigIntToBase(value, base, options);
}

/**
 * Converts integers between arbitrary bases from 2 through 36.
 */
export function numberBaseConvert(
  input: string,
  fromBase: number,
  toBase: number,
  options: NumberBaseConvertOptions = {}
): string {
  validateBase(fromBase);
  validateBase(toBase);

  const { value } = parseBigIntFromBase(input, fromBase, {
    allowPrefix: options.allowPrefix ?? true,
    allowSeparators: options.allowSeparators ?? true,
    allowSign: true,
  });

  return formatBigIntToBase(value, toBase, {
    uppercase: options.uppercase ?? true,
    prefix: options.prefix,
    minWidth: options.minWidth,
    groupSize: options.groupSize,
    groupSeparator: options.groupSeparator,
  });
}

/**
 * Returns detailed conversion information between arbitrary bases.
 */
export function getBaseConversionInfo(
  input: string,
  fromBase: number,
  toBase: number,
  options: NumberBaseConvertOptions = {}
): BaseConversionInfo {
  validateBase(fromBase);
  validateBase(toBase);

  const { value, isNegative } = parseBigIntFromBase(input, fromBase, {
    allowPrefix: options.allowPrefix ?? true,
    allowSeparators: options.allowSeparators ?? true,
    allowSign: true,
  });

  const result = formatBigIntToBase(value, toBase, {
    uppercase: options.uppercase ?? true,
    prefix: options.prefix,
    minWidth: options.minWidth,
    groupSize: options.groupSize,
    groupSeparator: options.groupSeparator,
  });

  // Calculate raw digit count without prefix or negative sign
  const absVal = isNegative ? -value : value;
  const rawDigits = formatBigIntToBase(absVal, toBase);

  return {
    input,
    fromBase,
    toBase,
    bigIntValue: value,
    isNegative,
    result,
    digitCount: rawDigits.length,
  };
}
