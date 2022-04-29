import type { PinInSearchLogic } from '../types'
import { Accelerator } from '../utils/accelerator'
import { Compressor } from '../utils/compresser'
import type { Phoneme } from '../elements/phoneme'
import type PinIn from '..'
import type { PinInTicket } from '..'
import { SearchLogicEqual } from '.'

const THRESHOLD = 128

interface Node<T> {
  get(p: TreeSearcher<T>, ret: Set<number>, offset: number): void
  get(p: TreeSearcher<T>, ret: Set<number>): void
  put(p: TreeSearcher<T>, name: number, identifier: number): Node<T>
}

class NSlice<T> implements Node<T> {
  exit: Node<T> = new NMap<T>()
  start: number
  end: number

  constructor(start: number, end: number) {
    this.start = start
    this.end = end
  }

  get(p: TreeSearcher<T>, ret: Set<number>, offset?: number): void {
    if (offset === undefined)
      this.exit.get(p, ret)
    else
      this.getWithStart(p, ret, offset, 0)
  }

  put(p: TreeSearcher<T>, name: number, identifier: number): Node<T> {
    const length = this.end - this.start
    const match = p.acc.common(this.start, name, length)
    if (match >= length) {
      this.exit = this.exit.put(p, name + length, identifier)
    }
    else {
      this.cut(p, this.start + match)
      this.exit = this.exit.put(p, name + match, identifier)
    }
    return this.start === this.end ? this.exit : this
  }

  private cut(p: TreeSearcher<T>, offset: number) {
    const insert = new NMap<T>()
    if (offset + 1 === this.end) {
      insert.setChild(p.strs.get(offset), this.exit)
    }
    else {
      const half = new NSlice<T>(offset + 1, this.end)
      half.exit = this.exit
      insert.setChild(p.strs.get(offset), half)
    }
    this.exit = insert
    this.end = offset
  }

  private getWithStart(p: TreeSearcher<T>, ret: Set<number>, offset: number, start: number) {
    if (this.start + start === this.end) {
      this.exit.get(p, ret, offset)
    }
    else if (offset === p.acc.searchStr.length) {
      if (p.logic !== SearchLogicEqual)
        this.exit.get(p, ret)
    }
    else {
      const ch = p.strs.get(this.start + start)
      p.acc.getByChar(ch, offset).forEach(i =>
        this.getWithStart(p, ret, offset + i, start + 1))
    }
  }
}

class NDense<T> implements Node<T> {
  data: number[] = []

  get(p: TreeSearcher<T>, ret: Set<number>, offset?: number): void {
    if (offset === undefined) {
      for (let i = 0; i < this.data.length / 2; i++)
        ret.add(this.data[i * 2 + 1])
      return
    }
    const full = p.logic === SearchLogicEqual
    if (!full && p.acc.searchStr.length === offset) {
      this.get(p, ret)
    }
    else {
      for (let i = 0; i < this.data.length / 2; i++) {
        const ch = this.data[i * 2]
        if (full ? p.acc.matches(offset, ch) : p.acc.begins(offset, ch))
          ret.add(this.data[i * 2 + 1])
      }
    }
  }

  put(p: TreeSearcher<T>, name: number, identifier: number): Node<T> {
    if (this.data.length >= THRESHOLD) {
      const pattern = this.data[0]
      const ret = new NSlice<T>(pattern, pattern + this.match(p))
      for (let j = 0; j < this.data.length / 2; j++)
        ret.put(p, this.data[j * 2], this.data[j * 2 + 1])
      ret.put(p, name, identifier)
      return ret
    }
    else {
      this.data.push(name)
      this.data.push(identifier)
      return this
    }
  }

  private match(p: TreeSearcher<T>): number {
    for (let i = 0; ; i++) {
      const a = p.strs.get(this.data[0] + i)
      for (let j = 1; j < this.data.length / 2; j++) {
        const b = p.strs.get(this.data[j * 2] + i)
        if (a !== b || a === 0)
          return i
      }
    }
  }
}

class NMap<T> implements Node<T> {
  children: Map<number, Node<T>> | undefined
  leaves: Set<number> = new Set<number>()

