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
