import { createQuanPinKeyboard } from './keyboard'
import type { PinInConfigRaw, PinInConfigResolved } from './types'

export function resolveConfig(raw: PinInConfigRaw): PinInConfigResolved {
  const fuzzy: [string, string][] = []
  if (raw.fuzzy) {
    const replaces = new Set<string>()
    for (const str of raw.fuzzy) {
      const bi = str.split('|')
      if (bi.length > 1) {
        for (const b of bi) {
          for (const a of bi) {
            if (a !== b)
              replaces.add(`${a}-${b}`)
          }
        }
      }
      else {
        const rep = str.split('>')
        if (rep.length !== 2 || rep[0] === rep[1])
          continue
        replaces.add(`${rep[0]}-${rep[1]}`)
      }
    }
    for (const str of replaces) {
      const [from, to] = str.split('-')
      fuzzy.push([from, to])
    }
  }

  return {
    dict: new Map(Object.entries(raw.dict).map(([k, v]) => [k.charCodeAt(0), v])),
    keyboard: raw.keyboard || createQuanPinKeyboard(),
    fuzzy,
    accelerate: !!raw.accelerate,
  }
}
