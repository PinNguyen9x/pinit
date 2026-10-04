import { describe, expect, it } from 'vitest'
import { practiceStreak, scoreBand, vnDay } from './practice-insights'

describe('vnDay', () => {
  it('đổi sang ngày giờ Việt Nam (UTC+7)', () => {
    expect(vnDay('2026-10-04T16:59:00Z')).toBe('2026-10-04') // 23:59 VN
    expect(vnDay('2026-10-04T17:00:00Z')).toBe('2026-10-05') // 00:00 VN hôm sau
  })
})

describe('practiceStreak', () => {
  it('đếm ngày liên tiếp tính lùi từ hôm nay', () => {
    expect(practiceStreak(['2026-10-02', '2026-10-03', '2026-10-04'], '2026-10-04')).toBe(3)
  })

  it('hôm nay chưa luyện thì chuỗi tới hôm qua vẫn giữ', () => {
    expect(practiceStreak(['2026-10-02', '2026-10-03'], '2026-10-04')).toBe(2)
  })

  it('đứt một ngày → chỉ tính đoạn gần nhất; bỏ hai ngày → 0', () => {
    expect(practiceStreak(['2026-09-30', '2026-10-02', '2026-10-03'], '2026-10-03')).toBe(2)
    expect(practiceStreak(['2026-10-01'], '2026-10-04')).toBe(0)
    expect(practiceStreak([], '2026-10-04')).toBe(0)
  })

  it('qua ranh giới tháng', () => {
    expect(practiceStreak(['2026-09-30', '2026-10-01'], '2026-10-01')).toBe(2)
  })
})

describe('scoreBand', () => {
  it.each([
    [10, 'Xuất sắc', 'success'],
    [9, 'Xuất sắc', 'success'],
    [8.5, 'Vững', 'success'],
    [7, 'Vững', 'success'],
    [6, 'Gần rồi', 'warning'],
    [5, 'Gần rồi', 'warning'],
    [4.9, 'Ôn lại notes', 'error'],
    [0, 'Ôn lại notes', 'error'],
  ])('%s → %s', (score, label, tone) => {
    expect(scoreBand(score)).toEqual({ label, tone })
  })
})
