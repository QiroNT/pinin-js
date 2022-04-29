export class Cache<K, V> {
  private data: Map<K, V> = new Map<K, V>()
  private generator: (key: K) => V

  constructor(generator: (key: K) => V) {
    this.generator = generator
  }

  public get(key: K): V {
    let ret = this.data.get(key)
    if (ret === undefined) {
      ret = this.generator(key)
      if (ret !== undefined)
        this.data.set(key, ret)
    }
    return ret
  }

  [Symbol.iterator]() {
    return this.data[Symbol.iterator]()
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this.data.forEach(callbackfn, thisArg)
  }

  public clear(): void {
    this.data.clear()
  }
}
