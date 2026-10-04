// Mermaid → SVG, dựng sẵn lúc build.
//
// CHỈ CHẠY Ở SERVER. Renderer của agentic-mermaid nặng ~575 KB gzip, còn nặng
// hơn cả mermaid client-side mà nó thay thế, nên mọi lời gọi phải nằm trong
// getStaticProps (hoặc pipeline markdown vốn chỉ chạy ở đó). Nguồn sơ đồ của
// dự án này đều biết trước lúc build — blog markdown, constants/system-design,
// và fullDescription fetch từ json-server — nên người đọc không cần tải một
// byte renderer nào.
import { renderMermaidSVG, type RenderOptions } from 'agentic-mermaid'
import { createHash } from 'crypto'
import { createLruCache } from './lru-cache'

/**
 * Màu để nguyên dạng `var(--diagram-*)` trong SVG, không chốt cứng giá trị.
 * Nhờ vậy một SVG phục vụ cả sáng lẫn tối: đổi theme chỉ đổi giá trị biến CSS,
 * không phải vẽ lại. Xem bảng biến trong styles/globals.css.
 *
 * Các tùy chọn ảnh hưởng hình học (font, padding, spacing) phải cố định ở đây —
 * layout được đo một lần lúc build, đổi font sau đó sẽ lệch khung.
 */
const DIAGRAM_OPTIONS = {
  bg: 'var(--diagram-bg)',
  fg: 'var(--diagram-fg)',
  line: 'var(--diagram-line)',
  accent: 'var(--diagram-accent)',
  muted: 'var(--diagram-muted)',
  surface: 'var(--diagram-surface)',
  border: 'var(--diagram-border)',
  font: 'Inter, system-ui, sans-serif',
  // Không tự tô nền: khung bao ngoài (figure.diagram ở bài viết, Box ở trang
  // bài học) đã có nền riêng, để SVG tô thêm một lớp nữa là thành hai hình chữ
  // nhật lệch màu chồng lên nhau.
  transparent: true,
  // Trang đã tự nạp Inter trong _document; nhúng thêm @import Google Fonts vào
  // mỗi SVG chỉ tổ phình HTML và thêm một request chặn render.
  embedFontImport: false,
  // fullDescription do admin soạn, cứ coi như nguồn không tin cậy.
  security: 'strict',
} satisfies RenderOptions

/**
 * Nhiều sơ đồ trên cùng một trang (bài Redis có 6) đều sinh `<defs>` với id
 * giống nhau — mũi tên của sơ đồ này sẽ trỏ nhầm sang defs của sơ đồ khác.
 * Băm nguồn để mỗi SVG có namespace riêng mà vẫn tất định giữa các lần build.
 */
function idPrefixFor(source: string): string {
  let hash = 5381
  for (let i = 0; i < source.length; i++) hash = ((hash << 5) + hash + source.charCodeAt(i)) | 0
  return `d${(hash >>> 0).toString(36)}`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Trả về SVG đã bọc trong `<figure class="diagram">`.
 *
 * Nguồn hỏng KHÔNG được làm sập build: fullDescription đến từ json-server nên
 * admin có thể lưu một sơ đồ sai cú pháp bất cứ lúc nào, và bài viết vẫn phải
 * dựng được. Trường hợp đó trả lại mã nguồn trong `<pre>` — đúng bằng những gì
 * mermaid client-side để lại khi nó ném lỗi, nhưng thấy ngay lúc build.
 */
export function renderDiagram(source: string): string {
  const trimmed = source.trim()
  if (!trimmed) return ''

  // Khu /me render markdown mỗi request (getServerSideProps), không phải một
  // lần lúc build như blog — cùng một sơ đồ sẽ bị dựng lại mỗi lần F5. Đầu ra
  // chỉ phụ thuộc nguồn (idPrefix cũng băm từ nguồn), nên cache theo hash nội
  // dung là an toàn. Key là sha256 thay vì chính nguồn: khỏi giữ hai bản chuỗi dài.
  const key = createHash('sha256').update(trimmed).digest('hex')
  const cached = diagramCache.get(key)
  if (cached !== undefined) return cached

  const html = renderUncached(trimmed)
  diagramCache.set(key, html)
  return html
}

/** ~200 sơ đồ: đủ cho toàn bộ note của một người, vài MB RAM là cùng. */
export const diagramCache = createLruCache<string>(200)

function renderUncached(trimmed: string): string {
  try {
    const svg = renderMermaidSVG(trimmed, {
      ...DIAGRAM_OPTIONS,
      idPrefix: idPrefixFor(trimmed),
    })
    return `<figure class="diagram">${svg}</figure>`
  } catch (error) {
    // Cache cả kết quả lỗi: nguồn không đổi thì lỗi không đổi, khỏi log lại mỗi request.
    console.warn(
      `[diagram] bỏ qua sơ đồ không dựng được: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
    return `<figure class="diagram diagram--failed"><pre>${escapeHtml(trimmed)}</pre></figure>`
  }
}
