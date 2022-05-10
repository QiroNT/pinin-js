# pinin-js

[![NPM version](https://img.shields.io/npm/v/pinin)](https://www.npmjs.com/package/pinin)

这是一个 TypeScript 版的 [PinIn](https://github.com/Towdium/PinIn) 库，用于解决各类汉语拼音匹配问题。\
对即时匹配提供基于 NFA 的实现，对索引匹配提供类后缀树的实现。除此之外，它还可以将汉字转换为拼音字符串，包括 ASCII，Unicode 和注音符号。\
关于此库的更多介绍和实现细节，请点击上方的源库链接到源库查看。

此库的默认词典大小相对较大(≈597KB, gzip≈130KB, brotli≈109KB)，依据使用情况可能需要自行对词典做相应调整。

## 示例

这里展示一下此项目的一些基础接口的使用方式，更多示例可以在 `test` 目录中找到。

```typescript
import PinIn, { formatPinyinPhonetic, formatPinyinUnicode, SearchLogicContain, TreeSearcher, defaultDict } from 'pinin'

// context
const p = new PinIn({ dict: defaultDict })

// direct match
console.assert(p.contains('测试文本', 'ceshi'))

// indexed match
const searcher = new TreeSearcher<number>(SearchLogicContain, p)
p.put('测试文本', 0)
console.assert(searcher.search('ceshi').includes(0))

// fuzzy spelling (| for bidirectional, > for one-way)
const p2 = new PinIn({ dict: defaultDict, fuzzy: ['sh|s', 'en>e'] })
console.assert(p.contains('测试文本', 'cesiwe'))

// pinyin format
const c = p.genChar('圆'.charCodeAt(0))
const y = c.pinyins[0]
console.assert(formatPinyinUnicode(y) === 'yuán')
console.assert(formatPinyinPhonetic(y) === 'ㄩㄢˊ')
```

## 致谢

感谢 PinIn 项目的原作者 Towdium，本项目基本只是迁移工作。

内置的拼音数据来自于 [地球拼音](https://github.com/rime/rime-terra-pinyin) 和 [pinyin-data](https://github.com/mozillazg/pinyin-data)。
