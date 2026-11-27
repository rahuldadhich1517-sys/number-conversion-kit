import assert from "node:assert";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const distRoot = path.resolve(__dirname, "../dist");

console.log("--> Testing ESM root export...");
const esmRoot = await import(`file://${distRoot}/index.js`);
assert.strictEqual(typeof esmRoot.binaryToDecimal, "function");
assert.strictEqual(typeof esmRoot.baseConvertAll, "function");
assert.strictEqual(typeof esmRoot.bitwiseCalculate, "function");
assert.strictEqual(typeof esmRoot.decimalToBinary, "function");
assert.strictEqual(typeof esmRoot.hexToBinary, "function");
assert.strictEqual(typeof esmRoot.hexToDecimal, "function");
assert.strictEqual(typeof esmRoot.hexToText, "function");
assert.strictEqual(typeof esmRoot.ieee754Convert, "function");
assert.strictEqual(typeof esmRoot.numberBaseConvert, "function");
assert.strictEqual(typeof esmRoot.textToBinary, "function");
assert.strictEqual(typeof esmRoot.toTwosComplement, "function");
assert.strictEqual(esmRoot.binaryToDecimal("1010"), 10n);
console.log("✓ ESM root export verified");

console.log("--> Testing CommonJS root export...");
const cjsRoot = require(`${distRoot}/index.cjs`);
assert.strictEqual(typeof cjsRoot.binaryToDecimal, "function");
assert.strictEqual(typeof cjsRoot.baseConvertAll, "function");
assert.strictEqual(typeof cjsRoot.bitwiseCalculate, "function");
assert.strictEqual(typeof cjsRoot.decimalToBinary, "function");
assert.strictEqual(typeof cjsRoot.hexToBinary, "function");
assert.strictEqual(typeof cjsRoot.hexToDecimal, "function");
assert.strictEqual(typeof cjsRoot.hexToText, "function");
assert.strictEqual(typeof cjsRoot.ieee754Convert, "function");
assert.strictEqual(typeof cjsRoot.numberBaseConvert, "function");
assert.strictEqual(typeof cjsRoot.textToBinary, "function");
assert.strictEqual(typeof cjsRoot.toTwosComplement, "function");
assert.strictEqual(cjsRoot.binaryToDecimal("1010"), 10n);
console.log("✓ CJS root export verified");

const subpaths = [
  "binary-to-decimal",
  "base-convert-all",
  "bitwise-calculate",
  "decimal-to-binary",
  "hex-to-binary",
  "hex-to-decimal",
  "hex-to-text",
  "ieee754-convert",
  "number-base-convert",
  "text-to-binary",
  "twos-complement",
];

for (const sub of subpaths) {
  console.log(`--> Testing subpath /${sub} [ESM & CJS]...`);
  const esmMod = await import(`file://${distRoot}/${sub}/index.js`);
  assert(esmMod && Object.keys(esmMod).length > 0);

  const cjsMod = require(`${distRoot}/${sub}/index.cjs`);
  assert(cjsMod && Object.keys(cjsMod).length > 0);
  console.log(`✓ /${sub} verified`);
}

// Test sample operations across subpaths
const binToDec = await import(`file://${distRoot}/binary-to-decimal/index.js`);
assert.strictEqual(binToDec.binaryToDecimal("11111111"), 255n);

const baseAll = require(`${distRoot}/base-convert-all/index.cjs`);
const baseRes = baseAll.baseConvertAll(255n);
assert.strictEqual(baseRes.hexadecimal, "FF");

const twosComp = await import(`file://${distRoot}/twos-complement/index.js`);
assert.strictEqual(twosComp.fromTwosComplement("11111011", 2), -5n);

console.log("\nAll consumer ESM and CommonJS tests passed successfully!");
