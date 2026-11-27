import { describe, it, expect } from "vitest";
import {
  ieee754Convert,
  float32ToBits,
  float64ToBits,
  bitsToFloat32,
  bitsToFloat64,
  getIEEE754Breakdown,
} from "../../src/ieee754-convert";
import { NumberConversionError } from "../../src/shared";

describe("ieee754-convert", () => {
  describe("float32 (binary32)", () => {
    it("converts 0.0, +0, -0", () => {
      expect(float32ToBits(0)).toBe("0".repeat(32));
      expect(float32ToBits(-0)).toBe("1" + "0".repeat(31));

      const pZero = getIEEE754Breakdown(0, "float32");
      expect(pZero.classification).toBe("positive_zero");
      expect(pZero.signBit).toBe("0");
      expect(pZero.isZero).toBe(true);

      const nZero = getIEEE754Breakdown(-0, "float32");
      expect(nZero.classification).toBe("negative_zero");
      expect(nZero.signBit).toBe("1");
      expect(nZero.isZero).toBe(true);
    });

    it("converts 1.0", () => {
      const b32 = float32ToBits(1.0);
      expect(b32).toBe("00111111100000000000000000000000"); // 0x3F800000
      expect(bitsToFloat32(b32)).toBe(1.0);

      const info = getIEEE754Breakdown(1.0, "float32");
      expect(info.classification).toBe("normalized");
      expect(info.biasedExponent).toBe(127);
      expect(info.unbiasedExponent).toBe(0);
      expect(info.hexadecimal).toBe("3F800000");
    });

    it("converts Infinities and NaN", () => {
      const posInf = getIEEE754Breakdown(Infinity, "float32");
      expect(posInf.classification).toBe("positive_infinity");
      expect(posInf.isInfinity).toBe(true);

      const negInf = getIEEE754Breakdown(-Infinity, "float32");
      expect(negInf.classification).toBe("negative_infinity");
      expect(negInf.isInfinity).toBe(true);

      const nanVal = getIEEE754Breakdown(NaN, "float32");
      expect(nanVal.classification).toBe("nan");
      expect(nanVal.isNaN).toBe(true);
    });

    it("detects subnormals", () => {
      // Smallest positive subnormal in float32 is ~1.401298e-45
      const sub = bitsToFloat32("00000000000000000000000000000001");
      const info = getIEEE754Breakdown(sub, "float32");
      expect(info.isSubnormal).toBe(true);
      expect(info.classification).toBe("subnormal");
      expect(info.biasedExponent).toBe(0);
    });
  });

  describe("float64 (binary64)", () => {
    it("converts 1.0 in float64", () => {
      const b64 = float64ToBits(1.0);
      expect(b64.length).toBe(64);
      expect(bitsToFloat64(b64)).toBe(1.0);

      const info = ieee754Convert(1.0, { format: "float64" });
      expect(info.classification).toBe("normalized");
      expect(info.biasedExponent).toBe(1023);
      expect(info.unbiasedExponent).toBe(0);
      expect(info.hexadecimal).toBe("3FF0000000000000");
    });

    it("round-trips negative double values", () => {
      const val = -42.125;
      const bits = float64ToBits(val);
      expect(bitsToFloat64(bits)).toBe(val);

      const info = ieee754Convert(val);
      expect(info.signBit).toBe("1");
      expect(info.signInterpretation).toBe("-");
    });
  });

  describe("validation", () => {
    it("rejects invalid bit sequences", () => {
      expect(() => bitsToFloat32("0101")).toThrowError(NumberConversionError);
      expect(() => bitsToFloat64("0101")).toThrowError(NumberConversionError);
    });

    it("rejects invalid formats", () => {
      expect(() =>
        // @ts-expect-error testing invalid format
        getIEEE754Breakdown(1.0, "float128")
      ).toThrowError(NumberConversionError);
    });
  });
});
