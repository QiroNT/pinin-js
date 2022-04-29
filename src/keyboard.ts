import { hasInitialPinyin } from './elements/pinyin'

export const DAQIAN_KEYS = {
  '': '',
  '0': '',
  '1': ' ',
  '2': '6',
  '3': '3',
  '4': '4',
  'a': '8',
  'ai': '9',
  'an': '0',
  'ang': ';',
  'ao': 'l',
  'b': '1',
  'c': 'h',
  'ch': 't',
  'd': '2',
  'e': 'k',
  'ei': 'o',
  'en': 'p',
  'eng': '/',
  'er': '-',
  'f': 'z',
  'g': 'e',
  'h': 'c',
  'i': 'u',
  'ia': 'u8',
  'ian': 'u0',
  'iang': 'u;',
  'iao': 'ul',
  'ie': 'u,',
  'in': 'up',
  'ing': 'u/',
  'iong': 'm/',
  'iu': 'u.',
  'j': 'r',
  'k': 'd',
  'l': 'x',
  'm': 'a',
  'n': 's',
  'o': 'i',
  'ong': 'j/',
  'ou': '.',
  'p': 'q',
  'q': 'f',
  'r': 'b',
  's': 'n',
  'sh': 'g',
  't': 'w',
  'u': 'j',
  'ua': 'j8',
  'uai': 'j9',
  'uan': 'j0',
  'uang': 'j;',
  'uen': 'mp',
  'ueng': 'j/',
  'ui': 'jo',
  'un': 'jp',
  'uo': 'ji',
  'v': 'm',
  'van': 'm0',
  'vang': 'm;',
  've': 'm,',
  'vn': 'mp',
  'w': 'j',
  'x': 'v',
  'y': 'u',
  'z': 'y',
  'zh': '5',
}

export const XIAOHE_KEYS = {
  ai: 'd',
  an: 'j',
  ang: 'h',
  ao: 'c',
  ch: 'i',
  ei: 'w',
  en: 'f',
  eng: 'g',
  ia: 'x',
  ian: 'm',
  iang: 'l',
  iao: 'n',
  ie: 'p',
  in: 'b',
  ing: 'k',
  iong: 's',
  iu: 'q',
  ong: 's',
  ou: 'z',
  sh: 'u',
  ua: 'x',
  uai: 'k',
  uan: 'r',
  uang: 'l',
  ui: 'v',
  un: 'y',
  uo: 'o',
  ve: 't',
  ue: 't',
  vn: 'y',
  zh: 'v',
}

export const ZIRANMA_KEYS = {
  ai: 'l',
  an: 'j',
  ang: 'h',
  ao: 'k',
  ch: 'i',
  ei: 'z',
  en: 'f',
  eng: 'g',
  ia: 'w',
  ian: 'm',
  iang: 'd',
  iao: 'c',
  ie: 'x',
  in: 'n',
  ing: 'y',
  iong: 's',
  iu: 'q',
  ong: 's',
  ou: 'b',
  sh: 'u',
  ua: 'w',
  uai: 'y',
  uan: 'r',
  uang: 'd',
  ui: 'v',
  un: 'p',
  uo: 'o',
  ve: 't',
  ue: 't',
  vn: 'p',
  zh: 'v',
}

export const PHONETIC_LOCAL = {
  yi: 'i',
  you: 'iu',
  yin: 'in',
  ye: 'ie',
  ying: 'ing',
  wu: 'u',
  wen: 'un',
  yu: 'v',
  yue: 've',
  yuan: 'van',
  yun: 'vn',
  ju: 'jv',
  jue: 'jve',
  juan: 'jvan',
  jun: 'jvn',
  qu: 'qv',
  que: 'qve',
  quan: 'qvan',
  qun: 'qvn',
  xu: 'xv',
  xue: 'xve',
  xuan: 'xvan',
  xun: 'xvn',
  shi: 'sh',
  si: 's',
  chi: 'ch',
  ci: 'c',
  zhi: 'zh',
  zi: 'z',
  ri: 'r',
}

export function keyboardCutterStandard(str: string): string[] {
  const ret = []
  let cursor = 0

  // initial
  if (hasInitialPinyin(str)) {
    cursor = str.length > 2 && str.charAt(1) === 'h' ? 2 : 1
    ret.push(str.slice(0, cursor))
  }

  // final
  if (str.length !== cursor + 1)
    ret.push(str.slice(cursor, str.length - 1))

  // tone
  ret.push(str.slice(str.length - 1))

  return ret
}

export function keyboardCutterZero(str: string): string[] {
  const ss = keyboardCutterStandard(str)
  if (ss.length === 2) {
    const finale = ss[0]
    ss[0] = finale.charAt(0)
    ss.push(finale.length === 2 ? finale.charAt(1) : finale)
  }
  return ss
}

export class Keyboard {
  type: 'QUANPIN' | 'DADIAN' | 'XIAOHE' | 'ZIRANMA'
  local?: Record<string, string>
  keys?: Record<string, string>
  cutter: (str: string) => string[]
  duo: boolean

  constructor(type: 'QUANPIN' | 'DADIAN' | 'XIAOHE' | 'ZIRANMA', options: {
    local?: Record<string, string>
    keys?: Record<string, string>
    cutter: (str: string) => string[]
    duo: boolean
  }) {
    this.type = type
    this.local = options.local
    this.keys = options.keys
    this.cutter = options.cutter
    this.duo = options.duo
  }

  getStrKeys(str: string): string {
    return this.keys?.[str] || str
  }

  split(str: string): string[] {
    if (this.local) {
      const cut = str.slice(0, -1)
      const alt = this.local[cut]
      if (alt)
        str = alt + str.charAt(str.length - 1)
    }
    return this.cutter(str)
  }
}

export function createQuanPinKeyboard() {
  return new Keyboard('QUANPIN', {
    cutter: keyboardCutterStandard,
    duo: false,
  })
}

export function createDaQianKeyboard() {
  return new Keyboard('DADIAN', {
    local: PHONETIC_LOCAL,
    keys: DAQIAN_KEYS,
    cutter: keyboardCutterStandard,
    duo: false,
  })
}

export function createXiaoHeKeyboard() {
  return new Keyboard('XIAOHE', {
    keys: XIAOHE_KEYS,
    cutter: keyboardCutterZero,
    duo: true,
  })
}

export function createZiRanMaKeyboard() {
  return new Keyboard('ZIRANMA', {
    keys: ZIRANMA_KEYS,
    cutter: keyboardCutterZero,
    duo: true,
  })
}
