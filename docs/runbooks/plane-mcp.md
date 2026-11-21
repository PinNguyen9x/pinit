# Runbook — Plane MCP: permission, dò workspace slug, đánh đổi scope user

Ba thứ cứu ra từ store của memory MCP (`~/.ai-devkit/memory.db`) trước khi gỡ server đó.
Chúng là chẩn lỗi hạ tầng, không nằm trong `CLAUDE.md`, và không có ở đâu khác.

Ghi 21/11/2026. Nguồn: 3 mục scope `repo:pinit`, ghi 25/08/2026.

---

## 1. Không deny được một `action` riêng lẻ của tool Plane

`plane-mcp-server` gói **mỗi resource thành một tool duy nhất, với `action` là tham số**,
không tách tool theo thao tác:

```
mcp__plane__workitem          action: list|retrieve|search|count|create|update|delete|archive|manage_assignee|manage_label
mcp__plane__workitem_comment  action: list|retrieve|create|update|delete
```

Permission rule của Claude Code match theo **tên tool**, không match argument — chỉ
`Bash(cmd:*)` mới match được prefix. Hệ quả:

- "Cho `create`/`update`, cấm `delete`" trên cùng một tool là **không biểu diễn được** trong
  `.claude/settings.json`.
- Allow `mcp__plane__workitem` = allow luôn `action: "delete"`.

### Cách pinit xử lý, ba lớp

1. Deny **nguyên tool** những resource không bao giờ cần ghi: `mcp__plane__project`,
   `mcp__plane__module`, `mcp__plane__cycle`. Lớp này cưỡng chế được thật.
2. Cấm `delete` work item bằng **rule trong `CLAUDE.md`** — guardrail mềm, KHÔNG cưỡng chế.
3. Vì `module` bị deny nên **hardcode UUID** project/module/state vào `CLAUDE.md`, để agent
   không cần gọi tool đó.

### Kiểm danh sách action thật, đừng đoán

```bash
~/.cache/uv/archive-v0/*/lib/python3.10/site-packages/plane_mcp/tools/*.py
```

Xem block `ACTIONS = (...)` và `Literal[...]`.

### Hệ quả vận hành, đo 21/11/2026

Deny `mcp__plane__module` nghĩa là agent **không gán work item vào module được** — và
`mcp__plane__workitem` action `update` cũng **không nhận `module_ids`**. Tham số nó nhận:

```
assignees, description_html, description_stripped, estimate_point, external_id,
external_source, is_draft, labels, name, parent, point, priority, project_id,
sort_order, start_date, state, target_date, type_id, workitem_id
```

Nên gán module là việc tay trên UI — vì không có đường nào khác, không phải vì quy ước.

---

## 2. Dò workspace slug bằng mã HTTP

**Plane API không có endpoint list workspaces.** Cả `/api/v1/workspaces/` và
`/api/v1/users/me/workspaces/` đều trả 404. Nên khi quên slug thì phải dò:

```bash
curl -s -o /dev/null -w "%{http_code}" -H "X-API-Key: $PLANE_API_KEY" \
  "https://api.plane.so/api/v1/workspaces/<slug>/projects/"
```

| Mã | Nghĩa |
|---|---|
| **200** | đúng slug |
| **403** | slug tồn tại nhưng không phải của mình |
| **404** | không tồn tại |

`/api/v1/users/me/` trả 200 dùng để verify token còn sống — tách được "token chết" khỏi
"slug sai".

**Ghi chú:** `plane-mcp-server` không có `--help`; arg là positional `stdio|sse|http`, truyền
sai thì crash `ValueError: '--help' is not a valid ServerMode`. `PLANE_BASE_URL` default sẵn
`https://api.plane.so` trong `plane_mcp/client.py`.

**Smoke test MCP không cần restart Claude Code:** spawn server bằng subprocess rồi bắn
JSON-RPC vào stdin theo thứ tự `initialize` → `notifications/initialized` → `tools/call`.

---

## 3. Đánh đổi của scope user — chỗ guardrail biến mất

Config MCP có secret riêng của máy thì đặt ở **scope user**, không sửa `.mcp.json` của repo
(file đó đang skip-worktree; sửa vào thì `git status` sạch trơn và thay đổi không lan sang
worktree khác).

**Nhưng phải nhớ đánh đổi:** scope user = tool xuất hiện ở **mọi** project trên máy, trong khi
`deny` trong `.claude/settings.json` lại là **cấp project**. Nghĩa là guardrail chỉ có ở pinit;
mở Claude Code ở repo khác thì tool Plane vẫn đó mà không còn deny nào.

Muốn phạm vi deny khớp phạm vi tool thì đặt luôn ở `~/.claude/settings.json`:

```json
{ "permissions": { "deny": ["mcp__plane__project", "mcp__plane__module", "mcp__plane__cycle"] } }
```

**Health check đừng tin một mình:** `claude mcp list` phải chạy từ shell đã source `~/.zshrc`,
không thì báo `PLANE_API_KEY is not set` gây hiểu nhầm là config sai. Và nó vẫn báo
✔ Connected khi biến chưa expand — xem bảng chẩn 4 triệu chứng trong `CLAUDE.md`.

---

## Phụ lục — vì sao runbook nằm trong repo chứ không ở Plane Wiki

Bản đầu của runbook này được tạo trên Plane Wiki (page
`178d0cdc-6569-4973-8546-1c53ed0e8346`, workspace `pin`), theo đúng luật ba lớp lúc đó.

**Nhưng workspace đang ở gói Free, và Wiki bị khoá sau paywall.** Đo 21/11/2026:

| | Agent qua MCP | Chủ repo qua trình duyệt |
|---|---|---|
| Đọc/ghi page Wiki | hoạt động bình thường | **chặn, hiện "Upgrade to unlock wiki"** |

Nội dung không mất — `page` action `retrieve` vẫn trả đủ, và hai runbook cũ
(`be9ed9c9-967b-4db2-bc9d-4b62b2c1dacc`, `3cf1c6d3-6cc6-4bf0-848e-6952a2214b5f`) cũng vậy.
Nhưng một runbook mà **chủ repo không mở được** thì không làm được việc của runbook: luật ba
lớp nói nó tồn tại để "agent khác **hoặc tôi** tra lại sau nhiều tháng", và vế thứ hai không
chạy.

Chuyển vào repo được bốn thứ Wiki không có:

- chủ repo đọc được, không cần nâng gói;
- review được qua diff trong PR, như mọi thay đổi khác;
- không phụ thuộc gói Plane đang dùng;
- `grep` được cùng lúc với code.

Hai runbook cũ cũng đã xuất cùng ngày: `mcp-plane-403-tmux-env.md` và
`vong-doi-task-agents.md`. Page gốc trên Plane vẫn còn, không xoá — nhưng từ nay chỉ đọc,
runbook mới viết thẳng vào thư mục này.

Lúc xuất mới lộ ra một khiếm khuyết có sẵn: **khối code trong hai page đó mất xuống dòng**
(14/14 khối ở page thứ nhất, 4/11 ở page thứ hai). Mất từ lúc ghi vào Plane chứ không phải do
bước xuất — kiểm cả ba tầng biểu diễn, kể cả tài liệu Yjs trong `description_binary`, không
tầng nào còn newline trong `codeBlock`. Nằm trên Wiki thì khiếm khuyết đó không ai thấy và
không ai sửa được; nằm trong repo thì sửa được bằng một commit.
