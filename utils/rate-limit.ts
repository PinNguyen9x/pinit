// Rate limit cửa sổ cố định, giữ trong RAM của process.
//
// Đủ cho bối cảnh này: một container, một owner. Restart container là reset
// bộ đếm — chấp nhận được, kẻ dò passphrase vẫn bị chặn ở tốc độ bcrypt.

interface Entry {
  count: number
  resetAt: number
}

export function createRateLimiter({ max, windowMs }: { max: number; windowMs: number }) {
  const hits = new Map<string, Entry>()

  function sweep(now: number) {
    hits.forEach((e, key) => {
      if (e.resetAt <= now) hits.delete(key)
    })
  }

  return {
    /** Số giây phải chờ nếu đang bị chặn, ngược lại 0. */
    retryAfter(key: string, now = Date.now()): number {
      const e = hits.get(key)
      if (!e || e.resetAt <= now || e.count < max) return 0
      return Math.ceil((e.resetAt - now) / 1000)
    },
    recordFailure(key: string, now = Date.now()) {
      // Chặn Map phình vô hạn khi bị dò từ nhiều IP.
      if (hits.size > 1000) sweep(now)
      const e = hits.get(key)
      if (!e || e.resetAt <= now) hits.set(key, { count: 1, resetAt: now + windowMs })
      else e.count++
    },
    reset(key: string) {
      hits.delete(key)
    },
  }
}
