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

/**
 * Render markdown (or admin-authored HTML, which round-trips via rehype-raw) to
 * sanitized-by-trust HTML plus a heading-based table of contents. Content is
 * authored only by the authenticated admin, so raw HTML is trusted — matching
 * the blog's existing behaviour.
 */
export async function renderMarkdown(markdown: string): Promise<RenderedMarkdown> {
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
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(markdown || '')

  const html = file.toString()

  // Extract TOC from generated HTML (headings h2–h4 with slug IDs)
  const toc: TocHeading[] = []
  const tocPattern = /<h([2-4])\s[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h[2-4]>/g
  let match
  while ((match = tocPattern.exec(html)) !== null) {
    toc.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, '').trim(),
    })
  }

  return { html, toc }
}
