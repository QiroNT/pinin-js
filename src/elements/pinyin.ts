import type PinIn from '..'
import { IndexSet, ZERO } from '../utils/indexSet'
import type { Phoneme } from './phoneme'

export function hasInitialPinyin(s: string): boolean {
  return !['a', 'e', 'i', 'o', 'u', 'v'].includes(s.charAt(0))
}

export class Pinyin {
  duo = false
  id: number
  raw: string

  phonemes!: Phoneme[]

  reload(str: string, pinin: PinIn) {
    const split = pinin.config.keyboard.split(str)
    const l: Phoneme[] = []
    for (const s of split) l.push(pinin.phonemes.get(s))
    if (str.charAt(1) === 'h' && pinin.config.keyboard.type === 'QUANPIN') {
      // here we implement sequence matching in quanpin, with a dirty trick
      // if initial is one of 'zh' 'sh' 'ch', and fuzzy is not on, we slice it
      // the first is one if 'z' 's' 'c', and the second is 'h'
      const sequence = str.charAt(0)
      const slice = sequence === 'z'
        ? !pinin.config.fZh2Z
        : sequence === 'c'
          ? !pinin.config.fCh2C
          : sequence === 's'
            ? !pinin.config.fSh2S
            : false
      if (slice) {
        l[0] = pinin.phonemes.get(sequence)
        l.splice(1, 0, pinin.phonemes.get('h'))
      }
    }
    this.phonemes = l

    this.duo = pinin.config.keyboard.duo
  }

  constructor(str: string, pinin: PinIn, id: number) {
    this.raw = str
    this.id = id
    this.reload(str, pinin)
  }

  match(str: string, start: number, partial: boolean): IndexSet {
    if (this.duo) {
      // in shuangpin we require initial and final both present,
      // the phoneme, which is tone here, is optional
      let ret = ZERO
      ret = this.phonemes[0].matchBatch(str, ret, start, partial)
      ret = this.phonemes[1].matchBatch(str, ret, start, partial)
      ret.merge(this.phonemes[2].matchBatch(str, ret, start, partial))
      return ret
    }
    else {
      // in other keyboards, match of precedent phoneme
      // is compulsory to match subsequent phonemes
      // for example, zhong1, z+h+ong+1 cannot match zong or zh1
      let active = ZERO
      const ret = new IndexSet()
      for (const phoneme of this.phonemes) {
        active = phoneme.matchBatch(str, active, start, partial)
        if (active.isEmpty())
          break
        ret.merge(active)
      }
      return ret
    }
  }

  toString() {
    return this.raw
  }
}
