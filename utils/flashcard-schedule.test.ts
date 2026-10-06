import { describe, expect, it } from 'vitest'
import {
  addDays,
  cardStatus,
  countByStatus,
  nextInterval,
  orderCards,
  schedule,
} from './flashcard-schedule'

describe('nextInterval — thang 1/3/7/14', () => {
  it.each([
    ['forgot', undefined, 1],
    ['forgot', 14, 1],
    ['fuzzy', undefined, 3],
    ['fuzzy', 14, 3],
    ['remember', undefined, 7],
    ['remember', 3, 7],
    ['remember', 7, 14],
    ['remember', 14, 14],
  ] as const)('%s (trước %s) → %i ngày', (rating, prev, n) => {
    expect(nextInterval(rating, prev)).toBe(n)
  })
})

describe('schedule', () => {
  it('due = hôm nay + interval, qua ranh giới tháng/năm', () => {
    expect(schedule('remember', undefined, '2026-12-28')).toEqual({
      last: '2026-12-28',
      interval: 7,
      due: '2027-01-04',
    })
    expect(addDays('2027-02-27', 3)).toBe('2027-03-02')
  })

  it('nhớ liên tiếp leo 7 → 14; quên là rơi về 1', () => {
    const a = schedule('remember', undefined, '2026-10-01')
    const b = schedule('remember', a, a.due)
    expect(b.interval).toBe(14)
    expect(schedule('forgot', b, b.due).interval).toBe(1)
  })
})

describe('trạng thái và thứ tự thẻ', () => {
  const today = '2026-10-06'
  const state = {
    't/0': { last: '2026-09-29', interval: 7, due: '2026-10-06' }, // đến hạn hôm nay
    't/1': { last: '2026-09-20', interval: 7, due: '2026-09-27' }, // quá hạn lâu hơn
    't/2': { last: '2026-10-05', interval: 3, due: '2026-10-08' }, // chưa tới
  }

  it('cardStatus', () => {
    expect(cardStatus(state['t/0'], today)).toBe('due')
    expect(cardStatus(state['t/2'], today)).toBe('later')
    expect(cardStatus(undefined, today)).toBe('new')
  })

  it('đến hạn (quá hạn lâu nhất trước) → mới → chưa tới hạn', () => {
    const cards = ['t/0', 't/1', 't/2', 't/3', 't/4'].map((key) => ({ key }))
    expect(orderCards(cards, state, today).map((c) => c.key)).toEqual([
      't/1',
      't/0',
      't/3',
      't/4',
      't/2',
    ])
  })

  it('countByStatus', () => {
    expect(countByStatus(['t/0', 't/1', 't/2', 't/3'], state, today)).toEqual({
      due: 2,
      new: 1,
      later: 1,
    })
  })
})
