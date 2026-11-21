# Baseline quy trình làm việc với agent

Đo ngày **21/11/2026**, trên `chore/agent-workflow-g0` tách từ `origin/main` tại
`03b579d` (PR #81). Mục đích: biết điểm xuất phát trước khi dọn, để sau này so được.

Mọi số dưới đây đi kèm lệnh đã dùng — chạy lại được, không phải con số kể lại.

---

## 1. ESLint

```
npx eslint --print-config pages/index.tsx
```

| | Số rule |
|---|---|
| Có trong config hiệu dụng | 52 |
| **Đang bật** (error + warn) | **47** |
| &nbsp;&nbsp;— mức `error` | 26 |
| &nbsp;&nbsp;— mức `warn` | 21 |
| Tắt tường minh (`off`) | 5 |

Toàn bộ `.eslintrc.json` của repo:

```json
{ "extends": "next/core-web-vitals" }
```

**Điều quan trọng không nằm ở con số 47: cả 47 rule đều đến từ `next/core-web-vitals`,
không có một rule nào do repo tự khai.** Hệ quả:

- Không có rule nào hiểu TypeScript (`@typescript-eslint` không có trong config hiệu dụng)
  — nên luật kiểu "không `any`", "không floating promise" hiện không ai chặn.
- Không có rule nào về ranh giới import (`no-restricted-imports` không bật) — nên code
  client import module server-only của `/me` thì lint vẫn xanh. Đây đúng là chỗ G3-2 vá.
- Không có rule nào về nội dung comment — G3-7 cũng đang từ con số 0.

21 rule ở mức `warn` nghĩa là **vi phạm không làm `npm run lint` fail**. Đáng chú ý trong
nhóm này: `react-hooks/exhaustive-deps`, `jsx-a11y/alt-text`, `@next/next/no-img-element`.

5 rule bị tắt: `react/jsx-no-target-blank`, `react/no-unknown-property`, `react/no-unsafe`,
`react/prop-types`, `react/react-in-jsx-scope` — đều do preset Next tắt, không phải repo tắt.
### Trạng thái lint hiện tại

`npm run lint` → **exit 0**, 0 error, **1 warning**: `react-hooks/exhaustive-deps` ở
`pages/works/infinity-scroll.tsx:106`. Đây là mốc để biết rule mới thêm ở giai đoạn 3 có
đang bắt vi phạm cũ hay không.

### tsconfig

`strict: true` đã bật. Các cờ strict *con* chưa bật: `noUncheckedIndexedAccess`,
`noImplicitOverride`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`.
`skipLibCheck: true`. (Chi tiết đối chiếu CI thuộc G3-1.)

---

## 2. Comment trong code

```
# số file nguồn
git ls-files '*.ts' '*.tsx' '*.mjs' | grep -v '^\.agents/' | wc -l

# tổng số dòng
git ls-files '*.ts' '*.tsx' '*.mjs' | grep -v '^\.agents/' | xargs wc -l | tail -1

# số dòng comment
git ls-files '*.ts' '*.tsx' '*.mjs' | grep -v '^\.agents/' \
  | xargs grep -cE '^[[:space:]]*(//|/\*|\*|\{/\*)' | awk -F: '{s+=$2} END {print s}'
```

| | Số |
|---|---|
| File nguồn (`.ts`, `.tsx`, `.mjs`; trừ `.agents/`) | 256 |
| Tổng dòng | 27.416 |
| **Dòng comment** | **1.460** (5,3%) |

Cách đếm chỉ bắt comment **đứng đầu dòng** (`//`, `/*`, `*`, `{/*`). Comment đuôi dòng
(`const x = 1; // ghi chú`) không được tính — nên 1.460 là **sàn**, không phải số chính xác.
Giữ đúng lệnh này cho các lần đo sau thì con số vẫn so sánh được với nhau.

File nhiều comment nhất: `scripts/generate-covers.mjs` (64), `utils/private-content.ts` (50),
`utils/diagram.ts` (41), `utils/cf-access.ts` (40), `utils/private-content-schema.ts` (38).

### Comment biện minh (đầu vào cho G3-7)

```
git ls-files '*.ts' '*.tsx' '*.mjs' | grep -v '^\.agents/' \
  | xargs grep -inE '(//|/\*|\*).*(TODO|FIXME|HACK|XXX|workaround|tạm thời)' | wc -l
```

**0 vi phạm.** G3-7 vì vậy là rule *phòng ngừa*, không phải rule *dọn nợ* — không có vi phạm
cũ nào phải xử lý kèm, khác với giả định "rule mới đi kèm dọn hết vi phạm cũ" trong doc đầu việc.

---

## 3. Skill

```
for d in .claude/skills/*; do
  if [ -L "$d" ]; then echo "$(basename $d) -> $(readlink $d)"; else echo "$(basename $d) [dir]"; fi
done
ls .agents/skills/
find -L .claude/skills -type l   # symlink gãy
```

`.claude/skills/` — **19 mục**: 17 symlink tuyệt đối tới `~/.ai-devkit/skills/codeaholicguy/ai-devkit/skills/`,
1 symlink tương đối (`archify -> ../../.agents/skills/archify`), 1 thư mục thật
(`agentic-mermaid-diagram-workflow`).

`.agents/skills/` — **1 mục**: `archify`.

`find -L .claude/skills -type l` → **rỗng**, không có symlink gãy.

Git chỉ theo dõi 4 đường dẫn trong `.claude/` + `.agents/`:
`.claude/agents/glossary-reviewer.md`, `.claude/settings.json`,
`.claude/skills/agentic-mermaid-diagram-workflow/SKILL.md`, `.claude/skills/archify` (mode `120000`).
17 symlink ai-devkit **không được commit** — đúng như `CLAUDE.md` giải thích (path neo vào `$HOME`).

### Hai chỗ lệch tìm thấy khi đếm

1. **`.ai-devkit.json` khai 19 skill, thực tế chỉ dựng được 17.** Hai skill
   `structured-debug` và `simplify-implementation` có trong lockfile ở `HEAD` nhưng không có
   symlink nào — registry upstream đã bỏ chúng. Lần `npx ai-devkit install` gần nhất đã tự gỡ
   hai dòng đó khỏi `.ai-devkit.json`; thay đổi này đang nằm **uncommitted** trong worktree,
   cùng với reformat JSON. Đây là sản phẩm phụ của lệnh cài, không thuộc đầu việc nào.
2. **`CLAUDE.md` viết "19 skill dev-*/task/tdd/..."** — con số đúng của hiện tại là **17**.

### Chi phí ngữ cảnh của skill

Tổng `SKILL.md` của 19 skill: **1.333 dòng**. Riêng nhóm ai-devkit (17 skill): **1.156 dòng**.
Đây là phần sẽ giảm được nếu G0-2/G0-3 gỡ bớt.

```
for d in .claude/skills/*/; do f="$d/SKILL.md"; [ -f "$f" ] && wc -l < "$f"; done | paste -sd+ - | bc
```

### File hướng dẫn thường trú

| File | Dòng | Byte |
|---|---|---|
| `CLAUDE.md` | 297 | 20.036 |
| `README.md` | 205 | 6.889 |
| `AGENTS.md` | 21 | 1.243 |
| `.claude/settings.json` | 47 | 1.119 |

---

## 3b. Kiểm kê skill — đề xuất giữ/gỡ (G0-2)

### Căn cứ xếp hạng, không phải cảm tính

Mỗi đề xuất "gỡ" dưới đây dựa trên một trong ba bằng chứng đo được:

1. **Có thứ khác trong repo đã làm việc đó rồi** — `CLAUDE.md` quy định cách làm riêng, hoặc
   `scripts/pinit-agents.sh` đã bọc thành lệnh. Hai bộ luật song song thì agent chọn bừa.
2. **Sản phẩm của skill đã nguội** — `docs/ai/` không ai sửa từ **08/08/2026** (3,5 tháng),
   `~/.ai-devkit/tasks` **không tồn tại** (0 task), `~/.ai-devkit/memory.db` ghi lần cuối
   **30/08/2026**.
3. **Skill nói ngược luật của repo** — nguy hiểm nhất, vì agent đọc skill trước khi đọc `CLAUDE.md`.

```
git log -1 --format='%h %ad' --date=short -- docs/ai/     # c8bbc65 2026-08-08
ls ~/.ai-devkit/tasks | wc -l                             # 0 (thư mục không có)
sqlite3 ~/.ai-devkit/memory.db 'select scope,count(*),max(updated_at) from knowledge group by scope;'
```

### Bảng

| Skill | Dòng | Nguồn | Đề xuất | Lý do |
|---|---|---|---|---|
| `archify` | 137 | tự cài (`skills experimental_install`) | **GIỮ** | `CLAUDE.md` chỉ định làm mặc định cho mọi diagram người đọc xem |
| `agentic-mermaid-diagram-workflow` | 40 | tự cài (commit `76522a9`) | **GIỮ** | `CLAUDE.md` chỉ định cho diagram dạng text sống trong Markdown/Wiki |
| `tdd` | 66 | `ai-devkit install` | **GIỮ** | Repo có 38 file test + vitest; `CLAUDE.md` không có luật test-first nào thay thế |
| `memory` | 121 | `ai-devkit install` | **HOÃN** | `CLAUDE.md` đang gọi `saveKnowledge` của chính server này — quyết cùng G0-5, đừng gỡ lẻ |
| `verify` | 95 | `ai-devkit install` | **HOÃN** | Gỡ *sau khi* G1-4 xong, vì `verify-pinit` là bản cụ thể thay nó; gỡ trước thì hụt một nhịp |
| `dev-pr` | 46 | `ai-devkit install` | **GỠ** | Nói ngược luật: skill `push` và mở PR, `CLAUDE.md` cấm `git push` tuyệt đối |
| `dev-commit` | 39 | `ai-devkit install` | **GỠ** | "Quy ước commit" + "Bắt buộc" trong `CLAUDE.md` đã là luật commit, chi tiết hơn |
| `dev-worktree` | 73 | `ai-devkit install` | **GỠ** | `agents create/new/sync` trong `scripts/pinit-agents.sh` thay thế hoàn toàn |
| `task` | 158 | `ai-devkit install` | **GỠ** | Plane là board duy nhất; `~/.ai-devkit/tasks` rỗng — CLI này chưa từng được dùng |
| `agent-management` | 49 | `ai-devkit install` | **GỠ** | Đã bọc trong `agents ls/new/send`; `ai-devkit start` còn làm mất context nên bị thay bằng `agents new` |
| `agent-communication` | 26 | `ai-devkit install` | **GỠ** | `agents send` bọc đúng lệnh này, `agents --help` đã mô tả |
| `dev-lifecycle` | 129 | `ai-devkit install` | **GỠ** | Orchestrator cho 7 phase skill dưới; gỡ phần thân thì đầu không còn việc |
| `dev-requirements` | 55 | `ai-devkit install` | **GỠ** | Sản phẩm là `docs/ai/requirements/` — nguội từ 08/08/2026 |
| `dev-design` | 39 | `ai-devkit install` | **GỠ** | Sản phẩm là `docs/ai/design/` — nguội từ 08/08/2026 |
| `dev-planning` | 47 | `ai-devkit install` | **GỠ** | Sản phẩm là `docs/ai/planning/` — nguội từ 08/08/2026 |
| `dev-implementation` | 54 | `ai-devkit install` | **GỠ** | Sản phẩm là `docs/ai/implementation/` — nguội từ 08/08/2026 |
| `dev-testing` | 31 | `ai-devkit install` | **GỠ** | Sản phẩm là `docs/ai/testing/` — nguội từ 08/08/2026 |
| `dev-review` | 42 | `ai-devkit install` | **GỠ** | Trùng vai với `/code-review` của Claude Code và mục "Review bằng bằng chứng" (giai đoạn 4) |
| `document-code` | 86 | `ai-devkit install` | **GỠ** | Lưu kết quả vào store ai-devkit đã nguội; chỗ đúng cho tài liệu dùng lại là Plane Wiki |

**19/19 skill có mặt trong bảng.** Cộng lại: giữ 3 (243 dòng) · hoãn 2 (216 dòng) ·
gỡ 14 (874 dòng). Gỡ hết nhóm "GỠ" thì `SKILL.md` thường trú giảm từ **1.333 → 459 dòng**.

### Hai điều đáng nói hơn con số

**Trùng vai là vấn đề lớn hơn chi phí context.** 874 dòng không nhiều. Thứ gây hại là một
việc có hai bộ luật: agent vừa đọc `dev-pr` ("push rồi mở PR") vừa đọc `CLAUDE.md`
("không `git push` — để tôi tự push"). `dev-commit` và `dev-worktree` cùng kiểu. Rủi ro không
phải chậm, mà là agent làm đúng theo skill và sai theo repo.

**Nhóm 7 phase skill + `dev-lifecycle` đi liền với G0-4.** Gỡ 8 skill này mà giữ `docs/ai/`
thì còn 25 file không ai sinh thêm, không ai trỏ tới. Giữ skill mà xóa `docs/ai/` thì skill
chạy sẽ dựng lại thư mục. Nên quyết một lần cho cả hai, đừng tách.

### Đã duyệt và đã thực hiện

Chủ repo duyệt **cả nhóm 14 skill "GỠ"** ngày 21/11/2026, với lập luận quyết định là chuyện
trùng vai chứ không phải chi phí context: `dev-pr` dạy "push rồi mở PR" trong khi `CLAUDE.md`
cấm `git push` tuyệt đối.

Gỡ ở G0-3. Hai dòng "HOÃN" (`memory`, `verify`) **vẫn còn** — `memory` chờ quyết định về MCP,
`verify` chờ `verify-pinit` ở G1-4 thay chỗ.

Sau khi gỡ, `.ai-devkit.json` còn **3 skill**: `tdd`, `memory`, `verify`.

Bốn chỗ ghi "19 skill" đã sửa theo trong cùng commit G0-3: `CLAUDE.md` (3 chỗ),
`scripts/pinit-agents.sh` (3 chỗ). Các con số 19/17 **còn lại trong file này là cố ý** —
đây là ảnh chụp trạng thái *trước* khi dọn, giữ nguyên để sau này còn so được.
---

## 4. MCP server

```
jq -r '.mcpServers | keys[]' .mcp.json          # project scope
jq -r '.mcpServers | keys[]' ~/.claude.json     # user scope
```

| Server | Scope | Khai ở | Ghi chú |
|---|---|---|---|
| `memory` | project | `.mcp.json` | `node` trỏ thẳng vào `dist/index.js` của `@ai-devkit/memory` |
| `agentic-mermaid` | project | `.mcp.json` | `./node_modules/agentic-mermaid/dist/agentic-mermaid-mcp.js` |
| `plane` | user | `~/.claude.json` | token qua `${PLANE_API_KEY}`, cố tình không commit |

**3 server, không có local scope nào cho project này.**

`.mcp.json` đang ở trạng thái **skip-worktree** (`git ls-files -v | grep -v '^H'` → `S .mcp.json`)
— file duy nhất trong repo ở trạng thái này. Đây là lý do `agents sync` vấp khi rebase (G3-6).

Lưu ý lệch: `.ai-devkit.json` khai server `memory` chạy bằng `npx -y @ai-devkit/memory`, còn
`.mcp.json` thật thì gọi `node` vào đường dẫn tuyệt đối. Bản `.mcp.json` mới là bản đang chạy;
dùng `npx` thì server chết im lặng trên Node 26.

---

## 5. Phase docs của ai-devkit (đầu vào cho G0-4)

```
find docs/ai -type f | wc -l
grep -rn "docs/ai" --include='*.md' . --exclude-dir=node_modules --exclude-dir=.agents | grep -v '^./docs/ai/'
```

**25 file** trong `docs/ai/`: 7 thư mục phase (`requirements`, `design`, `planning`,
`implementation`, `testing`, `deployment`, `monitoring`) × (1 `README.md` + 2 tài liệu feature),
cộng `docs/ai/features/glossary-index/` (4 file).

**Không file nào ngoài `docs/ai/` trỏ tới `docs/ai/`** — các tham chiếu duy nhất là giữa các
file trong chính thư mục đó. Nghĩa là xóa cả `docs/ai/` sẽ không làm link nào ở nơi khác gãy.

### Doc đầu việc nói sai một chỗ ở đây

G0-4 ghi "đoạn `ai-devkit init` đã chèn vào `AGENTS.md`". Kiểm lại: `AGENTS.md` **chỉ có một
khối duy nhất**, nằm giữa `<!-- agentic-mermaid:start -->` và `<!-- agentic-mermaid:end -->`,
vào repo qua commit `76522a9 chore(mermaid): thêm skill agentic-mermaid cho agent`.
`ai-devkit` **chưa bao giờ chèn gì vào `AGENTS.md`**.

Nên khi làm G0-4, tiêu chí "`AGENTS.md` chỉ còn nội dung chủ repo tự viết" đã đúng từ đầu;
việc thật của G0-4 chỉ là quyết định giữ hay xóa `docs/ai/` (25 file).

---

## 6. `/context` trước khi dọn

> **Chủ repo dán output `/context` vào đây.** Chạy trước G0-3 (gỡ skill) để con số này là
> trạng thái "chưa dọn".

```
(chưa có)
```

## 7. `/context` sau khi dọn

> Dán sau khi G0-3 và G0-4 xong, để so với mục 6.

```
(chưa có)
```
