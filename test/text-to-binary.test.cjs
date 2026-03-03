const test = require('node:test')
const assert = require('node:assert/strict')

const { textToBinary, binaryToText } = require('../dist')

test('textToBinary and binaryToText roundtrip for ASCII', () => {
  const input = 'Hi'
  const bin = textToBinary(input, 'spaced')
  assert.equal(bin, '01001000 01101001')
  const back = binaryToText(bin)
  assert.equal(back, input)
})

test('textToBinary formats', () => {
  const input = 'Hi'
  assert.equal(textToBinary(input, 'spaced'), '01001000 01101001')
  assert.equal(textToBinary(input, 'no-spaces'), '0100100001101001')
  assert.equal(textToBinary(input, '8-bit-groups'), '01001000|01101001')
})

test('roundtrip with Unicode text', () => {
  const input = 'Привет 🌍'
  const bin = textToBinary(input, 'no-spaces')
  const back = binaryToText(bin)
  assert.equal(back, input)
})

test('binaryToText ignores non-binary characters', () => {
  const input = 'Hi'
  const spaced = textToBinary(input, 'spaced') // '01001000 01101001'
  const grouped = spaced.replace(' ', '|') // '01001000|01101001'
  const messy = `  ${grouped} \n  ` // add spaces and newline
  const back = binaryToText(messy)
  assert.equal(back, input)
})

test('binaryToText throws on invalid length', () => {
  assert.throws(
    () => binaryToText('010'),
    /not a multiple of 8/
  )
})

test('binaryToText throws when no binary digits found', () => {
  assert.throws(
    () => binaryToText('   '),
    /No valid binary digits found/
  )
})

test('binaryToText empty string returns empty string', () => {
  assert.equal(binaryToText(''), '')
})


