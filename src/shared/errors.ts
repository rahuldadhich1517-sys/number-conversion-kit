export type ErrorCode =
  | "INVALID_INPUT"
  | "INVALID_BINARY"
  | "INVALID_HEXADECIMAL"
  | "INVALID_DECIMAL"
  | "INVALID_BASE"
  | "INVALID_DIGIT_FOR_BASE"
  | "INVALID_BIT_WIDTH"
  | "INTEGER_OUT_OF_RANGE"
  | "UNSAFE_NUMBER"
  | "INVALID_BITWISE_OPERATION"
  | "UNSUPPORTED_UNSIGNED_BIGINT_SHIFT"
  | "INVALID_IEEE754_FORMAT"
  | "INVALID_IEEE754_BITS"
  | "INVALID_UTF8"
  | "INCOMPLETE_BYTE_SEQUENCE"
  | "EMPTY_INPUT"
  | "INPUT_TOO_LARGE"
  | "OVERFLOW_ERROR";

export class NumberConversionError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: ErrorCode, details?: Record<string, unknown>) {
    super(message);
    this.name = "NumberConversionError";
    this.code = code;
    this.details = details;

    const errorConstructor = Error as unknown as {
      captureStackTrace?: (target: object, constructorOpt?: unknown) => void;
    };
    if (typeof errorConstructor.captureStackTrace === "function") {
      errorConstructor.captureStackTrace(this, NumberConversionError);
    }
  }
}
