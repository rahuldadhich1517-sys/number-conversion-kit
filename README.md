# @rahul_dadhich15/number-conversion-kit

> Production-ready, zero-runtime-dependency Number & Base Conversion toolkit for modern JavaScript and TypeScript.

[![CI](https://github.com/rahul-dadhich15/number-conversion-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/rahul-dadhich15/number-conversion-kit/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](#)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](#)

---

## Overview

`@rahul_dadhich15/number-conversion-kit` is an enterprise-grade numerical computing and binary data manipulation library designed for frontend applications (React, Vite, Next.js, Vue, Svelte, browsers) and Node.js environments.

- **100% Local Execution**: No external APIs, no servers, no databases, no network requests.
- **Zero Runtime Dependencies**: Zero external dependencies to keep bundles minimal and secure.
- **Arbitrary-Precision BigInt**: Exact mathematical conversions without IEEE 754 float precision loss.
- **Dual Module Output**: Full ESM and CommonJS support with TypeScript declaration maps.
- **Modular Subpath Exports**: Tree-shakeable root import or independent subpath imports for all 11 utilities.

---

## Installation

```bash
# npm
npm install @rahul_dadhich15/number-conversion-kit

# pnpm
pnpm add @rahul_dadhich15/number-conversion-kit

# yarn
yarn add @rahul_dadhich15/number-conversion-kit
```

---

## Subpath Imports

Import only what you need to optimize bundle size:

```ts
import { binaryToDecimal } from "@rahul_dadhich15/number-conversion-kit/binary-to-decimal";
import { baseConvertAll } from "@rahul_dadhich15/number-conversion-kit/base-convert-all";
import { bitwiseCalculate } from "@rahul_dadhich15/number-conversion-kit/bitwise-calculate";
import { decimalToBinary } from "@rahul_dadhich15/number-conversion-kit/decimal-to-binary";
import { hexToBinary } from "@rahul_dadhich15/number-conversion-kit/hex-to-binary";
import { hexToDecimal } from "@rahul_dadhich15/number-conversion-kit/hex-to-decimal";
import { hexToText } from "@rahul_dadhich15/number-conversion-kit/hex-to-text";
import { ieee754Convert } from "@rahul_dadhich15/number-conversion-kit/ieee754-convert";
import { numberBaseConvert } from "@rahul_dadhich15/number-conversion-kit/number-base-convert";
import { textToBinary } from "@rahul_dadhich15/number-conversion-kit/text-to-binary";
import { toTwosComplement, fromTwosComplement } from "@rahul_dadhich15/number-conversion-kit/twos-complement";
```

Or import from the root package:

```ts
import {
  binaryToDecimal,
  baseConvertAll,
  bitwiseCalculate,
  decimalToBinary,
  hexToBinary,
  hexToDecimal,
  hexToText,
  ieee754Convert,
  numberBaseConvert,
  textToBinary,
  toTwosComplement,
  fromTwosComplement,
} from "@rahul_dadhich15/number-conversion-kit";
```

---

## The 11 Conversion Utilities

### 1. `binary-to-decimal`

Converts binary integers into decimal numbers with full precision preservation.

#### Signatures
- `binaryToDecimal(input: string, options?: BinaryToDecimalOptions): bigint | number | string`
- `validateBinary(input: string, options?: ValidateBinaryOptions): boolean`
- `parseBinary(input: string, options?: ValidateBinaryOptions): bigint`
- `formatBinary(input: string, options?: FormatBinaryOptions): string`

#### Examples
```ts
import { binaryToDecimal, validateBinary } from "@rahul_dadhich15/number-conversion-kit/binary-to-decimal";

binaryToDecimal("1010"); // 10n (BigInt by default)
binaryToDecimal("0b11111111"); // 255n
binaryToDecimal("-1010"); // -10n
binaryToDecimal("1111_0000"); // 240n (supports separators)

// Return safe JavaScript number
binaryToDecimal("1010", { asNumber: true }); // 10

// Return decimal string
binaryToDecimal("11111111", { asString: true }); // "255"

validateBinary("1010"); // true
validateBinary("1020"); // false
```

---

### 2. `base-convert-all`

Simultaneously converts an integer into binary, decimal, hexadecimal, and octal representations.

#### Signatures
- `baseConvertAll(input: bigint | number | string, options?: BaseConvertAllOptions): BaseConversionResults`
- `getBaseConversionResults(input: bigint | number | string, options?: BaseConvertAllOptions): BaseConversionResults`
- `formatBaseConversion(results: BaseConversionResults, options?: FormatBaseConversionOptions): FormattedBaseConversion`

#### Examples
```ts
import { baseConvertAll } from "@rahul_dadhich15/number-conversion-kit/base-convert-all";

const result = baseConvertAll(255n);
/*
{
  binary: "11111111",
  decimal: "255",
  hexadecimal: "FF",
  octal: "377",
  bigIntValue: 255n,
  isNegative: false
}
*/

// With prefixes and formatting
baseConvertAll(255n, { includePrefix: true });
/*
{
  binary: "0b11111111",
  decimal: "255",
  hexadecimal: "0xFF",
  octal: "0o377", ...
}
*/
```

---

### 3. `bitwise-calculate`

Evaluates bitwise operations with strict distinction between 32-bit Number operations and arbitrary-precision BigInt operations.

#### Operations
- `AND` (`&`)
- `OR` (`|`)
- `XOR` (`^`)
- `NOT` (`~`)
- `LEFT_SHIFT` (`<<`)
- `RIGHT_SHIFT` (`>>` Arithmetic)
- `UNSIGNED_RIGHT_SHIFT` (`>>>` Logical 32-bit Number only)

#### Signatures
- `bitwiseCalculate(options: BitwiseCalculateOptions): BitwiseResult`
- `bitwiseAnd(a, b)`
- `bitwiseOr(a, b)`
- `bitwiseXor(a, b)`
- `bitwiseNot(a)`
- `leftShift(a, shift)`
- `rightShift(a, shift)`
- `unsignedRightShift(a, shift)` (Throws `UNSUPPORTED_UNSIGNED_BIGINT_SHIFT` on BigInt)
- `formatBitwiseResult(result, options?)`

#### Examples
```ts
import {
  bitwiseCalculate,
  unsignedRightShift,
} from "@rahul_dadhich15/number-conversion-kit/bitwise-calculate";

// 32-bit Number evaluation
const result = bitwiseCalculate({
  operation: "AND",
  left: 12,
  right: 10,
});
// result.value = 8, result.binary = "00000000000000000000000000001000"

// Arbitrary-precision BigInt
const bigResult = bitwiseCalculate({
  operation: "XOR",
  left: 12n,
  right: 10n,
});
// bigResult.value = 6n

// Logical unsigned right shift
unsignedRightShift(-1, 0); // 4294967295
```

---

### 4. `decimal-to-binary`

Converts decimal integers into binary strings with mathematical or two's complement modes.

#### Signatures
- `decimalToBinary(input: bigint | number | string, options?: DecimalToBinaryOptions): string`
- `validateDecimalInteger(input: bigint | number | string): boolean`
- `formatBinaryInteger(binary: string, options?: FormatBinaryIntegerOptions): string`

#### Examples
```ts
import { decimalToBinary } from "@rahul_dadhich15/number-conversion-kit/decimal-to-binary";

decimalToBinary(255); // "11111111"
decimalToBinary(255, { prefix: true }); // "0b11111111"
decimalToBinary(-10); // "-1010" (mathematical mode)

// Fixed-width Two's Complement mode
decimalToBinary(-5, { mode: "twos-complement", bitWidth: 8 }); // "11111011"
```

---

### 5. `hex-to-binary`

Converts hexadecimal integers into binary strings with leading zero preservation and nibble alignment.

#### Signatures
- `hexToBinary(input: string, options?: HexToBinaryOptions): string`
- `validateHexadecimal(input: string, options?: ValidateHexOptions): boolean`
- `parseHexadecimal(input: string, options?: ParseHexOptions): bigint`

#### Examples
```ts
import { hexToBinary } from "@rahul_dadhich15/number-conversion-kit/hex-to-binary";

hexToBinary("FF"); // "11111111"
hexToBinary("0xFF"); // "11111111"

// Preserve leading zeros (each hex char maps to 4 bits)
hexToBinary("0F", { preserveLeadingZeros: true }); // "00001111"
hexToBinary("7", { nibbleAligned: true }); // "0111"
```

---

### 6. `hex-to-decimal`

Converts hexadecimal integers into decimal BigInt, safe Number, or strings.

#### Signatures
- `hexToDecimal(input: string, options?: HexToDecimalOptions): bigint | number | string`
- `validateHexadecimal(input: string, options?: ValidateHexOptions): boolean`
- `formatDecimalResult(value: bigint | number, options?: FormatDecimalOptions): string`

#### Examples
```ts
import { hexToDecimal } from "@rahul_dadhich15/number-conversion-kit/hex-to-decimal";

hexToDecimal("FF"); // 255n
hexToDecimal("0xFF", { asNumber: true }); // 255
hexToDecimal("FF", { asString: true }); // "255"

// Signed two's complement interpretation with explicit bit width
hexToDecimal("FF", { signedBitWidth: 8 }); // -1n
hexToDecimal("7F", { signedBitWidth: 8 }); // 127n
```

---

### 7. `hex-to-text`

Bidirectional conversion between hexadecimal byte strings and text (UTF-8, ASCII, Latin-1).

#### Signatures
- `hexToText(hex: string, options?: HexToTextOptions): string`
- `textToHex(text: string, options?: TextToHexOptions): string`
- `validateHexBytes(hex: string): boolean`
- `getHexTextInfo(input: string, options?: HexToTextOptions): HexTextInfo`

#### Examples
```ts
import { hexToText, textToHex } from "@rahul_dadhich15/number-conversion-kit/hex-to-text";

textToHex("Hello", { uppercase: true, separator: " " }); // "48 65 6C 6C 6F"
textToHex("🌍"); // "F09F8C8D" (multi-byte UTF-8)

hexToText("48656C6C6F"); // "Hello"
hexToText("F09F8C8D"); // "🌍"
```

---

### 8. `ieee754-convert`

Converts numbers to and from IEEE 754 standard binary32 (single-precision 32-bit) and binary64 (double-precision 64-bit) floating-point representations using exact `DataView` operations.

#### Signatures
- `ieee754Convert(input: number, options?: IEEE754ConvertOptions): IEEE754Breakdown`
- `float32ToBits(value: number): string`
- `float64ToBits(value: number): string`
- `bitsToFloat32(bits: string): number`
- `bitsToFloat64(bits: string): number`
- `getIEEE754Breakdown(value: number, format?: "float32" | "float64"): IEEE754Breakdown`

#### Examples
```ts
import { ieee754Convert } from "@rahul_dadhich15/number-conversion-kit/ieee754-convert";

const breakdown = ieee754Convert(3.14, { format: "float32" });
/*
{
  format: "float32",
  signBit: "0",
  exponentBits: "10000000",
  mantissaBits: "10010001111010111000010",
  completeBitSequence: "01000000010010001111010111000010",
  hexadecimal: "4048F5C2",
  decimalValue: 3.14,
  actualFloatValue: 3.140000104904175,
  biasedExponent: 128,
  unbiasedExponent: 1,
  exponentBias: 127,
  classification: "normalized",
  roundedFromFloat64: true
}
*/
```

---

### 9. `number-base-convert`

Converts integers between arbitrary bases from 2 through 36 using arbitrary-precision arithmetic.

#### Signatures
- `numberBaseConvert(input: string, fromBase: number, toBase: number, options?: NumberBaseConvertOptions): string`
- `parseBaseInteger(input: string, base: number, options?: ParseBaseOptions): bigint`
- `formatBaseInteger(value: bigint, base: number, options?: FormatBaseOptions): string`
- `validateBase(base: number): void`
- `getBaseConversionInfo(input: string, fromBase: number, toBase: number): BaseConversionInfo`

#### Examples
```ts
import { numberBaseConvert } from "@rahul_dadhich15/number-conversion-kit/number-base-convert";

numberBaseConvert("1010", 2, 10); // "10"
numberBaseConvert("FF", 16, 2); // "11111111"
numberBaseConvert("123", 10, 36); // "3F"
numberBaseConvert("Z", 36, 10); // "35"
```

---

### 10. `text-to-binary`

Bidirectional conversion between UTF-8 text and 8-bit binary byte strings.

#### Signatures
- `textToBinary(text: string, options?: TextToBinaryOptions): string`
- `binaryToText(binary: string, options?: BinaryToTextOptions): string`
- `validateBinaryBytes(binary: string): boolean`
- `getTextBinaryInfo(input: string, options?: BinaryToTextOptions): TextBinaryInfo`

#### Examples
```ts
import { textToBinary, binaryToText } from "@rahul_dadhich15/number-conversion-kit/text-to-binary";

textToBinary("Hi"); // "01001000 01101001"
binaryToText("01001000 01101001"); // "Hi"

// Multi-byte Unicode (Emoji)
textToBinary("🦀"); // "11110000 10011111 10100110 10000000"
```

---

### 11. `twos-complement`

Encodes and decodes signed integers to and from fixed-width two's complement representations (8-bit, 16-bit, 32-bit, 64-bit, or custom widths up to 4096 bits).

#### Signatures
- `toTwosComplement(value: bigint | number | string, bitWidth: number, options?: ToTwosComplementOptions): TwosComplementResult`
- `fromTwosComplement(bits: string, radix?: number, bitWidth?: number): bigint`
- `getTwosComplementInfo(value: bigint | number | string, bitWidth: number): TwosComplementInfo`
- `validateBitWidth(bitWidth: number, max?: number): void`
- `validateSignedIntegerRange(value: bigint, bitWidth: number): void`

#### Examples
```ts
import {
  toTwosComplement,
  fromTwosComplement,
  getTwosComplementInfo,
} from "@rahul_dadhich15/number-conversion-kit/twos-complement";

// Encode -5 to 8-bit two's complement
const encoded = toTwosComplement(-5n, 8);
// encoded.binary = "11111011", encoded.hexadecimal = "FB", encoded.unsignedValue = 251n

// Decode 8-bit binary to signed BigInt
fromTwosComplement("11111011", 2); // -5n

// Decode 8-bit hex to signed BigInt
fromTwosComplement("FB", 16, 8); // -5n

// Detailed analysis
getTwosComplementInfo(-5, 8);
/*
{
  value: -5n,
  bitWidth: 8,
  isNegative: true,
  signBit: "1",
  minSigned: -128n,
  maxSigned: 127n,
  maxUnsigned: 255n,
  binary: "11111011",
  hexadecimal: "FB",
  unsignedValue: 251n,
  signedRangeDescription: "[-128, 127]",
  unsignedRangeDescription: "[0, 255]"
}
*/
```

---

## Error Handling

All utilities throw instances of `NumberConversionError` containing a descriptive error message, typed error code, and context details:

```ts
import { NumberConversionError } from "@rahul_dadhich15/number-conversion-kit";

try {
  binaryToDecimal("1020");
} catch (err) {
  if (err instanceof NumberConversionError) {
    console.error(err.code); // "INVALID_DIGIT_FOR_BASE"
    console.error(err.details); // { char: "2", base: 2 }
  }
}
```

### Error Codes

| Error Code | Description |
|---|---|
| `INVALID_INPUT` | Input type or value is invalid (e.g. NaN, non-integer) |
| `INVALID_BINARY` | Input contains invalid binary digits or formatting |
| `INVALID_HEXADECIMAL` | Input contains invalid hexadecimal characters |
| `INVALID_DECIMAL` | Input is not a valid decimal integer representation |
| `INVALID_BASE` | Radix base is outside supported range [2, 36] |
| `INVALID_DIGIT_FOR_BASE` | Character is not a valid digit for the given base |
| `INVALID_BIT_WIDTH` | Bit width is non-integer or outside supported range [1, 4096] |
| `INTEGER_OUT_OF_RANGE` | Integer exceeds the representable range for a fixed bit width |
| `UNSAFE_NUMBER` | Value exceeds JavaScript safe integer range `[Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]` |
| `INVALID_BITWISE_OPERATION` | Invalid or unsupported bitwise operation |
| `UNSUPPORTED_UNSIGNED_BIGINT_SHIFT` | Attempted unsigned right shift (`>>>`) on BigInt |
| `INVALID_IEEE754_FORMAT` | Format is not `"float32"` or `"float64"` |
| `INVALID_IEEE754_BITS` | Bit sequence length does not match float32 (32 bits) or float64 (64 bits) |
| `INVALID_UTF8` | Invalid UTF-8 byte sequence encountered under strict decoding |
| `INCOMPLETE_BYTE_SEQUENCE` | Incomplete byte sequence (e.g. odd hex chars or non-multiple of 8 bits) |
| `EMPTY_INPUT` | Required input string is empty |
| `INPUT_TOO_LARGE` | Shift count or input size exceeds configured safety limits |

---

## Browser and Environment Compatibility

- **Browser**: Works in all modern browsers (Chrome, Edge, Firefox, Safari) with support for standard ES2020+ (`BigInt`, `TextEncoder`, `TextDecoder`, `DataView`, `ArrayBuffer`).
- **Node.js**: Compatible with Node.js 18.x, 20.x, 22.x, 24.x+.
- **Vite & React**: Seamlessly integrates into client-side build tools with zero configuration or polyfills.

---

## Development & Testing

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run tests with code coverage report
npm run test:coverage

# Run type check
npm run typecheck

# Run linter
npm run lint

# Build ESM & CommonJS outputs
npm run build

# Run consumer import integration tests
npm run test:consumer

# Check npm pack contents
npm run pack:check
```

---

## License

[MIT](LICENSE) © [Rahul Dadhich](https://github.com/rahul-dadhich15)
