/**
 * Convert between text and binary string representation (UTF-8). Zero dependencies.
 */

// Use native TextEncoder/TextDecoder when available for speed.
// Accessed via globalThis to avoid depending on DOM lib types.
const _global = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined
const textEncoder: any = _global && _global.TextEncoder ? new _global.TextEncoder() : null
const textDecoder: any = _global && _global.TextDecoder ? new _global.TextDecoder('utf-8') : null

export type BinaryFormat = 'spaced' | 'no-spaces' | '8-bit-groups'

/**
 * Encode a string into UTF-8 bytes.
 */
function utf8Encode(str: string): Uint8Array {
  if (textEncoder) {
    return textEncoder.encode(str)
  }

  const bytes: number[] = []

  for (let i = 0; i < str.length; i++) {
    const codePoint = str.codePointAt(i)
    if (codePoint === undefined) continue

    // If this was a surrogate pair, skip the next code unit
    if (codePoint > 0xffff) {
      i++
    }

    if (codePoint <= 0x7f) {
      bytes.push(codePoint)
    } else if (codePoint <= 0x7ff) {
      bytes.push(
        0xc0 | (codePoint >> 6),
        0x80 | (codePoint & 0x3f)
      )
    } else if (codePoint <= 0xffff) {
      bytes.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      )
    } else if (codePoint <= 0x10ffff) {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      )
    } else {
      throw new Error(`Invalid Unicode code point: ${codePoint}`)
    }
  }

  return Uint8Array.from(bytes)
}

/**
 * Decode UTF-8 bytes into a string.
 */
function utf8Decode(bytes: ArrayLike<number>): string {
  if (textDecoder && bytes instanceof Uint8Array) {
    return textDecoder.decode(bytes)
  }

  const codePoints: number[] = []

  for (let i = 0; i < bytes.length; ) {
    const byte1 = bytes[i]

    if (byte1 <= 0x7f) {
      codePoints.push(byte1)
      i++
    } else if (byte1 >= 0xc0 && byte1 <= 0xdf) {
      const byte2 = bytes[i + 1]
      if (byte2 === undefined || (byte2 & 0xc0) !== 0x80) {
        throw new Error('Invalid UTF-8 sequence')
      }
      const codePoint = ((byte1 & 0x1f) << 6) | (byte2 & 0x3f)
      codePoints.push(codePoint)
      i += 2
    } else if (byte1 >= 0xe0 && byte1 <= 0xef) {
      const byte2 = bytes[i + 1]
      const byte3 = bytes[i + 2]
      if (
        byte2 === undefined || byte3 === undefined ||
        (byte2 & 0xc0) !== 0x80 ||
        (byte3 & 0xc0) !== 0x80
      ) {
        throw new Error('Invalid UTF-8 sequence')
      }
      const codePoint =
        ((byte1 & 0x0f) << 12) |
        ((byte2 & 0x3f) << 6) |
        (byte3 & 0x3f)
      codePoints.push(codePoint)
      i += 3
    } else if (byte1 >= 0xf0 && byte1 <= 0xf7) {
      const byte2 = bytes[i + 1]
      const byte3 = bytes[i + 2]
      const byte4 = bytes[i + 3]
      if (
        byte2 === undefined || byte3 === undefined || byte4 === undefined ||
        (byte2 & 0xc0) !== 0x80 ||
        (byte3 & 0xc0) !== 0x80 ||
        (byte4 & 0xc0) !== 0x80
      ) {
        throw new Error('Invalid UTF-8 sequence')
      }
      const codePoint =
        ((byte1 & 0x07) << 18) |
        ((byte2 & 0x3f) << 12) |
        ((byte3 & 0x3f) << 6) |
        (byte4 & 0x3f)
      if (codePoint > 0x10ffff) {
        throw new Error('Invalid UTF-8 code point')
      }
      codePoints.push(codePoint)
      i += 4
    } else {
      throw new Error('Invalid UTF-8 leading byte')
    }
  }

  return String.fromCodePoint(...codePoints)
}

/**
 * Convert text to a binary string (UTF-8 bytes, 8 bits per byte).
 */
export function textToBinary(text: string, format: BinaryFormat = 'spaced'): string {
  if (!text || typeof text !== 'string') return ''

  const bytes = utf8Encode(text)
  const binaryArray: string[] = []
  for (let i = 0; i < bytes.length; i++) {
    let binaryChar = bytes[i].toString(2)
    while (binaryChar.length < 8) binaryChar = '0' + binaryChar
    binaryArray.push(binaryChar)
  }

  if (format === 'no-spaces') return binaryArray.join('')
  if (format === '8-bit-groups') return binaryArray.join('|')
  return binaryArray.join(' ')
}

/**
 * Convert a binary string back to text (interpreted as UTF-8).
 * @throws Error if input has invalid length or contains invalid UTF-8 sequences
 */
export function binaryToText(binary: string): string {
  if (!binary || typeof binary !== 'string') return ''

  const cleaned = binary.replace(/[^01]/g, '')
  if (cleaned.length === 0) throw new Error('No valid binary digits found')
  if (cleaned.length % 8 !== 0) {
    throw new Error(`Binary string length (${cleaned.length}) is not a multiple of 8`)
  }

  const bytes = new Uint8Array(cleaned.length / 8)
  let byteIndex = 0
  for (let i = 0; i < cleaned.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++) {
      // '0' -> 48, '1' -> 49, so charCodeAt(...) - 48 gives 0 or 1
      byte = (byte << 1) | (cleaned.charCodeAt(i + j) - 48)
    }
    if (byte < 0 || byte > 255) {
      throw new Error(`Invalid byte value at position ${i / 8}`)
    }
    bytes[byteIndex++] = byte
  }

  return utf8Decode(bytes)
}
