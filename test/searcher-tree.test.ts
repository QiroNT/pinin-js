import { describe, expect, it } from 'vitest'
import PinIn from '../src'
import dict from '../src/dict/default'
import { SearchLogicContain, TreeSearcher } from '../src/searchers'

describe('Tree searcher', () => {
  const p = new PinIn({ dict })
  const searcher = new TreeSearcher<string>(SearchLogicContain, p)
  for (let i = 0; i < 100000; i++)
    searcher.put(i % 25565 ? `测试文本${i}` : `输出文本${i}`, i.toString())

  it('should search', () => {
    expect(searcher.search('shu')).toMatchInlineSnapshot(`
      [
        "0",
        "25565",
        "51130",
        "76695",
      ]
    `)
  })
})
