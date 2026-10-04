/**
 * LRU tối giản trên Map: Map giữ thứ tự chèn, nên "dùng gần nhất" = xoá rồi
 * set lại để đẩy xuống cuối, còn entry cũ nhất luôn là key đầu tiên.
 */
export function createLruCache<V>(max: number) {
  const map = new Map<string, V>()
  return {
    get(key: string): V | undefined {
      if (!map.has(key)) return undefined
      const value = map.get(key) as V
      map.delete(key)
      map.set(key, value)
      return value
    },
    set(key: string, value: V) {
      map.delete(key)
      map.set(key, value)
      if (map.size > max) map.delete(map.keys().next().value as string)
    },
    get size() {
      return map.size
    },
    clear() {
      map.clear()
    },
  }
}
