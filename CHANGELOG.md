# Changelog

All notable changes to `@rahul_dadhich15/number-conversion-kit` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-27

### Added

- Initial production release of `@rahul_dadhich15/number-conversion-kit`.
- 11 standalone, zero-runtime-dependency number and base conversion utilities:
  1. `binary-to-decimal`: High-precision binary integer to BigInt/Number/string conversion with prefix and separator support.
  2. `base-convert-all`: Simultaneous integer conversion across binary, decimal, hexadecimal, and octal with grouping and formatting.
  3. `bitwise-calculate`: 32-bit Number and arbitrary-precision BigInt bitwise calculator with full bit breakdowns and operations (AND, OR, XOR, NOT, left shift, arithmetic right shift, logical unsigned right shift).
  4. `decimal-to-binary`: Decimal integer conversion to binary with mathematical and two's complement modes.
  5. `hex-to-binary`: Hexadecimal integer conversion to binary with leading zero preservation and nibble alignment.
  6. `hex-to-decimal`: Hexadecimal integer conversion to decimal BigInt/safe Number with signed bit-width support.
  7. `hex-to-text`: Bidirectional UTF-8/ASCII/Latin-1 hex byte encoder and decoder with strict and replacement modes.
  8. `ieee754-convert`: Full IEEE 754 binary32 (single precision) and binary64 (double precision) breakdown with DataView bit manipulation.
  9. `number-base-convert`: Arbitrary base conversion between bases 2 through 36 using exact BigInt arithmetic.
  10. `text-to-binary`: Bidirectional text and 8-bit binary byte encoder/decoder.
  11. `twos-complement`: Configurable bit-width two's complement signed integer encoder and decoder with range validation.
- Dual ESM and CommonJS builds with TypeScript declarations for root and all 11 subpath exports.
- Complete Vitest test suite achieving >96% statement and line coverage with 119 tests.
