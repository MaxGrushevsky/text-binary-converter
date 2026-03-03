import { describe, it, expect } from 'vitest'
import { textToBinary, binaryToText } from './index'

describe('textToBinary', () => {
  it('encodes ASCII text (spaced format by default)', () => {
    expect(textToBinary('Hi')).toBe('01001000 01101001')
    expect(textToBinary('A')).toBe('01000001')
  })

  it('encodes in no-spaces format', () => {
    expect(textToBinary('Hi', 'no-spaces')).toBe('0100100001101001')
  })

  it('encodes in 8-bit-groups format', () => {
    expect(textToBinary('Hi', '8-bit-groups')).toBe('01001000|01101001')
  })

  it('encodes multi-byte Unicode characters', () => {
    const bin = textToBinary('Привет', 'no-spaces')
    expect(bin.length % 8).toBe(0)
    expect(binaryToText(bin)).toBe('Привет')
  })

  it('encodes emoji (4-byte UTF-8)', () => {
    const bin = textToBinary('🌍', 'no-spaces')
    expect(bin.length % 8).toBe(0)
    expect(binaryToText(bin)).toBe('🌍')
  })

  it('returns empty string for empty input', () => {
    expect(textToBinary('')).toBe('')
  })

  it('returns empty string for non-string input', () => {
    // @ts-expect-error testing runtime guard
    expect(textToBinary(null)).toBe('')
    // @ts-expect-error testing runtime guard
    expect(textToBinary(undefined)).toBe('')
  })
})

describe('binaryToText', () => {
  it('decodes spaced binary back to ASCII', () => {
    expect(binaryToText('01001000 01101001')).toBe('Hi')
  })

  it('decodes no-spaces binary', () => {
    expect(binaryToText('0100100001101001')).toBe('Hi')
  })

  it('strips non-binary characters (pipes, spaces, newlines)', () => {
    expect(binaryToText('01001000|01101001')).toBe('Hi')
    expect(binaryToText('  01001000 01101001  \n')).toBe('Hi')
  })

  it('decodes multi-byte Unicode', () => {
    const bin = textToBinary('Привет 🌍', 'no-spaces')
    expect(binaryToText(bin)).toBe('Привет 🌍')
  })

  it('returns empty string for empty input', () => {
    expect(binaryToText('')).toBe('')
  })

  it('returns empty string for non-string input', () => {
    // @ts-expect-error testing runtime guard
    expect(binaryToText(null)).toBe('')
  })

  it('throws when no binary digits found', () => {
    expect(() => binaryToText('   ')).toThrow(/No valid binary digits found/)
  })

  it('throws when length is not a multiple of 8', () => {
    expect(() => binaryToText('010')).toThrow(/not a multiple of 8/)
  })
})

describe('round-trip', () => {
  const cases = ['Hi', 'Hello, World!', 'Привет 🌍', '0123456789', '']

  for (const text of cases) {
    it(`"${text || '(empty)'}"`, () => {
      expect(binaryToText(textToBinary(text))).toBe(text)
    })
  }
})
