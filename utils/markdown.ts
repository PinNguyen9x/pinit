// Shared markdown → HTML pipeline used by both the blog and the work case
// studies. Runs only on the server (inside getStaticProps), so the heavy
// remark/rehype/prism deps never reach the client bundle.
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeFormat from 'rehype-format'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkToc from 'remark-toc'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

export interface TocHeading {
  level: number
  id: string
  text: string
}

export interface RenderedMarkdown {
  html: string
  toc: TocHeading[]
}

// remark-prism emits text nodes with pre-escaped HTML entities (e.g. "&gt;").
// Rehype later escapes the `&`, producing "&amp;gt;" in the output, which the
// browser renders as literal "&gt;". Decode the entities so stringify re-escapes cleanly.
function rehypeDecodePrismEntities() {
  const decode = (s: string) =>
    s.replace(/&(amp|lt|gt|quot|#39|apos|#x27);/g, (_, e) => {
      const map: Record<string, string> = {
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        '#39': "'",
        apos: "'",
        '#x27': "'",
      }
      return map[e] ?? _
    })
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName !== 'code' && node.tagName !== 'pre') return
      visit(node, 'text', (t: any) => {
        if (typeof t.value === 'string') t.value = decode(t.value)
      })
    })
  }
}

// Convert ```mermaid fenced blocks into <div class="mermaid"> so the client-side
// mermaid.run() can render them (e.g. flowcharts, gitGraph). Must run BEFORE
// remark-prism so Prism doesn't tokenize/escape the diagram source.
function remarkMermaid() {
  const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  return (tree: any) => {
    visit(tree, 'code', (node: any, index: any, parent: any) => {
      if (node.lang !== 'mermaid' || !parent || index == null) return
      parent.children[index] = {
        type: 'html',
        value: `<div class="mermaid">${escapeHtml(node.value)}</div>`,
      }
    })
  }
}

// Collect the h2–h4 headings straight from the syntax tree, into the array we
// hand back to the page. Reading the tree gives us the *decoded* heading text;
// scraping the stringified HTML instead would hand the sidebar whatever rehype
// escaped on the way out, so "Checklist & kết luận" reached the reader as
// "Checklist &#x26; kết luận".
function rehypeCollectToc(toc: TocHeading[]) {
  const textOf = (node: any): string => {
    if (node.type === 'text') return typeof node.value === 'string' ? node.value : ''
    if (Array.isArray(node.children)) return node.children.map(textOf).join('')
    return ''
  }
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      const level = /^h([2-4])$/.exec(node.tagName)?.[1]
      const id = node.properties?.id
      if (!level || !id) return
      const text = textOf(node).replace(/\s+/g, ' ').trim()
      if (text) toc.push({ level: Number(level), id: String(id), text })
    })
  }
}

/**
 * Render markdown (or admin-authored HTML, which round-trips via rehype-raw) to
 * sanitized-by-trust HTML plus a heading-based table of contents. Content is
 * authored only by the authenticated admin, so raw HTML is trusted — matching
 * the blog's existing behaviour.
 */
export async function renderMarkdown(markdown: string): Promise<RenderedMarkdown> {
  const toc: TocHeading[] = []

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkToc, { heading: 'agenda.*' })
    .use(remarkMermaid)
    .use(require('remark-prism'))
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeDecodePrismEntities)
    .use(rehypeSlug)
    .use(rehypeCollectToc, toc)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(markdown || '')

  return { html: file.toString(), toc }
}
