import {
  NumberConversionError,
  validateSafeIntegerNumber,
  validateShiftCount,
  formatBigIntToBase,
  groupDigits,
} from "../shared";

export type BitwiseOp =
  | "AND"
  | "OR"
  | "XOR"
  | "NOT"
  | "LEFT_SHIFT"
  | "RIGHT_SHIFT"
  | "UNSIGNED_RIGHT_SHIFT";

export interface BitwiseCalculateOptions {
  operation: BitwiseOp;
  left: bigint | number;
  right?: bigint | number;
  bitWidth?: number;
}

export interface BitwiseResult {
  operation: BitwiseOp;
  isBigInt: boolean;
  value: bigint | number;
  bigIntValue: bigint;
  signed32?: number;
  unsigned32?: number;
  binary: string;
  hexadecimal: string;
  decimal: string;
  explanation: string;
}

export interface FormatBitwiseOptions {
  uppercaseHex?: boolean;
  includePrefix?: boolean;
  groupSize?: number;
  groupSeparator?: string;
  bitWidth?: number;
}

function normalizeOperand(val: bigint | number, paramName: string): { isBigInt: boolean; val: bigint | number } {
  if (typeof val === "bigint") {
    return { isBigInt: true, val };
  }
  if (typeof val === "number") {
    validateSafeIntegerNumber(val);
    return { isBigInt: false, val };
  }
  throw new NumberConversionError(
    `Operand ${paramName} must be a number or BigInt, received ${typeof val}`,
    "INVALID_INPUT",
    { [paramName]: val }
  );
}

/**
 * Evaluates bitwise AND (a & b).
 */
export function bitwiseAnd(a: bigint | number, b: bigint | number): bigint | number {
  const normA = normalizeOperand(a, "a");
  const normB = normalizeOperand(b, "b");

  if (normA.isBigInt || normB.isBigInt) {
    if (!normA.isBigInt || !normB.isBigInt) {
      throw new NumberConversionError(
        "Cannot mix BigInt and Number operands. Provide both as BigInt or both as Number.",
        "INVALID_INPUT"
      );
    }
    return (normA.val as bigint) & (normB.val as bigint);
  }
  return ((normA.val as number) & (normB.val as number)) | 0;
}

/**
 * Evaluates bitwise OR (a | b).
 */
export function bitwiseOr(a: bigint | number, b: bigint | number): bigint | number {
  const normA = normalizeOperand(a, "a");
  const normB = normalizeOperand(b, "b");

  if (normA.isBigInt || normB.isBigInt) {
    if (!normA.isBigInt || !normB.isBigInt) {
      throw new NumberConversionError(
        "Cannot mix BigInt and Number operands. Provide both as BigInt or both as Number.",
        "INVALID_INPUT"
      );
    }
    return (normA.val as bigint) | (normB.val as bigint);
  }
  return ((normA.val as number) | (normB.val as number)) | 0;
}

/**
 * Evaluates bitwise XOR (a ^ b).
 */
export function bitwiseXor(a: bigint | number, b: bigint | number): bigint | number {
  const normA = normalizeOperand(a, "a");
  const normB = normalizeOperand(b, "b");

  if (normA.isBigInt || normB.isBigInt) {
    if (!normA.isBigInt || !normB.isBigInt) {
      throw new NumberConversionError(
        "Cannot mix BigInt and Number operands. Provide both as BigInt or both as Number.",
        "INVALID_INPUT"
      );
    }
    return (normA.val as bigint) ^ (normB.val as bigint);
  }
  return ((normA.val as number) ^ (normB.val as number)) | 0;
}

/**
 * Evaluates bitwise NOT (~a).
 */
export function bitwiseNot(a: bigint | number): bigint | number {
  const normA = normalizeOperand(a, "a");
  if (normA.isBigInt) {
    return ~(normA.val as bigint);
  }
  return ~((normA.val as number)) | 0;
}

/**
 * Evaluates bitwise Left Shift (a << shift).
 */
export function leftShift(a: bigint | number, shift: bigint | number): bigint | number {
  const normA = normalizeOperand(a, "a");
  const shiftCount = validateShiftCount(shift);

  if (normA.isBigInt) {
    return (normA.val as bigint) << shiftCount;
  }
  const sNum = Number(shiftCount);
  return ((normA.val as number) << sNum) | 0;
}

/**
 * Evaluates arithmetic bitwise Right Shift (a >> shift).
 */
export function rightShift(a: bigint | number, shift: bigint | number): bigint | number {
  const normA = normalizeOperand(a, "a");
  const shiftCount = validateShiftCount(shift);

  if (normA.isBigInt) {
    return (normA.val as bigint) >> shiftCount;
  }
  const sNum = Number(shiftCount);
  return ((normA.val as number) >> sNum) | 0;
}

/**
 * Evaluates logical unsigned Right Shift (a >>> shift).
 * NOTE: BigInt does not support unsigned right shift in JavaScript.
 */
