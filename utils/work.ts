import { SlUG } from '@/constants/common'
import { Work } from '@/models'

// Import thẳng '@/constants/common' thay vì barrel '@/constants': barrel nằm
// trong chuỗi phụ thuộc của `_app`, xem constants/barrel-bundle.test.ts.

const GAME_SLUGS: string[] = [SlUG.GAME_TIC_TAC_TOE, SlUG.GAME_COLOR_MATCHING]

/**
 * Link của một work LUÔN trỏ về trang case study.
 *
 * Trước đây hàm này bị chép ở 3 component và trỏ work `published` có `slug`
 * sang `/works/{id}/{slug}` — route đó chỉ render game, nuốt mất trang chi
 * tiết. Vì đúng 2 work `published` lại là 2 game nên người xem click card là
 * rơi thẳng vào game, không bao giờ thấy case study.
 */
export function getWorkHref(work: Work) {
  return `/works/${work.id}/details`
}

/**
 * Slug game của work, nếu work đó thực sự có game chơi được.
 * Dùng để hiện nút "Play demo" trong trang chi tiết — game là hành động phụ,
 * không phải thứ thay thế bài viết.
 */
export function getWorkGameSlug(work: Work): string | null {
  return work.slug && GAME_SLUGS.includes(work.slug) ? work.slug : null
}
