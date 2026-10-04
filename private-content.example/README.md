# private-content.example

Cấu trúc mẫu cho khu `/me`. **Nội dung ở đây là giả** — content thật nằm ngoài repo,
ở `PRIVATE_CONTENT_DIR` (mặc định `./private-content`, đã gitignore + dockerignore).

Chạy local với bộ mẫu này:

    PRIVATE_CONTENT_DIR=./private-content.example npm run dev

```
roadmap.yaml                 milestones theo lane
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
