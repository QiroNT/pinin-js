import type { PinInConfigRaw, PinInConfigResolved } from './types'
import { resolveConfig } from './config'
import { Cache } from './utils/cache'
import { Phoneme } from './elements/phoneme'
import { Char } from './elements/char'
import { Pinyin } from './elements/pinyin'

export * from './dict'
export * from './searchers'
export * from './keyboard'
export * from './types'
export * from './utils/pinyinFormat'

export class PinInTicket {
  modification: number
  runnable: () => void
  context: PinIn

  constructor(runnable: () => void, context: PinIn) {
    this.runnable = runnable
    this.modification = context.modification
    this.context = context
  }

  renew() {
    const i = this.context.modification
    if (this.modification !== i) {
      this.modification = i
      this.runnable()
    }
  }
}

export default class PinIn {
  config: PinInConfigResolved
  private totalPinyins = 0

  phonemes: Cache<string, Phoneme> = new Cache(str => new Phoneme(str, this.config))
  pinyins: Cache<string, Pinyin> = new Cache(str => new Pinyin(str, this, this.totalPinyins++))
  chars: Map<number, Char> = new Map()

  modification = 0

  constructor(config: PinInConfigRaw) {
    this.config = resolveConfig(config)
    for (const [c, ss] of this.config.dict) {
      if (!ss)
        continue
      this.chars.set(c, new Char(c, ss.map(s => this.pinyins.get(s))))
    }
  }

  begins(s1: string, s2: string): boolean {
    if (s1.length === 0)
      return s1.startsWith(s2)
    else return this.check(s1, 0, s2, 0, true)
  }

  contains(s1: string, s2: string): boolean {
    if (s1.length === 0) {
      return s1.includes(s2)
    }
    else {
      for (let i = 0; i < s1.length; i++) {
        if (this.check(s1, i, s2, 0, true))
          return true
      }
      return false
    }
  }

  matches(s1: string, s2: string): boolean {
    if (s1.length === 0)
      return s1 === s2
    else return this.check(s1, 0, s2, 0, false)
  }

  private check(s1: string, start1: number, s2: string, start2: number, partial: boolean): boolean {
    if (start2 === s2.length) {
      return partial || start1 === s1.length
    }
    else {
      const r = this.getChar(s1.charCodeAt(start1))
      const s = r.match(s2, start2, partial)
      if (start1 === s1.length - 1) {
        const i = s2.length - start2
        return s.get(i)
      }
      else {
        return !s.traverse(i => !this.check(s1, start1 + 1, s2, start2 + i, partial))
      }
    }
  }

  getChar(c: number): Char {
    return this.chars.get(c) || new Char(c, [])
  }

  ticket(runnable: () => void): PinInTicket {
    return new PinInTicket(runnable, this)
  }
}
