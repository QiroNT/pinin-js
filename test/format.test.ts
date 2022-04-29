import { describe, expect, it } from 'vitest'
import PinIn from '../src'
import dict from '../src/dict/default'
import { formatPinyinNumber, formatPinyinPhonetic, formatPinyinRaw, formatPinyinUnicode } from '../src/utils/pinyinFormat'

describe('format', () => {
  const p = new PinIn({ dict })
  const c = p.getChar('圆'.charCodeAt(0))
  const y = c.pinyins[0]

  it('should format', () => {
    expect(formatPinyinRaw(y)).toMatchInlineSnapshot('"yuan"')
    expect(formatPinyinNumber(y)).toMatchInlineSnapshot('"yuan2"')
    expect(formatPinyinUnicode(y)).toMatchInlineSnapshot('"yuán"')
    expect(formatPinyinPhonetic(y)).toMatchInlineSnapshot('"ㄩㄢˊ"')
  })
})
