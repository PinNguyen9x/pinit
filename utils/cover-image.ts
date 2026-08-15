/**
 * Đổi ảnh bìa khổ OG sang khổ card.
 *
 * Mỗi bài/project có hai ảnh do scripts/generate-covers.mjs sinh ra:
 *   /covers/blog/<slug>.png       1200x630, nhiều chữ  -> og:image khi chia sẻ link
 *   /covers/blog/<slug>-card.png  640x416,  một chữ to -> thumbnail trong card
 *
 * Dùng ảnh OG làm thumbnail thì khung 200x130 (1.54:1) cắt hai bên ảnh 1.90:1,
 * mất chữ ở lề; mà kể cả không cắt, tiêu đề 62px co xuống còn ~10px cũng không
 * đọc được.
 *
 * Ảnh không phải do mình sinh (Cloudinary, ảnh cũ) thì trả nguyên — không có
 * bản -card nào để đổi sang.
 */
export function cardImageUrl(src?: string): string | undefined {
  if (!src) return src
  if (!src.startsWith('/covers/')) return src
  if (src.endsWith('-card.png')) return src
  return src.replace(/\.png$/, '-card.png')
}
