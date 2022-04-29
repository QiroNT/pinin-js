import { createQuanPinKeyboard } from './keyboard'
import type { PinInConfigRaw, PinInConfigResolved } from './types'

export function resolveConfig(raw: PinInConfigRaw): PinInConfigResolved {
  return {
    dict: new Map(Object.entries(raw.dict).map(([k, v]) => [k.charCodeAt(0), v])),
    keyboard: raw.keyboard || createQuanPinKeyboard(),
    fZh2Z: !!raw.fZh2Z,
    fSh2S: !!raw.fSh2S,
    fCh2C: !!raw.fCh2C,
    fAng2An: !!raw.fAng2An,
    fIng2In: !!raw.fIng2In,
    fEng2En: !!raw.fEng2En,
    fU2V: !!raw.fU2V,
    accelerate: !!raw.accelerate,
    format: raw.format || {},
  }
}
