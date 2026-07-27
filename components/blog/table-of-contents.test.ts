import { describe, expect, it } from 'vitest'
import { pickActiveHeadingId } from './toc-active-heading'

// `top` is each heading's distance from the top of the viewport, as
// getBoundingClientRect() reports it — negative once scrolled past.
const HEADINGS = [
  { id: 'intro', top: -1200 },
  { id: 'setup', top: -300 },
  { id: 'usage', top: 420 },
  { id: 'wrap-up', top: 980 },
]

describe('pickActiveHeadingId', () => {
  it('picks the last heading scrolled up past the header', () => {
    expect(pickActiveHeadingId(HEADINGS, false)).toBe('setup')
  })

  it('stays on the current heading while reading a long section', () => {
    // The regression this guards: the old IntersectionObserver only lit up a
    // heading while it sat in a narrow band near the top of the screen, so
    // mid-section — the common case — nothing was highlighted.
    const deepInSection = [
      { id: 'intro', top: -9000 },
      { id: 'setup', top: -4200 },
      { id: 'usage', top: 3100 },
    ]
    expect(pickActiveHeadingId(deepInSection, false)).toBe('setup')
  })

  it('highlights the first heading before the reader reaches any of them', () => {
    const allBelow = [
      { id: 'intro', top: 300 },
      { id: 'setup', top: 900 },
    ]
    expect(pickActiveHeadingId(allBelow, false)).toBe('intro')
  })

  it('pins to the last heading once the page is scrolled to the end', () => {
    // Trailing sections are often too short to ever reach the top of the screen.
    expect(pickActiveHeadingId(HEADINGS, true)).toBe('wrap-up')
  })

  it('treats a heading resting just under the header as reached', () => {
    expect(pickActiveHeadingId([{ id: 'a', top: 80 }], false)).toBe('a')
    expect(pickActiveHeadingId([{ id: 'a', top: 81 }], false)).toBe('a')
  })

  it('returns nothing for a post with no headings', () => {
    expect(pickActiveHeadingId([], false)).toBe('')
    expect(pickActiveHeadingId([], true)).toBe('')
  })
})
