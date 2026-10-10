---
slug: vi-du-bai-viet
title: Ví dụ một bài viết private
author: Pin Nguyen
tags: [Ví dụ, Markdown]
date: '2026-01-01T00:00:00Z'
visibility: private
---

Đoạn này là excerpt — phần trước `<!-- truncate -->`. Trang danh sách chỉ hiện phần
này, trang chi tiết hiện cả bài.

<!-- truncate -->

## Frontmatter

Cố ý **tương thích blog public** (`slug`, `title`, `author`, `tags`, `date`, `image`),
thêm `visibility`. Bài nào muốn công khai về sau chỉ cần `git mv` sang `blog/` của repo
`pinit`, bỏ `visibility`, và thêm `image` (blog public cần cover).

Hai khác biệt so với blog public:

| | Blog public | Bài private |
|---|---|---|
| `image` (cover) | bắt buộc | tuỳ chọn |
| `visibility` | không có | `private` (mặc định) hoặc `public-candidate` |
| `slug` | lấy từ frontmatter | lấy từ **tên file** |

`slug` lấy từ tên file vì tên file là thứ quyết định URL — để frontmatter khai khác đi
là có hai nguồn sự thật.

## Markdown dùng được gì

Cùng pipeline với blog public, nên có GFM, mục lục, prism, và mermaid render thành SVG
ngay ở server:

```mermaid
flowchart LR
  A["posts/*.md trên VPS"] --> B["listPosts / loadPost"]
  B --> C["renderMarkdown"]
  C --> D["/me/posts/[slug]"]
```

```bash
# Chạy local với content ví dụ
PRIVATE_CONTENT_DIR=./private-content.example npm run dev
```
