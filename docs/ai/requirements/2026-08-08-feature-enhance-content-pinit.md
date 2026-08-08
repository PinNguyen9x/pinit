---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

Feature: `enhance-content-pinit` · Branch: `feat/enhance-content-pinit`

## Problem Statement

pinit là portfolio tổng hợp công việc + kiến thức, nhắm vào nhà tuyển dụng và
người đọc kỹ thuật. Hiện trang chủ và trang work detail chưa phản ánh đúng
năng lực thật, vì ba tầng vấn đề độc lập nhau:

**1. Bug routing khiến trang detail tốt nhất gần như không ai xem được**

`getWorkHref` (lặp nguyên văn ở 3 nơi: `components/work/work-grid-card.tsx:10`,
`work-mini-card.tsx:9`, `work-hero.tsx:12`) trỏ work `published` + có `slug`
sang `/works/{id}/{slug}`. Route đó (`pages/works/[workId]/[slug]/index.tsx:19`)
chỉ render component game, bỏ qua toàn bộ nội dung work.

Trớ trêu: đúng 2 work `published` lại là 2 game (Game Color Matching,
Game tic tac toe). Nên `pages/works/[workId]/details.tsx` — 1346 dòng, đã có
TOC scroll-spy, markdown + mermaid, architecture flow, tech stack grid — chỉ mở
được cho work `draft`, tức thứ đáng lẽ chưa nên khoe.

**2. Trọng tâm đang đặt nhầm chỗ**

| Tài sản | Quy mô | Đánh giá |
|---|---|---|
| Blog AI/Claude Code | 13 bài, ~322k ký tự | Mạnh nhất, mới (2026), khác biệt |
| Blog DevOps CI/CD→GitOps | 5 bài | Có hạ tầng thật đối chứng |
| Kafka + Redis | 4 bài, ~72k ký tự | Chuyên sâu |
| System design | 13 bài | Đầy đủ |
| Glossary | 109 thuật ngữ | Đầy đủ |
| 11 works | `fullDescription` 189–599 ký tự | Phần lớn là bài tập |

Trang chủ dành chỗ trang trọng cho 3 work yếu nhất; ~322k ký tự nội dung mạnh
nằm sau một nút "Blog". Project mạnh nhất — chính `pinit` (Next.js + Jenkins +
Docker + Vultr VPS + k3d/ArgoCD + 30 bài + workflow multi-agent qua git worktree)
— **không có trong danh sách works**.

**3. Nội dung mỏng và có chỗ sai**

- `fullDescription` 189–599 ký tự cho cả 11 work; không có vai trò, thời gian,
  vấn đề→giải pháp, kết quả đo được.
- `frontEndTagList` / `backEndTagList` / `dbTagList` / `linkSource` không hiển
  thị ở bất kỳ card nào.
- `pages/works/[workId]/index.tsx:44` đang render lorem ipsum ra production.
- `pages/about.tsx:80-98`: 3 certificate là placeholder bịa (AWS SA, Scrum
  Master I, Meta Front-End), cả ba `credentialUrl: '#'`.
- 4 mục kinh nghiệm chỉ có company/position/duration/products, không có thành tựu.

**Ai chịu ảnh hưởng:** nhà tuyển dụng (rời trang trước khi thấy chiều sâu);
người đọc kỹ thuật (không tìm được nội dung hay); chủ site (công sức viết
322k ký tự không sinh giá trị).

## Goals & Objectives

### Primary goals

1. **Sửa routing** để trang case study luôn đến trước; game thành hành động phụ.
2. **Đảo trọng tâm trang chủ** sang knowledge tracks — đưa kho blog lên tuyến đầu.
3. **Ba case study chất lượng** thay cho 11 mô tả mỏng.
4. **Nối công việc ↔ kiến thức**: work detail dẫn sang bài blog liên quan.

### Secondary goals

5. Hero có số liệu thật, social link, CTA liên hệ.
6. About: thành tựu cho từng job; xử lý dứt điểm khối certificate.
7. Dọn lorem ipsum lộ ra production.

### Non-goals

- Không đổi schema `Work` trong `models/work.ts` và repo API `json-server-blog`.
- Không đụng blog, glossary, system-design (đã đủ dày).
- Không redesign hệ thống thiết kế, không đổi theme/palette.
- Không làm i18n, không thêm CMS.
- Không viết bài blog mới.

## User Stories & Use Cases

- **Là nhà tuyển dụng**, tôi muốn trong 30 giây đầu thấy được chiều sâu kỹ thuật
  và phạm vi kiến thức, để quyết định có đọc tiếp không.
- **Là nhà tuyển dụng**, khi click một project tôi muốn thấy case study
  (bối cảnh → vấn đề → giải pháp → kết quả), không phải một game.
- **Là người đọc kỹ thuật**, tôi muốn tìm nhanh cụm bài theo chủ đề
  (AI/Claude Code, DevOps, Kafka/Redis, Frontend) thay vì lướt 30 bài rời rạc.
- **Là người đọc**, sau khi xem một project tôi muốn đọc tiếp bài viết liên quan
  để hiểu sâu hơn.
- **Là chủ site**, tôi muốn thêm/sửa nội dung case study mà không phải deploy
  lại frontend.

### Edge cases

- API `json-server-blog` offline → trang vẫn build được (`safeFetchJson` đã xử lý).
- Work không có `linkDemo`/`linkSource` → không hiện nút rỗng.
- Work không có bài blog cùng tag → ẩn hẳn section "Đọc thêm".
- Track không có bài nào → không render card rỗng.
- Work `published` nhưng thiếu `slug` → vẫn phải vào được detail.

