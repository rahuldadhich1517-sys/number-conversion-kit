import {
  NumberConversionError,
  validateSafeIntegerNumber,
  formatBigIntToBase,
  groupDigits,
} from "../shared";

export interface BaseConvertAllOptions {
  uppercaseHex?: boolean;
  includePrefix?: boolean;
  groupSize?: number;
  groupSeparator?: string;
}

export interface BaseConversionResults {
  binary: string;
  decimal: string;
  hexadecimal: string;
  octal: string;
  bigIntValue: bigint;
  isNegative: boolean;
}

export interface FormattedBaseConversion {
  binary: string;
  decimal: string;
  hexadecimal: string;
  octal: string;
}

function normalizeToBigInt(input: bigint | number | string): bigint {
  if (typeof input === "bigint") {
    return input;
  }
  if (typeof input === "number") {
    validateSafeIntegerNumber(input);
    return BigInt(input);
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      throw new NumberConversionError("Input string cannot be empty", "EMPTY_INPUT");
    }
    // Check if it's hex, bin, octal, or dec
    try {
      if (trimmed.startsWith("0x") || trimmed.startsWith("0X") || trimmed.startsWith("-0x") || trimmed.startsWith("-0X")) {
        const isNeg = trimmed.startsWith("-");
        const raw = isNeg ? trimmed.slice(3) : trimmed.slice(2);
        const val = BigInt(`0x${raw}`);
        return isNeg ? -val : val;
      }
      if (trimmed.startsWith("0b") || trimmed.startsWith("0B") || trimmed.startsWith("-0b") || trimmed.startsWith("-0B")) {
        const isNeg = trimmed.startsWith("-");
        const raw = isNeg ? trimmed.slice(3) : trimmed.slice(2);
        const val = BigInt(`0b${raw}`);
        return isNeg ? -val : val;
      }
      if (trimmed.startsWith("0o") || trimmed.startsWith("0O") || trimmed.startsWith("-0o") || trimmed.startsWith("-0O")) {
        const isNeg = trimmed.startsWith("-");
        const raw = isNeg ? trimmed.slice(3) : trimmed.slice(2);
        const val = BigInt(`0o${raw}`);
        return isNeg ? -val : val;
      }
      return BigInt(trimmed);
    } catch {
      throw new NumberConversionError(
        `Invalid integer representation: "${input}"`,
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
 * Returns the base conversion results for binary, decimal, hex, and octal.
 */
export function getBaseConversionResults(
  input: bigint | number | string,
  options: BaseConvertAllOptions = {}
): BaseConversionResults {
  const value = normalizeToBigInt(input);
  const isNegative = value < 0n;

  const binary = formatBigIntToBase(value, 2, {
    prefix: options.includePrefix ? "0b" : false,
    groupSize: options.groupSize,
    groupSeparator: options.groupSeparator,
  });

  const decimal = formatBigIntToBase(value, 10, {
    groupSize: options.groupSize,
    groupSeparator: options.groupSeparator,
  });

  const isUpper = options.uppercaseHex ?? true;
  const hexadecimal = formatBigIntToBase(value, 16, {
    uppercase: isUpper,
    prefix: options.includePrefix ? "0x" : false,
    groupSize: options.groupSize,
    groupSeparator: options.groupSeparator,
  });

  const octal = formatBigIntToBase(value, 8, {
    prefix: options.includePrefix ? "0o" : false,
    groupSize: options.groupSize,
    groupSeparator: options.groupSeparator,
  });

  return {
    binary,
    decimal,
    hexadecimal,
    octal,
    bigIntValue: value,
    isNegative,
  };
}

/**
 * Formats base conversion results according to options.
 */
export function formatBaseConversion(
  results: BaseConversionResults,
  options: {
    includePrefix?: boolean;
    uppercaseHex?: boolean;
    groupDigitsConfig?: { binary?: number; decimal?: number; hex?: number; octal?: number; separator?: string };
  } = {}
): FormattedBaseConversion {
  const sep = options.groupDigitsConfig?.separator ?? " ";
  let bin = results.binary;
  let dec = results.decimal;
  let hex = results.hexadecimal;
  let oct = results.octal;

  if (options.groupDigitsConfig?.binary) {
    bin = groupDigits(bin, options.groupDigitsConfig.binary, sep, "rtl");
  }
  if (options.groupDigitsConfig?.decimal) {
    dec = groupDigits(dec, options.groupDigitsConfig.decimal, sep, "rtl");
  }
  if (options.groupDigitsConfig?.hex) {
    hex = groupDigits(hex, options.groupDigitsConfig.hex, sep, "rtl");
  }
  if (options.groupDigitsConfig?.octal) {
    oct = groupDigits(oct, options.groupDigitsConfig.octal, sep, "rtl");
  }

  return {
    binary: bin,
    decimal: dec,
    hexadecimal: options.uppercaseHex !== false ? hex.toUpperCase() : hex.toLowerCase(),
    octal: oct,
  };
}

/**
 * Converts one integer into binary, decimal, hexadecimal and octal simultaneously.
 */
export function baseConvertAll(
  input: bigint | number | string,
  options: BaseConvertAllOptions = {}
): BaseConversionResults {
  return getBaseConversionResults(input, options);
}
