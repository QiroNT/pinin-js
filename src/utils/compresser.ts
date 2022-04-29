import type { AccelerateProvider } from '../types'

export class Compressor implements AccelerateProvider {
  chars: number[] = []
  strs: number[] = []

  offsets(): number[] {
    return this.strs
  }

  put(s: string): number {
    this.strs.push(this.chars.length)
    for (let i = 0; i < s.length; i++)
      this.chars.push(s.charCodeAt(i))

    this.chars.push(0)
    return this.strs[this.strs.length - 1]
  }

  end(i: number): boolean {
    return this.chars[i] === 0
  }

  get(i: number): number {
    return this.chars[i]
  }
}
