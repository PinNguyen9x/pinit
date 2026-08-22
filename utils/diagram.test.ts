import { describe, expect, it } from 'vitest'
import { renderDiagram } from './diagram'
import { renderMarkdown } from './markdown'

describe('diagram smoke', () => {
  it('renders inline svg with css variables', () => {
    const html = renderDiagram('flowchart LR\n  A[GitHub] --> B[(VPS)]')
    expect(html).toContain('<figure class="diagram">')
    expect(html).toContain('<svg')
    expect(html).toContain('var(--diagram-fg)')
    expect(html).not.toContain('@import')
  })

  it('falls back to source on broken input instead of throwing', () => {
    const html = renderDiagram('flowchart LR\n  A --> ')
    expect(html).toContain('diagram--failed')
  })

  it('substitutes every fence in the markdown pipeline', async () => {
    const { html } = await renderMarkdown(
      '# Hi\n\n```mermaid\nflowchart LR\n  A --> B\n```\n\ntext\n\n```mermaid\ngitGraph\n  commit\n  branch dev\n  commit\n```\n',
    )
    expect(html).not.toContain('data-diagram-slot')
    expect(html).not.toContain('class="mermaid"')
    expect((html.match(/<svg/g) ?? []).length).toBe(2)
    // Mỗi sơ đồ phải có namespace id riêng, không thì defs của cái sau đè cái trước.
    const prefixes = new Set(Array.from(html.matchAll(/id="(d[a-z0-9]+)-/g), (m) => m[1]))
    expect(prefixes.size).toBe(2)
  })

  it('leaves non-mermaid code fences alone', async () => {
    const { html } = await renderMarkdown('```ts\nconst a = 1\n```\n')
    expect(html).toContain('language-ts')
    expect(html).not.toContain('<svg')
  })
})
