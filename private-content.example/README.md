# private-content.example

Cấu trúc mẫu cho khu `/me`. **Nội dung ở đây là giả** — content thật nằm ngoài repo,
ở `PRIVATE_CONTENT_DIR` (mặc định `./private-content`, đã gitignore + dockerignore).

Chạy local với bộ mẫu này:

    PRIVATE_CONTENT_DIR=./private-content.example npm run dev

```
roadmap.yaml                 milestones theo lane (+ topics, checklist tuỳ chọn)
learn/<topic>/index.md       tổng quan topic (bắt buộc)
learn/<topic>/<note>.md      từng note
case-studies/<slug>.md       case study đã ẩn danh
.denylist                    từ khóa cấm (gitignore) — mẫu: denylist.example
```

Tên thư mục topic, tên file note và slug case study chỉ được chứa `a-z 0-9 - _`
(chúng thành URL). File sai schema không làm sập trang — trang hiện danh sách lỗi.

Bộ mẫu này cũng là fixture của `utils/private-content.test.ts`: sửa schema thì sửa
file ở đây trước, test sẽ báo nếu hai bên lệch.

## Denylist

`npm run check:denylist` quét `roadmap.yaml`, `learn/**/*.md`, `case-studies/*.md`
theo `.denylist` và in `file:line:từ-khóa`. Exit 0 sạch, 1 có khớp, 2 chưa có/rỗng
denylist. Thử với bộ mẫu (cố tình có một chỗ khớp):

    cp private-content.example/denylist.example private-content.example/.denylist
    PRIVATE_CONTENT_DIR=./private-content.example npm run check:denylist

## Nối roadmap với learn/practice

Mỗi milestone có thể có:

- `topics: [slug]` — topic trong `learn/`. Trang roadmap hiện điểm practice trung bình
  của topic và nút **Luyện** (`/me/practice?topic=<slug>`); trang topic hiện ngược lại
  khối *Thuộc milestone* trỏ về `/me/roadmap#<id>`. Slug không tồn tại → bỏ + báo lỗi.
- `checklist: [{ id, text }]` — ý cần nắm. Tick trên trang roadmap, lưu ở
  `roadmap-state.json` cạnh practice log (thư mục content là read-only). Tiến độ lane =
  (milestone done + tỉ lệ checklist đã tick của milestone chưa done) / tổng.

## Flashcard và `id` câu hỏi

Mỗi câu trong `questions[]` thành một thẻ flashcard ở trang topic. Nên đặt `id` cho
mọi câu hỏi **ngay khi tạo**:

```yaml
questions:
  - id: filter-then-score        # a-z 0-9 - _, bắt đầu bằng chữ cái, duy nhất trong topic
    q: Scheduler chọn node qua những bước nào?
    a: ...
```

- Có `id` → lịch ôn lưu theo `<topic>/<id>`, giữ nguyên dù thêm/xoá/sắp lại câu khác.
- Không `id` → lưu theo vị trí `<topic>/<index>`: chèn câu vào giữa hay đổi tên note
  (đổi thứ tự note) làm xáo lịch ôn của các thẻ phía sau.
- Thêm `id` cho câu **đã ôn** = thẻ đó bắt đầu lại lịch từ đầu (một lần). `id` sai dạng
  hoặc trùng trong topic bị bỏ kèm lỗi trên trang; câu hỏi vẫn giữ.
