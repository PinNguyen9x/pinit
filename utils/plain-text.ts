/**
 * Bóc thẻ HTML khỏi chuỗi mô tả, trả về chữ thuần.
 *
 * `shortDescription` của một số project còn dính HTML do editor cũ sinh ra, ví dụ
 * `The <span style="font-weight: 700; font-style: italic;">AI-Chatbot</span> ...`.
 * Trang chi tiết in thẳng chuỗi đó nên thẻ hiện ra như chữ; card thì dùng
 * dangerouslySetInnerHTML rồi phải thêm CSS `& span { font-style: normal
 * !important }` để vô hiệu hoá đúng cái style vừa render — tức định dạng này vốn
 * không ai muốn giữ.
 *
 * Bóc ở tầng hiển thị thay vì sửa dữ liệu: 7/12 project đang dính, và người dùng
 * vẫn có thể dán HTML qua form thêm/sửa work bất cứ lúc nào.
 *
 * Bỏ luôn dangerouslySetInnerHTML ở các card — mô tả là dữ liệu người dùng nhập,
 * không nên đưa thẳng vào DOM.
 */
const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
}

export function plainText(input?: string): string {
  if (!input) return ''
  return input
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ')
    .trim()
}
