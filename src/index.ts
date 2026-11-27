// Core Error and Shared Utilities
export * from "./shared";

// 1. binary-to-decimal
export * from "./binary-to-decimal";

// 2. base-convert-all
export * from "./base-convert-all";

// 3. bitwise-calculate
export * from "./bitwise-calculate";

// 4. decimal-to-binary
export * from "./decimal-to-binary";

// 5. hex-to-binary
export {
  hexToBinary,
  parseHexadecimal,
  type HexToBinaryOptions,
  type ParseHexOptions,
} from "./hex-to-binary";

// 6. hex-to-decimal
export {
  hexToDecimal,
  validateHexadecimal,
  formatDecimalResult,
  type HexToDecimalOptions,
  type ValidateHexOptions,
  type FormatDecimalOptions,
} from "./hex-to-decimal";

// 7. hex-to-text
export * from "./hex-to-text";

// 8. ieee754-convert
export * from "./ieee754-convert";

// 9. number-base-convert
export * from "./number-base-convert";

// 10. text-to-binary
export * from "./text-to-binary";

// 11. twos-complement
export {
  toTwosComplement,
  fromTwosComplement,
  getTwosComplementInfo,
  validateSignedIntegerRange,
  type ToTwosComplementOptions,
  type TwosComplementResult,
  type TwosComplementInfo,
} from "./twos-complement";
