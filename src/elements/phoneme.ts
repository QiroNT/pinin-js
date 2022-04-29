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

    if (config.fCh2C && str.startsWith('c'))
      ret.add('c').add('ch')
    if (config.fSh2S && str.startsWith('s'))
      ret.add('s').add('sh')
    if (config.fZh2Z && str.startsWith('z'))
      ret.add('z').add('zh')
    if (config.fU2V && str.startsWith('v'))
      ret.add(`u${str.slice(1)}`)
    if ((config.fAng2An && str.endsWith('ang'))
      || (config.fEng2En && str.endsWith('eng'))
      || (config.fIng2In && str.endsWith('ing')))
      ret.add(str.slice(0, -1))
    if ((config.fAng2An && str.endsWith('an'))
      || (config.fEng2En && str.endsWith('en'))
      || (config.fIng2In && str.endsWith('in')))
      ret.add(`${str}g`)

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