## Success Criteria

1. Mọi work — kể cả `published` — mở ra `/works/{id}/details`; không route nào
   dẫn thẳng vào game khi người dùng click card.
2. Hai game vẫn chơi được qua nút "Play demo" trong trang detail.
3. Trang chủ hiển thị 4 knowledge track, mỗi track có số bài đếm tự động từ
   frontmatter (không hardcode).
4. Hero hiển thị 4 số liệu tính từ dữ liệu thật: 30 bài blog · 13 bài system
   design · 109 thuật ngữ · 8 năm kinh nghiệm (2017–2024).
5. `pinit`, `Json-Server`, `Twitter-Node-Server` có `fullDescription` dạng case
   study đủ 4 phần: Bối cảnh · Vấn đề · Giải pháp · Kết quả.
6. Work detail có section "Đọc thêm" dẫn tới bài blog cùng tag.
7. Không còn lorem ipsum trong bất kỳ page nào.
8. Khối certificate: hoặc có `credentialUrl` thật, hoặc bị gỡ. Không còn `'#'`.
9. `npm run lint` pass; `npm run build` pass kể cả khi API offline.

## Constraints & Assumptions

### Technical constraints

- Next.js **pages router** (không phải app router), MUI, TypeScript.
- Dữ liệu work nằm ở repo riêng `json-server-blog`; sửa nội dung qua form
  `/works/{id}` (có `requireLogin`) hoặc sửa trực tiếp repo đó.
- `fullDescription` đã được render markdown + mermaid server-side
  (`utils/markdown.ts`, dùng ở `details.tsx:680`) → viết case study không cần code mới.
- Blog đọc từ thư mục `blog/*.md` qua `utils/posts.ts`, frontmatter có sẵn
  `tags` → derive track không cần dữ liệu mới.
- Trang chủ dùng SSG + ISR (`revalidate: 60`).

### Assumptions

- Ba work chủ lực chọn theo chiều sâu kỹ thuật, không theo độ mới:
  `pinit` (đủ chuỗi dev→deploy→ops), `Json-Server` (API production, có api-docs,
  là backend của chính site này), `Twitter-Node-Server` (nhiều tầng nhất:
  FE 3 / BE 5 / DB 2, có Docker + GitHub Action).
- 8 work còn lại không xoá, gom thành danh sách ngắn "Other experiments".
- Giai đoạn 2024→2026 kể thành giai đoạn tự học có sản phẩm (blog 2026 chứng minh),
  không để trống như một khoảng hở.
- Bốn track chốt theo tag hiện có: AI & Claude Code (13) · DevOps CI/CD→GitOps (5)
  · Distributed: Kafka & Redis (4) · Frontend craft (6).

## Questions & Open Items

**Đã quyết trong phiên requirements:**

- Nguồn nội dung: markdown vào `fullDescription`, không đổi API schema. ✅
- Độ sâu: 3 case study thay vì rải đều 11. ✅
- Trọng tâm: đảo sang knowledge tracks, đủ 5 khối. ✅
- Phạm vi: gồm cả hero, about, dọn lorem. ✅
- Routing: detail là chính, game thành nút "Play demo". ✅ **(đã làm)**
- **Certificate: không có chứng chỉ thật → gỡ cả khối** khỏi `pages/about.tsx:74-99`.
  Không giữ placeholder. ✅
- **Social công khai: chỉ GitHub + LinkedIn.** URL đã có sẵn trong
  `components/common/footer.tsx:22-25`, dùng lại, không khai trùng. ✅
- **Bỏ khỏi phạm vi: thành tựu cho 4 job.** Mục kinh nghiệm ở About giữ nguyên
  company/position/duration/products. ✅

**Nguyên tắc về số liệu (áp cho phần "Kết quả" của 3 case study):**

Chỉ dùng số **đo được hoặc đếm được từ nguồn kiểm chứng được** — output của
`next build`, `api-schema.yaml`, số file trong `blog/`, cấu hình
Jenkinsfile/Dockerfile. Không suy đoán, không ước lượng, không viết số cho đẹp.

Chỗ nào không có số thật thì viết định tính (mô tả kiến trúc, đánh đổi, sự cố đã
xử lý) — vẫn có sức nặng kỹ thuật. Lý do: trang này nhắm nhà tuyển dụng; một con
số bịa bị hỏi tới mà trả lời không được thì thiệt hại lớn hơn nhiều so với việc
không có số. Cùng lý do đã gỡ khối certificate.

- **Số điện thoại: gỡ. Email: giữ.** ✅ Số điện thoại lộ ở **hai** chỗ, không
  phải một: dòng Phone trong `pages/about.tsx`, và component `FloatingPhone`
  render trong `MainLayout` — tức nút gọi nổi kèm số hiện trên **mọi trang**.
  Đã gỡ cả hai; `components/common/floating-phone.tsx` giữ lại nhưng không còn
  được render.

**Còn treo:** (không có)

**Hoãn sang phiên sau:**

- Gộp 3 bản `getWorkHref` trùng lặp vào `utils/` (dọn dẹp, không thuộc phạm vi nội dung).
- Trang landing riêng cho từng track (phiên này track chỉ cần lọc sang `/blog?tag=`).
- `components/common/header/routes.ts` chỉ khai 3 route, còn Glossary/System Design
  thêm rời ở `header/index.tsx:27-28` → nav lấy từ 2 nguồn, nên hợp nhất.
