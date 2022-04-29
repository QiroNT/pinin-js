import type PinIn from '..'
import type { PinInSearchLogic } from '../types'
import { SimpleSearcher } from './simple'
import { SearchLogicBegin, SearchLogicContain, SearchLogicEqual } from '.'

class Stats<T> {
  data: Map<T, number> = new Map()

  count(key: T) {
    const cnt = this.data.get(key) || 0
    this.data.set(key, cnt + 1)
    if (cnt === Number.MAX_SAFE_INTEGER)
      this.data.forEach((v, k) => this.data.set(k, v / 2))
  }

  least(keys: T[], extra: T): T {
    let ret = extra
    let cnt = this.data.get(extra) || 0
    for (const i of keys) {
      const value = this.data.get(i) || 0
      if (value < cnt) {
        ret = i
        cnt = value
      }
    }
    return ret
  }

  reset() {
    this.data.clear()
  }
}

export class CachedSearcher<T> extends SimpleSearcher<T> {
  all: number[] = []
  scale: number
  lenCached = 0
  maxCached = 0
  total = 0
  stats = new Stats<string>()
  cache = new Map<string, number[]>()

  constructor(logic: PinInSearchLogic, context: PinIn, scale = 1) {
    super(logic, context)
    this.scale = scale
  }

  put(name: string, identifier: T) {
    this.reset()
    for (let i = 0; i < name.length; i++) this.context.getChar(name.charCodeAt(i))
    this.total += name.length
    this.all.push(this.all.length)
    this.lenCached = 0
    this.maxCached = 0
    super.put(name, identifier)
  }

  search(name: string): T[] {
    this.ticket.renew()
    if (this.all.length === 0)
      return []
    if (this.maxCached === 0) {
      const totalSearch = this.logic === SearchLogicContain ? this.total : this.all.length
      this.maxCached = Math.ceil(this.scale * Math.log(2 * totalSearch) / Math.log(2) + 16)
    }
    if (this.lenCached === 0)
      this.lenCached = Math.ceil(Math.log(this.maxCached) / Math.log(8))
    return this.test(name).map(i => this.objs[i])
  }

  reset() {
    super.reset()
    this.stats.reset()
    this.lenCached = 0
    this.maxCached = 0
  }

  private filter(name: string): number[] {
    if (!name)
      return this.all

    let ret = this.cache.get(name)
    this.stats.count(name)
    if (ret === undefined) {
      const base = this.filter(name.slice(0, -1))
      if (this.cache.size >= this.maxCached) {
        const least = this.stats.least([...this.cache.keys()], name)
        if (least !== name)
          this.cache.delete(least)
        else return base
      }

      this.acc.search(name)
      const tmp: number[] = []
      const filter = this.logic === SearchLogicEqual ? SearchLogicBegin : this.logic
      for (const i of base) {
        if (filter.testAcc(this.acc, 0, this.strs.offsets()[i]))
          tmp.push(i)
      }

      if (tmp.length === base.length)
        ret = base
      else
        ret = tmp

      this.cache.set(name, ret)
    }
    return ret
  }

  private test(name: string): number[] {
    const is = this.filter(name.slice(0, Math.min(name.length, this.lenCached)))
    if (this.logic === SearchLogicEqual || name.length > this.lenCached) {
      const ret: number[] = []
      this.acc.search(name)
      for (const i of is) {
        if (this.logic.testAcc(this.acc, 0, this.strs.offsets()[i]))
          ret.push(i)
      }
      return ret
    }
    else {
      return is
    }
  }
}
