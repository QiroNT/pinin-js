import type { Keyboard } from './keyboard'
import type { Accelerator } from './utils/accelerator'
import type PinIn from '.'

export type PinInDictRaw = Record<string, string[]>
export type PinInDictResolved = Map<number, string[]>

export interface PinInFormat {}

export interface PinInConfigRaw {
  dict: PinInDictRaw
  keyboard?: Keyboard
  fuzzy?: string[]
  accelerate?: boolean
}
export type PinInConfigResolved = {
  [key in Exclude<keyof PinInConfigRaw, 'dict' | 'fuzzy'>]: NonNullable<PinInConfigRaw[key]>
} & {
  dict: PinInDictResolved
  fuzzy: [string, string][]
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
