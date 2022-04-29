import type { PinInSearchLogic } from '../types'

export { SimpleSearcher } from './simple'
export { CachedSearcher } from './cached'
export { TreeSearcher } from './tree'

export const SearchLogicBegin: PinInSearchLogic = {
  testAcc: (a, offset, start) => a.begins(offset, start),
  test: (p, s1, s2) => p.begins(s1, s2),
  raw: (s1, s2) => s1.startsWith(s2),
}

export const SearchLogicContain: PinInSearchLogic = {
  testAcc: (a, offset, start) => a.contains(offset, start),
  test: (p, s1, s2) => p.contains(s1, s2),
  raw: (s1, s2) => s1.includes(s2),
}

export const SearchLogicEqual: PinInSearchLogic = {
  testAcc: (a, offset, start) => a.matches(offset, start),
  test: (p, s1, s2) => p.matches(s1, s2),
  raw: (s1, s2) => s1 === s2,
}
