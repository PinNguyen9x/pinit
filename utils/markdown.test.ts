import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './markdown'

describe('renderMarkdown — table of contents', () => {
  it('gives the sidebar decoded heading text, not HTML entities', async () => {
    const { toc } = await renderMarkdown('## Checklist & kết luận\n\ntext\n')

    expect(toc).toHaveLength(1)
    expect(toc[0].text).toBe('Checklist & kết luận')
    // The regression this guards: heading text used to be scraped out of the
    // stringified HTML, so the reader saw "Checklist &#x26; kết luận".
    expect(toc[0].text).not.toContain('&#x26;')
    expect(toc[0].text).not.toContain('&amp;')
  })

  it('strips markup from heading text but keeps the words', async () => {
    const { toc } = await renderMarkdown('## Script `agents.sh` — **tổng quát**\n')

    expect(toc[0].text).toBe('Script agents.sh — tổng quát')
  })

  it('collects h2–h4 in document order and ignores h1', async () => {
    const { toc } = await renderMarkdown(['# Title', '## Two', '### Three', '#### Four'].join('\n\n'))

    expect(toc.map((t) => [t.level, t.text])).toEqual([
      [2, 'Two'],
      [3, 'Three'],
      [4, 'Four'],
    ])
  })
})