export function unsignedRightShift(a: bigint | number, shift: bigint | number): number {
  if (typeof a === "bigint" || typeof shift === "bigint") {
    throw new NumberConversionError(
      "BigInt does not support unsigned right shift (>>>). JavaScript BigInt operations represent arbitrary-precision two's complement numbers without a fixed bit width.",
      "UNSUPPORTED_UNSIGNED_BIGINT_SHIFT"
    );
  }
  validateSafeIntegerNumber(a);
  const shiftCount = Number(validateShiftCount(shift));
  return (a >>> shiftCount);
}

/**
 * Formats a bitwise result into a readable formatted object or string.
 */
export function formatBitwiseResult(
  result: BitwiseResult,
  options: FormatBitwiseOptions = {}
): { binary: string; hex: string; decimal: string } {
  let bin = result.binary;
  let hex = result.hexadecimal;
  const dec = result.decimal;

  if (options.uppercaseHex !== false) {
    hex = hex.toUpperCase();
  } else {
    hex = hex.toLowerCase();
  }

  if (options.groupSize && options.groupSize > 0) {
    const sep = options.groupSeparator ?? " ";
    bin = groupDigits(bin, options.groupSize, sep, "rtl");
    hex = groupDigits(hex, options.groupSize, sep, "rtl");
  }

  if (options.includePrefix) {
    bin = `0b${bin}`;
    hex = options.uppercaseHex !== false ? `0X${hex}` : `0x${hex}`;
  }

  return { binary: bin, hex, decimal: dec };
}

/**
 * Evaluates bitwise operations with full metadata and explanations.
 */
export function bitwiseCalculate(options: BitwiseCalculateOptions): BitwiseResult {
  const { operation, left, right, bitWidth } = options;

  if (operation !== "NOT" && right === undefined) {
    throw new NumberConversionError(
      `Operation ${operation} requires both left and right operands.`,
      "INVALID_BITWISE_OPERATION",
      { operation }
    );
  }

  let calculatedVal: bigint | number;
  let explanation: string;

  switch (operation) {
    case "AND": {
      calculatedVal = bitwiseAnd(left, right!);
      explanation = `Bitwise AND: Each bit position is 1 if and only if both operands' bits are 1.`;
      break;
    }
    case "OR": {
      calculatedVal = bitwiseOr(left, right!);
      explanation = `Bitwise OR: Each bit position is 1 if either operand's bit is 1.`;
      break;
    }
    case "XOR": {
      calculatedVal = bitwiseXor(left, right!);
      explanation = `Bitwise XOR: Each bit position is 1 if exactly one operand's bit is 1.`;
      break;
    }
    case "NOT": {
      calculatedVal = bitwiseNot(left);
      explanation = `Bitwise NOT: Inverts all bits. For signed integers, ~x equals -(x + 1).`;
      break;
    }
    case "LEFT_SHIFT": {
      calculatedVal = leftShift(left, right!);
      explanation = `Bitwise Left Shift: Shifts bits left by ${right}, padding with zeroes on the right.`;
      break;
    }
    case "RIGHT_SHIFT": {
      calculatedVal = rightShift(left, right!);
      explanation = `Arithmetic Right Shift: Shifts bits right by ${right}, preserving the sign bit (sign extension).`;
      break;
    }
    case "UNSIGNED_RIGHT_SHIFT": {
      calculatedVal = unsignedRightShift(left, right!);
      explanation = `Logical Unsigned Right Shift: Shifts bits right by ${right}, always padding with zeroes on the left (produces 32-bit unsigned number).`;
      break;
    }
    default:
      throw new NumberConversionError(
        `Invalid bitwise operation: "${operation as string}"`,
        "INVALID_BITWISE_OPERATION",
        { operation }
      );
  }

  const isBigInt = typeof calculatedVal === "bigint";
  const bigIntValue = isBigInt ? (calculatedVal as bigint) : BigInt(calculatedVal as number);

  let signed32: number | undefined;
  let unsigned32: number | undefined;

  if (!isBigInt) {
    const num = calculatedVal as number;
    signed32 = num | 0;
    unsigned32 = num >>> 0;
  }

  // Formatting binary and hex
  let binary: string;
  let hexadecimal: string;

  if (isBigInt) {
    const bVal = calculatedVal as bigint;
    binary = formatBigIntToBase(bVal, 2, { minWidth: bitWidth });
    hexadecimal = formatBigIntToBase(bVal, 16, { uppercase: true });
  } else {
    const u32 = (calculatedVal as number) >>> 0;
    const width = bitWidth ?? 32;
    binary = u32.toString(2).padStart(width, "0");
    hexadecimal = u32.toString(16).toUpperCase();
  }

  return {
    operation,
    isBigInt,
    value: calculatedVal,
    bigIntValue,
    signed32,
    unsigned32,
    binary,
    hexadecimal,
    decimal: calculatedVal.toString(),
    explanation,
  };
}
