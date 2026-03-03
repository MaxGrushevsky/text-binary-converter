# text-binary-converter

> Convert text to binary string and back (UTF-8). Supports full Unicode. Zero dependencies. TypeScript-first.

[![npm](https://img.shields.io/npm/v/text-binary-converter)](https://www.npmjs.com/package/text-binary-converter)
[![license](https://img.shields.io/npm/l/text-binary-converter)](./LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/maksimgrushevsky/text-to-binary/ci.yml)](https://github.com/maksimgrushevsky/text-to-binary/actions)

## Features

- Encodes any JavaScript string (ASCII, Cyrillic, CJK, emoji) to binary using **UTF-8**
- Three output formats: `spaced`, `no-spaces`, `8-bit-groups`
- Decodes binary back to the original string with full UTF-8 validation
- `binaryToText` ignores non-binary characters (spaces, pipes, newlines) automatically
- Written in **TypeScript** — ships with full type declarations
- **Zero runtime dependencies** — pure UTF-8 implementation, no `Buffer`, no `TextEncoder`
- Works in Node.js, Deno, Bun, and modern browsers
- ESM + CommonJS dual build

## Install

```bash
npm install text-binary-converter
# or
pnpm add text-binary-converter
# or
yarn add text-binary-converter
```

## Usage

```ts
import { textToBinary, binaryToText } from 'text-binary-converter'

// Encode
textToBinary('Hi')                    // '01001000 01101001'
textToBinary('Hi', 'no-spaces')       // '0100100001101001'
textToBinary('Hi', '8-bit-groups')    // '01001000|01101001'

// Multi-byte Unicode works too
textToBinary('Привет')                // valid UTF-8 binary
textToBinary('🌍')                    // 4-byte UTF-8 sequence

// Decode
binaryToText('01001000 01101001')     // 'Hi'
binaryToText('0100100001101001')      // 'Hi' — no-spaces format
binaryToText('01001000|01101001')     // 'Hi' — separators are ignored
binaryToText('  01001000 01101001\n') // 'Hi' — whitespace is ignored

// Round-trip
const bin = textToBinary('Hello, World! 🌍')
binaryToText(bin) // 'Hello, World! 🌍'
```

CommonJS (require) is also supported:

```js
const { textToBinary, binaryToText } = require('text-binary-converter')

const bin = textToBinary('Hello')
console.log(bin)               // '01001000 01100101 01101100 01101100 01101111'
console.log(binaryToText(bin)) // 'Hello'
```

## API

### `textToBinary(text: string, format?: BinaryFormat): string`

Encodes a string to its UTF-8 binary representation.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | — | Input string (any Unicode is supported) |
| `format` | `BinaryFormat` | `'spaced'` | Output format (see table below) |

**`BinaryFormat` options:**

| Value | Example output | Description |
|---|---|---|
| `'spaced'` | `'01001000 01101001'` | Bytes separated by spaces |
| `'no-spaces'` | `'0100100001101001'` | Continuous bit string, no separators |
| `'8-bit-groups'` | `'01001000\|01101001'` | Bytes separated by `\|` |

Returns `''` for empty or non-string input.

### `binaryToText(binary: string): string`

Decodes a binary string back to text, interpreting bytes as UTF-8.

| Detail | Behaviour |
|---|---|
| Non-binary chars | All characters except `0` and `1` are **stripped** before decoding |
| Formats accepted | `spaced`, `no-spaces`, `8-bit-groups`, or any custom separator |
| Empty input | Returns `''` |
| Invalid length | **Throws** `Error` if cleaned length is not a multiple of 8 |
| No binary digits | **Throws** `Error` if no `0`/`1` characters are found |
| Invalid UTF-8 | **Throws** `Error` if the byte sequence is not valid UTF-8 |

## Error handling

```ts
import { binaryToText } from 'text-binary-converter'

try {
  binaryToText('010') // not a multiple of 8
} catch (e) {
  console.error((e as Error).message)
  // 'Binary string length (3) is not a multiple of 8'
}

try {
  binaryToText('   ') // no binary digits
} catch (e) {
  console.error((e as Error).message)
  // 'No valid binary digits found'
}
```

## Use cases

- **Education** — demonstrate binary representation and UTF-8 encoding
- **Debugging** — log binary form of strings for low-level analysis
- **Visualization** — animate or highlight individual bits in UI
- **Data encoding** — simple text-based binary representation when compactness is not required

## Development

```bash
git clone https://github.com/maksimgrushevsky/text-to-binary.git
cd text-to-binary
npm install

npm run build         # compile to dist/
npm test              # run tests once
npm run test:watch    # run tests in watch mode
npm run typecheck     # TypeScript type-check only
```

## License

[MIT](./LICENSE)
