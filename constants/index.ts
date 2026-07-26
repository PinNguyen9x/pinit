export * from './storage-key'
export * from './query-key'
export * from './common'
export * from './game'
export * from './glossary'
// KHÔNG export './system-design' ở đây. Barrel này bị `hooks/use-auth` import,
// mà use-auth nằm trong chuỗi phụ thuộc của `_app` (qua components/common →
// header → hooks). Thêm vào đây sẽ kéo toàn bộ nội dung 13 buổi vào bundle
// dùng chung của mọi trang, kể cả trang chủ và blog.
// Các trang System Design import trực tiếp từ '@/constants/system-design'.
