import type { PinInConfigResolved } from '../types'
import { IndexSet } from '../utils/indexSet'

function strCmp(a: string, b: string, aStart: number) {
  const len = Math.min(a.length - aStart, b.length)
  for (let i = 0; i < len; i++) {
    if (a.charAt(i + aStart) !== b.charAt(i))
      return i
  }
  return len
}

export class Phoneme {
  strs!: string[]

  reload(str: string, config: PinInConfigResolved) {
    const ret = new Set<string>()
    ret.add(str)

    for (const [from, to] of config.fuzzy) {
      if (!str.includes(from))
        continue
      ret.add(str.replace(from, to))
    }

    this.strs = Array.from(ret).map(k => config.keyboard.keys?.[k] || k)
  }

  constructor(str: string, config: PinInConfigResolved) {
    this.reload(str, config)
  }

  matchBatch(source: string, idx: IndexSet, start: number, partial: boolean) {
    if (this.strs.length === 1 && this.strs[0].length === 0)
      return new IndexSet(idx.value)
    const ret = new IndexSet()
    idx.forEach((i) => {
      const is = this.match(source, start + i, partial)
      is.offset(i)
      ret.merge(is)
    })
    return ret
  }

  match(source: string, start: number, partial: boolean) {
    const ret = new IndexSet()
    if (this.strs.length === 1 && this.strs[0].length === 0)
      return ret
    for (const str of this.strs) {
      const size = strCmp(source, str, start)
      if (partial && start + size === source.length)
        ret.set(size) // ending match
      else if (size === str.length)
        ret.set(size) // full match
    }
    return ret
  }
}
