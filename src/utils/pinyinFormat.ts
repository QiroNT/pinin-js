import type { Pinyin } from '../elements/pinyin'
import { hasInitialPinyin } from '../elements/pinyin'

const OFFSET: string[] = ['ui', 'iu', 'uan', 'uang', 'ian', 'iang', 'ua', 'ie', 'uo', 'iong', 'iao', 've', 'ia']

const NONE: Record<string, string> = { a: 'a', o: 'o', e: 'e', i: 'i', u: 'u', v: 'ü' }

const FIRST: Record<string, string> = { a: 'ā', o: 'ō', e: 'ē', i: 'ī', u: 'ū', v: 'ǖ' }

const SECOND: Record<string, string> = { a: 'á', o: 'ó', e: 'é', i: 'í', u: 'ú', v: 'ǘ' }

const THIRD: Record<string, string> = { a: 'ǎ', o: 'ǒ', e: 'ě', i: 'ǐ', u: 'ǔ', v: 'ǚ' }

const FOURTH: Record<string, string> = { a: 'à', o: 'ò', e: 'è', i: 'ì', u: 'ù', v: 'ǜ' }

const TONES: Record<string, string>[] = [NONE, FIRST, SECOND, THIRD, FOURTH]

const SYMBOLS: Record<string, string> = {
  'a': 'ㄚ',
  'o': 'ㄛ',
  'e': 'ㄜ',
  'er': 'ㄦ',
  'ai': 'ㄞ',
  'ei': 'ㄟ',
  'ao': 'ㄠ',
  'ou': 'ㄡ',
  'an': 'ㄢ',
  'en': 'ㄣ',
  'ang': 'ㄤ',
  'eng': 'ㄥ',
  'ong': 'ㄨㄥ',
  'i': 'ㄧ',
  'ia': 'ㄧㄚ',
  'iao': 'ㄧㄠ',
  'ie': 'ㄧㄝ',
  'iu': 'ㄧㄡ',
  'ian': 'ㄧㄢ',
  'in': 'ㄧㄣ',
  'iang': 'ㄧㄤ',
  'ing': 'ㄧㄥ',
  'iong': 'ㄩㄥ',
  'u': 'ㄨ',
  'ua': 'ㄨㄚ',
  'uo': 'ㄨㄛ',
  'uai': 'ㄨㄞ',
  'ui': 'ㄨㄟ',
  'uan': 'ㄨㄢ',
  'un': 'ㄨㄣ',
  'uang': 'ㄨㄤ',
  'ueng': 'ㄨㄥ',
  'uen': 'ㄩㄣ',
  'v': 'ㄩ',
  've': 'ㄩㄝ',
  'van': 'ㄩㄢ',
  'vang': 'ㄩㄤ',
  'vn': 'ㄩㄣ',
  'b': 'ㄅ',
  'p': 'ㄆ',
  'm': 'ㄇ',
  'f': 'ㄈ',
  'd': 'ㄉ',
  't': 'ㄊ',
  'n': 'ㄋ',
  'l': 'ㄌ',
  'g': 'ㄍ',
  'k': 'ㄎ',
  'h': 'ㄏ',
  'j': 'ㄐ',
  'q': 'ㄑ',
  'x': 'ㄒ',
  'zh': 'ㄓ',
  'ch': 'ㄔ',
  'sh': 'ㄕ',
  'r': 'ㄖ',
  'z': 'ㄗ',
  'c': 'ㄘ',
  's': 'ㄙ',
  'w': 'ㄨ',
  'y': 'ㄧ',
  '1': '',
  '2': 'ˊ',
  '3': 'ˇ',
  '4': 'ˋ',
  '0': '˙',
  '': '',
}

const LOCAL: Record<string, string> = {
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

export function formatPinyinRaw(p: Pinyin) {
  return p.toString().slice(0, -1)
}

export function formatPinyinNumber(p: Pinyin) {
  return p.toString()
}

export function formatPinyinPhonetic(p: Pinyin) {
  let s = p.toString()
  const str = LOCAL[s.slice(0, -1)]
  if (str)
    s = str + s.charAt(s.length - 1)
  let res = ''

  let split: string[]
  if (!hasInitialPinyin(s)) {
    split = ['', s.slice(0, -1), s.slice(-1)]
  }
  else {
    const i = s.length > 2 && s.charAt(1) === 'h' ? 2 : 1
    split = [s.slice(0, i), s.slice(i, -1), s.slice(-1)]
  }
  const weak = split[2] === '0'
  if (weak)
    res += SYMBOLS[split[2]]
  res += SYMBOLS[split[0]]
  res += SYMBOLS[split[1]]
  if (!weak)
    res += SYMBOLS[split[2]]
  return res
}

export function formatPinyinUnicode(p: Pinyin) {
  let res = ''
  const s = p.toString()
  let finale

  if (!hasInitialPinyin(s)) {
    finale = s.slice(0, -1)
  }
  else {
    const i = s.length > 2 && s.charAt(1) === 'h' ? 2 : 1
    res += s.slice(0, i)
    finale = s.slice(i, -1)
  }

  const offset = OFFSET.includes(finale) ? 1 : 0
  if (offset === 1)
    res += finale.charAt(0)
  const group = TONES[s.charCodeAt(s.length - 1) - 48 /* 0 */]
  res += group[finale.charAt(offset)]
  if (finale.length > offset + 1)
    res += finale.slice(offset + 1)
  return res
}
