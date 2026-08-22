import { useEffect } from 'react'

/**
 * Gắn nhãn ngôn ngữ + nút "Copy" vào mọi `<pre class="language-*">` bên trong
 * container. Gộp từ hai bản sao y hệt nhau ở pages/blog/[slug].tsx và
 * pages/works/[workId]/details.tsx.
 *
 * Vì sao phải quan sát DOM thay vì chỉ liệt kê dependency: thân bài render bằng
 * `dangerouslySetInnerHTML`, và React set lại innerHTML của nó ở những thời
 * điểm không đoán trước được — mỗi lần như vậy là quét sạch wrapper lẫn nút mà
 * không để lại tín hiệu nào cho hook bám vào.
 *
 * Đo được ngày 2026-08-22:
 *   - production build, /blog/redis-chuyen-sau: 7 nút, bấm đổi theme một lần
 *     -> còn 0, không quay lại cho tới khi F5.
 *   - dev server, tải trang với theme đã là dark (không hề đổi theme):
 *     vẫn 0 nút, tức theme KHÔNG phải tác nhân duy nhất.
 * Vì tác nhân thứ hai chưa xác định được, hook không đoán mà theo dõi thẳng
 * container: hễ danh sách con đổi thì gắn lại.
 */
export function useCodeCopyButtons(
  containerId: string,
  /**
   * Khoá nội dung. Điều hướng client-side giữa hai trang cùng route thay
   * container bằng node mới, mà observer thì đang gắn vào node cũ đã lìa khỏi
   * cây — truyền khoá này để effect chạy lại và gắn vào node hiện tại.
   */
  contentKey?: string,
) {
  useEffect(() => {
    const container = document.getElementById(containerId)
    if (!container) return

    // Idempotent: node đã bọc rồi thì bỏ qua. Nhờ vậy lần chạy do observer kích
    // hoạt không nhân đôi nút, và cũng không sinh mutation mới để tự gọi lại.
    const decorate = () => {
      const preBlocks = container.querySelectorAll<HTMLPreElement>('pre[class*="language-"]')
      preBlocks.forEach((pre) => {
        if (pre.parentElement?.dataset.codeWrapper === 'true') return

        const wrapper = document.createElement('div')
        wrapper.dataset.codeWrapper = 'true'
        wrapper.className = 'code-block-wrapper'
        pre.parentNode?.insertBefore(wrapper, pre)
        wrapper.appendChild(pre)

        const langMatch = pre.className.match(/language-(\w+)/)
        if (langMatch && langMatch[1] !== 'none') {
          const label = document.createElement('span')
          label.className = 'code-lang-label'
          label.textContent = langMatch[1]
          wrapper.appendChild(label)
        }

        const btn = document.createElement('button')
        // createElement('button') mặc định type="submit". Hiện thân bài không
        // nằm trong <form> nào nên vô hại, nhưng nút này không bao giờ có ý
        // nghĩa submit — khai rõ để sau có bọc form thì không tự gửi trang.
        btn.type = 'button'
        btn.className = 'code-copy-btn'
        btn.textContent = 'Copy'
        wrapper.appendChild(btn)

        btn.addEventListener('click', () => {
          const code = pre.querySelector('code')
          if (!code) return
          navigator.clipboard.writeText(code.innerText).then(() => {
            btn.textContent = 'Copied!'
            btn.classList.add('copied')
            setTimeout(() => {
              btn.textContent = 'Copy'
              btn.classList.remove('copied')
            }, 2000)
          })
        })
      })
    }

    decorate()

    const observer = new MutationObserver(decorate)
    observer.observe(container, { childList: true })
    return () => observer.disconnect()
  }, [containerId, contentKey])
}
