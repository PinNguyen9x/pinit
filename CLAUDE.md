# pinit — quy ước cho AI agent

## Dự án
- Frontend: Next.js + TypeScript (thư mục này)
- API: `json-server-blog` (repo riêng)
- Branch tích hợp: `main`. Mỗi agent làm trên một worktree tách từ `main`.

## Quy ước commit
Conventional Commits: `<type>(<scope>): <mô tả>`

- type: feat | fix | refactor | docs | test | chore | style
- scope: module liên quan (glossary, blog, deploy, theme...)
- mô tả: thể mệnh lệnh, không dấu chấm cuối, ≤ 72 ký tự

Ví dụ:
- `feat(glossary): thêm deep-link cho từng thuật ngữ`
- `fix(blog): sửa lỗi scp không copy thư mục con`

## Bắt buộc
- Mỗi commit một thay đổi logic — không gộp nhiều việc
- Chạy `npm run lint` trước khi commit
- Không thêm co-author hay footer quảng cáo tool vào commit message

## Tuyệt đối không
- Không `git push` — để tôi tự push
- Không `--force`, không `git reset --hard`, không sửa lịch sử commit
- Không sửa file trong `.next/`, `node_modules/`

## Git workflow
- Đồng bộ với main: dùng `git rebase origin/main`, KHÔNG `git merge main`
- Nếu rebase có conflict: dừng lại, báo tôi, không tự resolve
- Không rebase branch đã push lên remote
- Merge feature về `main`: dùng `git merge --no-ff` (việc này do tôi hoặc agent integrator làm)

## Bàn giao khi kết thúc phiên
Khi tôi nói "handoff", ghi file `HANDOFF.md` trong worktree gồm:
- Đang làm gì, đã xong đến đâu
- File nào đã sửa, còn dở chỗ nào
- Bước tiếp theo
Không commit file này.
