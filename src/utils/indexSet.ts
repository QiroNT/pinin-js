export class IndexSet {
  value: number

  public constructor(value = 0) {
    this.value = value
  }

  public set(index: number): void {
    const i = 0x1 << index
    this.value |= i
  }

  public get(index: number): boolean {
    const i = 0x1 << index
    return (this.value & i) !== 0
  }

  public merge(s: IndexSet): void {
    this.value = this.value === 0x1 ? s.value : (this.value |= s.value)
  }

  public traverse(p: (index: number) => boolean): boolean {
    let v = this.value
    for (let i = 0; i < 7; i++) {
      if ((v & 0x1) === 0x1 && !p(i))
        return false
      else if (v === 0)
        return true
      v >>= 1
    }
    return true
  }

  public forEach(c: (index: number) => void): void {
    let v = this.value
    for (let i = 0; i < 7; i++) {
      if ((v & 0x1) === 0x1)
        c(i)
      else if (v === 0)
        return
      v >>= 1
    }
  }

  public offset(i: number): void {
    this.value <<= i
  }

  public toString(): string {
    let str = ''
    this.traverse((i) => {
      str += i
      str += ', '
      return true
    })
    if (str.length !== 0)
      return str.slice(0, -2)
    else return '0'
  }

  isEmpty(): boolean {
    return this.value === 0x0
  }

  copy(): IndexSet {
    return new IndexSet(this.value)
  }
}

export const NONE = new IndexSet(0x0)
export const ZERO = new IndexSet(0x1)
export const ONE = new IndexSet(0x2)

export class IndexSetStorage {
  private data = new Uint16Array(16)

  public set(is: IndexSet, index: number): void {
    if (index >= this.data.length) {
      let size = index
      size |= size >> 1
      size |= size >> 2
      size |= size >> 4
      size |= size >> 8
      size |= size >> 16
      const replace = new Uint16Array(size + 1)
      for (let i = 0; i < this.data.length; i++)
        replace[i] = this.data[i]
      this.data = replace
    }
    this.data[index] = is.value + 1
  }

  public get(index: number): IndexSet | undefined {
    if (index >= this.data.length)
      return
    const ret = this.data[index]
    if (ret === 0)
      return
    return new IndexSet(ret - 1)
  }
}
