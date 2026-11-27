import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "binary-to-decimal/index": "src/binary-to-decimal/index.ts",
    "base-convert-all/index": "src/base-convert-all/index.ts",
    "bitwise-calculate/index": "src/bitwise-calculate/index.ts",
    "decimal-to-binary/index": "src/decimal-to-binary/index.ts",
    "hex-to-binary/index": "src/hex-to-binary/index.ts",
    "hex-to-decimal/index": "src/hex-to-decimal/index.ts",
    "hex-to-text/index": "src/hex-to-text/index.ts",
    "ieee754-convert/index": "src/ieee754-convert/index.ts",
    "number-base-convert/index": "src/number-base-convert/index.ts",
    "text-to-binary/index": "src/text-to-binary/index.ts",
    "twos-complement/index": "src/twos-complement/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  target: "es2022",
  outDir: "dist",
});
