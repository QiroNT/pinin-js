import type PinIn from '..'
import type { PinInTicket } from '..'
import type { PinInSearchLogic } from '../types'
import { Accelerator } from '../utils/accelerator'
import { Compressor } from '../utils/compresser'

export class SimpleSearcher<T = number> {
  objs: T[] = []
  acc: Accelerator
  strs: Compressor
  context: PinIn
  logic: PinInSearchLogic
  ticket: PinInTicket

  constructor(logic: PinInSearchLogic, context: PinIn) {
    this.context = context
    this.logic = logic
    this.acc = new Accelerator(context)
    this.strs = new Compressor()
    this.acc.setProvider(this.strs)
    this.ticket = context.ticket(this.reset.bind(this))
  }

  put(name: string, identifier: T) {
    this.strs.put(name)
    for (let i = 0; i < name.length; i++)
      this.context.getChar(name.charCodeAt(i))
    this.objs.push(identifier)
  }

  search(name: string): T[] {
    const ret = new Set<T>()
    this.acc.search(name)
    const offsets = this.strs.offsets()
    for (let i = 0; i < offsets.length; i++) {
      const s = offsets[i]
      if (this.logic.testAcc(this.acc, 0, s))
        ret.add(this.objs[i])
    }
    return [...ret]
  }

  reset() {
    this.acc.reset()
  }
}
