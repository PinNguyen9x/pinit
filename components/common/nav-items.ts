// Danh sách link điều hướng chính — nguồn duy nhất cho header (desktop + drawer)
// và footer. Hardcode ở hai nơi thì sớm muộn lệch nhau (đã xảy ra với social
// link giữa hero cũ và footer). Không có "Trang chủ": tên ở góc trái header
// đã là link về trang chủ; drawer mobile tự thêm mục đó.
export const NAV_ITEMS = [
  { label: 'Bài viết', path: '/blog' },
  { label: 'Thuật ngữ', path: '/glossary' },
  { label: 'System design', path: '/system-design' },
  { label: 'Dự án', path: '/works' },
  { label: 'Giới thiệu', path: '/about' },
] as const
