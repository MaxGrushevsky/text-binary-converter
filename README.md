# text-to-binary

Convert text to binary string and back. Zero dependencies. Supports full Unicode via UTF-8.

Small, focused utility for encoding any JavaScript string (including emoji, Cyrillic and other Unicode characters) into a sequence of `0`/`1` and decoding it back.

## Install

```bash
npm install text-to-binary
```

## Usage

### Basic usage (TypeScript / ESM)

```ts
import { textToBinary, binaryToText } from 'text-to-binary'

textToBinary('Hi')           // '01001000 01101001'
textToBinary('Hi', 'no-spaces')  // '0100100001101001'
textToBinary('Привет 🌍')   // valid UTF-8 binary
binaryToText('01001000 01101001') // 'Hi'

// different output formats
textToBinary('Hi', 'spaced')       // '01001000 01101001'
textToBinary('Hi', 'no-spaces')    // '0100100001101001'
textToBinary('Hi', '8-bit-groups') // '01001000|01101001'
```

### CommonJS (Node.js)

```js
const { textToBinary, binaryToText } = require('text-to-binary')

const bin = textToBinary('Hello')
console.log(bin)                // '01001000 01100101 01101100 01101100 01101111'
console.log(binaryToText(bin))  // 'Hello'
```

### In bundlers (Vite, Webpack, etc.)

Just import it as a normal npm package:

```ts
import { textToBinary } from 'text-to-binary'

const bits = textToBinary('Frontend ❤️')
```

## API

- **textToBinary(text: string, format?: 'spaced' \| 'no-spaces' \| '8-bit-groups'): string**
  - **Purpose**: encodes the input string as UTF-8 and returns a string of `0` and `1`.
  - **Parameters**:
    - `text` — any JavaScript string (all Unicode characters are supported).
    - `format` (optional):
      - `spaced` — bytes separated by spaces, default format.
      - `no-spaces` — one continuous string of bits with no separators.
      - `8-bit-groups` — bytes separated by `|`, handy for visual parsing or post-processing.
  - **Returns**: a string of `0` and `1` in the chosen format.

- **binaryToText(binary: string): string**
  - **Purpose**: takes a binary string and decodes it back to text, interpreting bytes as UTF-8.
  - **Behavior**:
    - if `binary` is an empty string, returns an empty string;
    - ignores all characters except `0` and `1` (you can freely add spaces, newlines, separators);
    - checks that the length of the cleaned string is a multiple of 8;
    - interprets every 8 bits as a byte and decodes UTF-8.
  - **Throws (`Error`)** when:
    - no binary digits are found;
    - the length after cleaning is not a multiple of 8;
    - the byte sequence is not valid UTF-8.

## Error handling examples

```ts
import { binaryToText } from 'text-to-binary'

try {
  binaryToText('010') // length is not a multiple of 8
} catch (e) {
  console.error((e as Error).message) // "Binary string length (3) is not a multiple of 8"
}

try {
  binaryToText('   ') // no binary digits at all
} catch (e) {
  console.error((e as Error).message) // "No valid binary digits found"
}
```

## Use cases

- **Educational projects**: demonstrate binary representation and UTF-8 behavior.
- **Logging / debugging**: log binary representation of strings for analysis.
- **Visualization**: highlight/animate bits in web interfaces.
- **Data transformation**: simple text-based representation of binary data when compactness is not critical.

## License

MIT
