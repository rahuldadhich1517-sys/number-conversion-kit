import { describe, it, expect } from "vitest";

// Root imports
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
  NumberConversionError,
} from "../../src";

// Subpath imports
import * as BinToDec from "../../src/binary-to-decimal";
import * as BaseAll from "../../src/base-convert-all";
import * as Bitwise from "../../src/bitwise-calculate";
import * as DecToBin from "../../src/decimal-to-binary";
import * as HexToBin from "../../src/hex-to-binary";
import * as HexToDec from "../../src/hex-to-decimal";
import * as HexToTxt from "../../src/hex-to-text";
import * as IEEE from "../../src/ieee754-convert";
import * as NumBase from "../../src/number-base-convert";
import * as TxtToBin from "../../src/text-to-binary";
import * as TwosComp from "../../src/twos-complement";

describe("integration & public exports", () => {
  it("verifies all 11 utilities are exported from root entry point", () => {
    expect(typeof binaryToDecimal).toBe("function");
    expect(typeof baseConvertAll).toBe("function");
    expect(typeof bitwiseCalculate).toBe("function");
    expect(typeof decimalToBinary).toBe("function");
    expect(typeof hexToBinary).toBe("function");
    expect(typeof hexToDecimal).toBe("function");
    expect(typeof hexToText).toBe("function");
    expect(typeof ieee754Convert).toBe("function");
    expect(typeof numberBaseConvert).toBe("function");
    expect(typeof textToBinary).toBe("function");
    expect(typeof toTwosComplement).toBe("function");
    expect(typeof fromTwosComplement).toBe("function");
    expect(typeof NumberConversionError).toBe("function");
  });

  it("verifies subpath exports modules contain expected functions", () => {
    expect(BinToDec.binaryToDecimal).toBeDefined();
    expect(BaseAll.baseConvertAll).toBeDefined();
    expect(Bitwise.bitwiseCalculate).toBeDefined();
    expect(DecToBin.decimalToBinary).toBeDefined();
    expect(HexToBin.hexToBinary).toBeDefined();
    expect(HexToDec.hexToDecimal).toBeDefined();
    expect(HexToTxt.hexToText).toBeDefined();
    expect(IEEE.ieee754Convert).toBeDefined();
    expect(NumBase.numberBaseConvert).toBeDefined();
    expect(TxtToBin.textToBinary).toBeDefined();
    expect(TwosComp.toTwosComplement).toBeDefined();
  });

  it("executes an end-to-end multi-conversion pipeline", () => {
    // 1. Text to hex
    const hex = HexToTxt.textToHex("Antigravity");
    // 2. Hex to binary
    const bin = HexToBin.hexToBinary(hex);
    // 3. Binary to decimal BigInt
    const decVal = BinToDec.binaryToDecimal(bin);
    // 4. Decimal BigInt to base 36
    const b36 = NumBase.numberBaseConvert(decVal.toString(), 10, 36);
    // 5. Back to base 10
    const decBack = NumBase.numberBaseConvert(b36, 36, 10);
    expect(BigInt(decBack)).toBe(decVal);
  });
});
