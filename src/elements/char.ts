import type { IndexSet } from '../utils/indexSet'
import { NONE, ONE } from '../utils/indexSet'
import type { Pinyin } from './pinyin'

export class Char {
  ch: number
  pinyins: Pinyin[]

  constructor(ch: number, pinyins: Pinyin[]) {
    this.ch = ch
    this.pinyins = pinyins
  }

  match(str: string, start: number, partial: boolean): IndexSet {
    const ret = (str.charCodeAt(start) === this.ch ? ONE : NONE).copy()
    for (const p of this.pinyins) ret.merge(p.match(str, start, partial))
    return ret
  }
}

export const dummyChar = new Char(0, [])
