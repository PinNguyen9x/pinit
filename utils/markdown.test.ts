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

describe('renderMarkdown — custom heading ids', () => {
  it('uses a trailing {#id} as the heading id and hides it from the text', async () => {
    const { html, toc } = await renderMarkdown('## 1. Flow thực tế {#flow-thuc-te}\n')

    expect(toc[0].id).toBe('flow-thuc-te')
    expect(toc[0].text).toBe('1. Flow thực tế')
    expect(html).toContain('id="flow-thuc-te"')
  })

  it('makes hand-written contents links resolve to a real heading', async () => {
    const { html } = await renderMarkdown(
      ['1. [Flow thực tế](#flow-thuc-te)', '', '## Flow thực tế {#flow-thuc-te}', ''].join('\n'),
    )

    const capture = (pattern: RegExp) => {
      const found: string[] = []
      let match
      while ((match = pattern.exec(html)) !== null) found.push(match[1])
      return found
    }
    const ids = new Set(capture(/id="([^"]+)"/g))
    const targets = capture(/href="#([^"]+)"/g)

    expect(targets).toContain('flow-thuc-te')
    expect(targets.filter((t) => !ids.has(t))).toEqual([])
  })

  it('still slugifies headings that carry no marker', async () => {
    const { toc } = await renderMarkdown('## Dựng worktree\n')

    expect(toc[0].id).toBe('dựng-worktree')
    expect(toc[0].text).toBe('Dựng worktree')
  })
})
