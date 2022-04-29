import type PinIn from '..'
import type { Pinyin } from '../elements/pinyin'
import type { AccelerateProvider } from '../types'
import { IndexSet, IndexSetStorage } from './indexSet'

export class AccelerateProviderString {
  s = ''

  end(i: number) {
    return i >= this.s.length
  }

  get(i: number) {
    return this.s.charCodeAt(i)
  }
}

export class Accelerator {
  private context: PinIn
  private cache: IndexSetStorage[] = []
  private searchChars!: number[]
  searchStr!: string
  private provider!: AccelerateProvider
  private str = new AccelerateProviderString()
  private partial = false

  constructor(context: PinIn) {
    this.context = context
  }

  search(s: string) {
    if (s !== this.searchStr) {
      // here we store both search token as string and char array
      // it seems stupid, but saves over 10% of accelerator overhead
      this.searchStr = s
      this.searchChars = [...s].map(c => c.charCodeAt(0))
      this.reset()
    }
  }

  getByChar(ch: number, offset: number): IndexSet {
    const c = this.context.getChar(ch)
    const ret = new IndexSet(this.searchChars[offset] === c.ch ? 2 : 0)
    for (const p of c.pinyins)
      ret.merge(this.getByPinyin(p, offset))
    return ret
  }

  getByPinyin(p: Pinyin, offset: number): IndexSet {
    for (let i = this.cache.length; i <= offset; i++)
      this.cache.push(new IndexSetStorage())

    const data = this.cache[offset]
    const ret = data.get(p.id)
    if (ret === undefined) {
      const ret2 = p.match(this.searchStr, offset, this.partial)
      data.set(ret2, p.id)
      return ret2
    }
    else {
      return ret
    }
  }

  setProvider(p: AccelerateProvider) {
    this.provider = p
  }

  setStringProvider(s: string) {
    this.str.s = s
    this.provider = this.str
  }

  reset() {
    this.cache = []
  }

  // offset - offset in search string
  // start - start point in
  check(offset: number, start: number): boolean {
    if (offset === this.searchStr.length)
      return this.partial || this.provider.end(start)

    if (this.provider.end(start))
      return false

    const s = this.getByChar(this.provider.get(start), offset)

    if (this.provider.end(start + 1)) {
      const i = this.searchStr.length - offset
      return s.get(i)
    }
    else {
      return !s.traverse(i => !this.check(offset + i, start + 1))
    }
  }

  matches(offset: number, start: number): boolean {
    if (this.partial) {
      this.partial = false
      this.reset()
    }
    return this.check(offset, start)
  }

  begins(offset: number, start: number): boolean {
    if (!this.partial) {
      this.partial = true
      this.reset()
    }
    return this.check(offset, start)
  }

  contains(offset: number, start: number): boolean {
    if (!this.partial) {
      this.partial = true
      this.reset()
    }
    for (let i = start; !this.provider.end(i); i++) {
      if (this.check(offset, i))
        return true
    }
    return false
  }

  common(s1: number, s2: number, max: number): number {
    for (let i = 0; ; i++) {
      if (i >= max)
        return max
      const a = this.provider.get(s1 + i)
      const b = this.provider.get(s2 + i)
      if (a !== b || a === 0)
        return i
    }
  }
}
