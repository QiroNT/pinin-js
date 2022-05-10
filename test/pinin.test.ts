import { describe, expect, it } from 'vitest'
import PinIn from '../src'
import dict from '../src/dict/default'
import { createDaQianKeyboard } from '../src/keyboard'

describe('PinIn standerd', () => {
  const p = new PinIn({ dict })

  it('should do contains', () => {
    expect(p.contains('测试文本', 'shi4wen')).toBe(true)
    expect(p.contains('测试文本', '测si')).toBe(false)
    expect(p.contains('测试文本', 'ceshi1')).toBe(false)
  })

  it('should do matches', () => {
    expect(p.matches('测试文本', 'ceshiwenben')).toBe(true)
    expect(p.matches('测试文本', 'ceshi')).toBe(false)
  })

  it('should do begins', () => {
    expect(p.begins('测试文本', 'ceshi')).toBe(true)
    expect(p.begins('测试文本', 'shi')).toBe(false)
  })
})

describe('PinIn convert', () => {
  const p = new PinIn({
    dict,
    fuzzy: ['sh|s', 'en>e'],
  })

  it('should do contains', () => {
    expect(p.contains('测试文本', 'si4we')).toBe(true)
    expect(p.contains('测试文本', 'cehi')).toBe(false)
    expect(p.contains('测试文本', 'cesi1')).toBe(false)
  })
})

describe('PinIn keyboard', () => {
  const p = new PinIn({
    dict,
    keyboard: createDaQianKeyboard(),
  })

  it('should do contains', () => {
    expect(p.contains('测试文本', 'hk4g4jp61p3')).toBe(true)
    expect(p.contains('测试文本', 'hkgjp1')).toBe(true)
    expect(p.contains('錫', 'vu6')).toBe(true)
    expect(p.contains('鑽石', 'yj0')).toBe(true)
    expect(p.contains('物質', 'j456')).toBe(true)
    expect(p.contains('腳手架', 'rul3g.3ru84')).toBe(true)
    expect(p.contains('鵝', 'k6')).toBe(true)
    expect(p.contains('葉', 'u,4')).toBe(true)
    expect(p.contains('共同', 'ej/wj/')).toBe(true)
  })
})
