import { NumberConversionError } from "./errors";

export interface ValidateBaseOptions {
  min?: number;
  max?: number;
}

/**
 * Validates radix / base is an integer between 2 and 36 (inclusive).
 */
export function validateBase(base: number, options: ValidateBaseOptions = {}): void {
  const min = options.min ?? 2;
  const max = options.max ?? 36;

  if (typeof base !== "number" || !Number.isInteger(base) || base < min || base > max) {
    throw new NumberConversionError(
      `Invalid base: ${base}. Base must be an integer between ${min} and ${max}.`,
      "INVALID_BASE",
      { base, min, max }
    );
  }
}

/**
 * Validates bit width is an integer >= 1 up to maximum (default 4096).
 */
export function validateBitWidth(width: number, max: number = 4096): void {
  if (typeof width !== "number" || !Number.isInteger(width) || width < 1 || width > max) {
    throw new NumberConversionError(
      `Invalid bit width: ${width}. Must be an integer between 1 and ${max}.`,
      "INVALID_BIT_WIDTH",
      { width, max }
    );
  }
}

/**
 * Validates a number input to ensure it is not NaN, Infinity, or float when expecting integer.
 */
export function validateSafeIntegerNumber(value: number): void {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new NumberConversionError(
      `Invalid number: ${value}. Value must be a finite number.`,
      "INVALID_INPUT",
      { value }
    );
  }
  if (!Number.isInteger(value)) {
    throw new NumberConversionError(
      `Floating-point number is not supported for integer conversion: ${value}.`,
      "INVALID_INPUT",
      { value }
    );
  }
  if (!Number.isSafeInteger(value)) {
    throw new NumberConversionError(
      `Number ${value} is outside the safe integer range [${Number.MIN_SAFE_INTEGER}, ${Number.MAX_SAFE_INTEGER}]. Use BigInt or string instead.`,
      "UNSAFE_NUMBER",
      { value }
    );
  }
}

/**
 * Validates shift count for bitwise operations.
 */
export function validateShiftCount(shift: number | bigint, max: number = 1048576): bigint {
  let s: bigint;
  if (typeof shift === "number") {
    if (!Number.isInteger(shift)) {
      throw new NumberConversionError(`Shift count must be an integer: ${shift}`, "INVALID_INPUT", { shift });
    }
    s = BigInt(shift);
  } else if (typeof shift === "bigint") {
    s = shift;
  } else {
    throw new NumberConversionError("Shift count must be a number or BigInt", "INVALID_INPUT", { shift });
  }

  if (s < 0n) {
    throw new NumberConversionError(`Negative shift count is not permitted: ${s}`, "INVALID_INPUT", { shift: s.toString() });
  }

  if (s > BigInt(max)) {
    throw new NumberConversionError(
      `Shift count ${s} exceeds safety maximum of ${max}`,
      "INPUT_TOO_LARGE",
      { shift: s.toString(), max }
    );
  }

  return s;
}