  get(p: TreeSearcher<T>, ret: Set<number>, offset?: number): void {
    if (offset === undefined) {
      for (const i of this.leaves)
        ret.add(i)
      if (this.children !== undefined)
        this.children.forEach(n => n.get(p, ret))
      return
    }

    if (p.acc.searchStr.length === offset) {
      if (p.logic === SearchLogicEqual)
        for (const i of this.leaves) ret.add(i)
      else this.get(p, ret)
    }
    else if (this.children !== undefined) {
      this.children.forEach((n, c) => p.acc.getByChar(c, offset).forEach(i => n.get(p, ret, offset + i)))
    }
  }

  put(p: TreeSearcher<T>, name: number, identifier: number): Node<T> {
    if (p.strs.get(name) === 0) {
      this.leaves.add(identifier)
    }
    else {
      this.init()
      const ch = p.strs.get(name)
      let sub = this.children!.get(ch)
      if (sub === undefined)
        this.children!.set(ch, sub = new NDense<T>())
      sub = sub.put(p, name + 1, identifier)
      this.children!.set(ch, sub)
    }
    return !(this instanceof NAcc) && this.children && this.children.size > 32
      ? new NAcc<T>(p, this)
      : this
  }

  setChild(ch: number, n: Node<T>) {
    this.init()
    this.children!.set(ch, n)
  }

  init() {
    if (this.children === undefined)
      this.children = new Map()
  }
}

class NAcc<T> extends NMap<T> {
  index: Map<Phoneme, Set<number>> = new Map()

  constructor(p: TreeSearcher<T>, n: NMap<T>) {
    super()
    this.children = n.children
    this.leaves = n.leaves
    this.reload(p)
    p.naccs.push(this)
  }

  get(p: TreeSearcher<T>, ret: Set<number>, offset?: number): void {
    if (offset === undefined)
      return super.get(p, ret)

    if (p.acc.searchStr.length === offset) {
      if (p.logic === SearchLogicEqual)
        for (const i of this.leaves) ret.add(i)
      else super.get(p, ret)
    }
    else {
      const ch = p.acc.searchStr.charCodeAt(offset)
      const n = this.children!.get(ch)
      if (n !== undefined)
        n.get(p, ret, offset + 1)
      for (const [k, v] of this.index) {
        if (!k.match(p.acc.searchStr, offset, true).isEmpty()) {
          for (const i of v) {
            p.acc.getByChar(i, offset)
              .forEach(j => this.children!.get(i)!.get(p, ret, offset + j))
          }
        }
      }
    }
  }

  put(p: TreeSearcher<T>, name: number, identifier: number): Node<T> {
    super.put(p, name, identifier)
    this.indexChar(p, p.strs.get(name))
    return this
  }

  reload(p: TreeSearcher<T>) {
    this.index.clear()
    this.children!.forEach((n, c) => this.indexChar(p, c))
  }

  private indexChar(p: TreeSearcher<T>, c: number) {
    const ch = p.context.getChar(c)
    for (const py of ch.pinyins) {
      const key = py.phonemes[0]
      const value = this.index.get(key) ?? new Set()
      value.add(c)
      this.index.set(key, value)
    }
  }
}

export class TreeSearcher<T> {
  root: Node<T> = new NDense<T>()

  objects: T[] = []
  naccs: NAcc<T>[] = []
  acc: Accelerator
  strs: Compressor = new Compressor()
  logic: PinInSearchLogic
  context: PinIn
  ticket: PinInTicket

  constructor(logic: PinInSearchLogic, context: PinIn) {
    this.logic = logic
    this.context = context
    this.acc = new Accelerator(context)
    this.acc.setProvider(this.strs)
    this.ticket = context.ticket(() => {
      this.naccs.forEach(i => i.reload(this))
      this.acc.reset()
    })
  }

  put(name: string, identifier: T): void {
    this.ticket.renew()
    const pos = this.strs.put(name)
    const end = this.logic === SearchLogicEqual ? name.length : 1
    for (let i = 0; i < end; i++)
      this.root = this.root.put(this, pos + i, this.objects.length)
    this.objects.push(identifier)
  }

  search(s: string): T[] {
    this.ticket.renew()
    this.acc.search(s)
    const ret = new Set<number>()
    this.root.get(this, ret, 0)
    return [...ret].map(i => this.objects[i])
  }

  refresh(): void {
    this.ticket.renew()
  }
}
