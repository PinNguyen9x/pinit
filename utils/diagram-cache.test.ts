import { renderMermaidSVG } from 'agentic-mermaid'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { diagramCache, renderDiagram } from './diagram'

// vi.mock được hoist lên trước các import ở trên. Bọc renderer thật bằng spy
// để đếm số lần dựng — kết quả vẫn là SVG thật.
vi.mock('agentic-mermaid', async (importOriginal) => {
  const mod = await importOriginal<typeof import('agentic-mermaid')>()
  return { ...mod, renderMermaidSVG: vi.fn(mod.renderMermaidSVG) }
})

const spy = vi.mocked(renderMermaidSVG)

const A = 'flowchart LR\n  A --> B'
const B = 'flowchart LR\n  C --> D'

beforeEach(() => {
  diagramCache.clear()
  spy.mockClear()
})

describe('cache render mermaid', () => {
  it('miss lần đầu, hit lần sau — kết quả y hệt', () => {
    const first = renderDiagram(A)
    const second = renderDiagram(A)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(second).toBe(first)
  })

  it('khoảng trắng đầu/cuối không tạo key mới', () => {
    renderDiagram(A)
    renderDiagram(`\n  ${A}  \n`)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('nội dung khác → miss', () => {
    expect(renderDiagram(A)).not.toBe(renderDiagram(B))
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('sơ đồ lỗi cũng được cache — không dựng lại, không log lại', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderDiagram('flowchart LR\n  A --> ')
    renderDiagram('flowchart LR\n  A --> ')
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })

  it('giới hạn 200 entry', () => {
    for (let i = 0; i < 205; i++) renderDiagram(`flowchart LR\n  N${i} --> M`)
    expect(diagramCache.size).toBe(200)
    spy.mockClear()
    renderDiagram('flowchart LR\n  N0 --> M') // đã bị đuổi → miss
    renderDiagram('flowchart LR\n  N204 --> M') // còn trong cache → hit
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
