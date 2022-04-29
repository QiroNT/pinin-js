import type { Keyboard } from './keyboard'
import type { Accelerator } from './utils/accelerator'
import type PinIn from '.'

export type PinInDictRaw = Record<string, string[]>
export type PinInDictResolved = Map<number, string[]>

export interface PinInFormat {}

export interface PinInConfigRaw {
  dict: PinInDictRaw
  keyboard?: Keyboard
  fZh2Z?: boolean
  fSh2S?: boolean
  fCh2C?: boolean
  fAng2An?: boolean
  fIng2In?: boolean
  fEng2En?: boolean
  fU2V?: boolean
  accelerate?: boolean
  format?: PinInFormat
}
export type PinInConfigResolved = {
  [key in Exclude<keyof PinInConfigRaw, 'dict'>]: NonNullable<PinInConfigRaw[key]>
} & {
  dict: PinInDictResolved
}

export interface PinInSearchLogic {
  testAcc(a: Accelerator, offset: number, start: number): boolean
  test(p: PinIn, s1: string, s2: string): boolean
  raw(s1: string, s2: string): boolean
}

export interface AccelerateProvider {
  end(i: number): boolean
  get(i: number): number
}
