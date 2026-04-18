---
slug: quan-ly-context-claude-code-monorepo
title: "Quản lý Context Claude Code trong Monorepo: 7 case thực tế và cách giải quyết"
description: "7 case thực tế dùng Claude Code trong monorepo. Sessions share giữa Extension và CLI thế nào, phân biệt claude -c vs --resume, multi-context workflow."
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [claude-code, monorepo, workflow, productivity, vscode]
date: '2026-05-02T08:00:00Z'
image: https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&auto=format&fit=crop&q=80
---

Bài viết này tổng hợp những vấn đề thực tế tôi gặp khi dùng Claude Code làm việc trong monorepo công ty. Mỗi service một tech stack khác nhau (Java, Python, Go, React), nhiều integrations với DevOps/DataOps, và mỗi ngày phải nhận task từ PO/BA, vào đúng service, dùng Claude Code tổng hợp overview/detail thành README.md. Nếu bạn đang gặp tình huống tương tự — context lẫn lộn giữa các tasks, sợ mất content khi crash, không biết khi nào chat ở Extension Panel khi nào chat ở Terminal — bài này dành cho bạn.

<!-- truncate -->

# Quản lý Context Claude Code trong Monorepo: 7 case thực tế

> Bài viết này tổng hợp những vấn đề thực tế tôi gặp khi dùng Claude Code làm việc trong monorepo công ty. Mỗi service một tech stack khác nhau (Java, Python, Go, React), nhiều integrations với DevOps/DataOps, và mỗi ngày tôi phải nhận task từ PO/BA, vào đúng service, dùng Claude Code tổng hợp overview/detail thành README.md.

## Mục lục

1. [Case 1: Máy crash giữa session — có mất content không?](#case-1)
2. [Case 2: Đang làm feature, sếp giao bug khác — context có bị mất?](#case-2)
3. [Case 3: VS Code Extension và Terminal CLI — sessions CÓ share, nhưng có caveat](#case-3)
4. [Case 4: "Remember X" trong Extension tạo file MEMORY.md](#case-4)
5. [Case 5: `claude -c` crash với lỗi `null is not an object`](#case-5)
6. [Case 6: 15 file changes lẫn lộn 2 việc trên 1 branch](#case-6)
7. [Case 7: Resume session 1 tuần cũ trên branch khác — nên không?](#case-7)
8. [Tổng kết: Bộ quy tắc cho monorepo workflow](#tong-ket)

## Case 1: Máy crash giữa session — có mất content không? {#case-1}

### Tình huống

Đang làm task lớn, content prompt + response đã hơn 50K tokens. Máy đột ngột restart (out of memory, force kill, etc.). Khi mở lại Claude Code, tôi sợ mất hết.

### Câu trả lời ngắn

**Không mất content** — sessions auto-save liên tục xuống disk. Nhưng cần biết chính xác giữ gì và mất gì.

### Sessions lưu ở đâu?

Mọi tương tác với Claude Code CLI lưu tại:

```
~/.claude/projects/{project-path-encoded}/{session-id}/
├── transcript.jsonl     # Toàn bộ conversation history
├── checkpoints/         # Snapshot mỗi user prompt
├── tasks/               # Task list state
└── subagents/           # Subagent transcripts riêng
```

**Saved continuously** — không phải end-of-session save. Mỗi message Claude xử lý xong là flush xuống disk ngay.

### Crash giữ gì, mất gì?

**Giữ nguyên:**

- Toàn bộ conversation history (mọi prompts + responses đã hoàn thành)
- File changes Claude đã làm qua Write/Edit tools
- Checkpoints (snapshot của state)
- Subagent results đã return

**Có thể mất:**

- Message đang gõ chưa submit
- Response Claude đang generate dở (phần chưa stream xong)
- Background tasks đang chạy (cần restart)
- Bash commands đang chạy mid-execution

### Recovery sau crash

```bash
# Cách 1: Continue most recent (đơn giản nhất)
claude -c

# Cách 2: List sessions rồi chọn từ picker
claude -r

# Cách 3: Resume theo tên (nếu đã rename)
claude -r "feature-PE-123-auth-2fa"

# Cách 4: Resume theo session UUID
claude --session-id "550e8400-e29b-41d4-a716-446655440000"
```

### Best practice

**Đặt tên session ngay từ đầu** để resume dễ tìm:

```bash
# Đừng làm vậy
claude

# Hãy làm vậy
claude -n "PE-123-auth-2fa-implementation"
```

Sau crash:

```bash
claude -r "PE-123-auth-2fa-implementation"
# → Resume đúng session, có context đầy đủ
```

## Case 2: Đang làm feature, sếp giao bug khác — context có bị mất? {#case-2}

### Tình huống

Đang làm feature trên branch `feature/PE-123-2fa` với context dày đặc trong session. Sếp Slack: "Fix gấp bug payment timeout!" Tôi cần switch sang branch khác để fix.

**Câu hỏi:**

- Tạo branch mới có làm mất session feature không?
- Nếu bug related tới feature, share context như thế nào?

### Câu trả lời ngắn

**Không mất**. Có 4 patterns để chọn tùy tình huống:

### Pattern 1: Multiple Sessions (cho khác context hoàn toàn)

**Khi nào dùng:** Bug ở service khác hẳn với feature.

```bash
# Terminal 1 — Feature work
cd ~/monorepo/services/auth-java
claude -n "PE-123-2fa-feature"

# Terminal 2 — Bug fix song song (không ảnh hưởng terminal 1)
cd ~/monorepo/services/payment-go
git checkout -b hotfix/PE-456-payment-timeout
claude -n "PE-456-payment-hotfix"
```

Mỗi terminal = 1 session độc lập. Đóng terminal nào không ảnh hưởng terminal khác.

### Pattern 2: Git Worktrees ⭐ (BEST cho monorepo)

**Khi nào dùng:** Cần work parallel cùng service nhưng different branches.

Vấn đề thông thường: `git checkout` đổi branch → mất working state, phải stash. Worktree giải quyết:

```bash
cd ~/monorepo
# Đang ở feature/PE-123-2fa, làm việc dở dang

# Tạo worktree riêng cho bug
git worktree add ../monorepo-hotfix hotfix/PE-456-bug

# Worktree này là folder mới hoàn toàn, có copy code, branch riêng
cd ../monorepo-hotfix
claude -n "PE-456-hotfix"

# Khi xong:
cd ~/monorepo
git worktree remove ../monorepo-hotfix
```

**Ưu điểm worktree:**

- Build artifacts riêng (Java target, Python venv, node_modules) không conflict
- Có thể chạy app cả 2 cùng lúc với ports khác nhau
- Test fix bug mà feature dev server vẫn running

### Pattern 3: Fork Session ⭐ (cho cùng context)

**Khi nào dùng:** Bug liên quan đến feature đang làm, muốn share context.

```bash
# Trong session feature hiện tại
/rename PE-123-2fa-main

# Mở terminal mới, fork session
claude --resume PE-123-2fa-main --fork-session "PE-123-investigate-edge-case"

# → Session mới có FULL context của session cũ
# → Original session "PE-123-2fa-main" KHÔNG bị thay đổi
```

### Pattern 4: Same session với Checkpoint/Rewind

**Khi nào dùng:** Bug nhỏ, fix nhanh, không cần branch riêng.

```
> Pause feature work. Fix bug nhỏ này: <mô tả bug>

# Sau khi fix xong:
Esc + Esc → Restore conversation only → quay về context feature
```

### So sánh 4 patterns

| Pattern | Khi dùng | Context share | Branch isolation |
|---------|----------|:-------------:|:----------------:|
| **Multiple sessions** | Khác service hoàn toàn | ❌ | ✅ |
| **Git Worktrees** | Cùng service, khác branch | ❌ | ✅ |
| **Fork Session** | Bug related to feature | ✅ Full | ⚠️ |
| **Same session + Rewind** | Bug nhỏ, fix nhanh | ✅ Full | ❌ |

## Case 3: VS Code Extension và Terminal CLI — sessions CÓ share, nhưng có caveat {#case-3}

### Tình huống

Tôi đang chat trong Extension Panel của VS Code. Mở terminal mới và gõ `claude -c` để continue conversation. Nhưng terminal hiện setup wizard như chưa có session nào! Tôi tưởng 2 interfaces tách biệt — nhưng thực ra không phải.

### Sự thật từ docs Anthropic

Theo [docs chính thức của Anthropic](https://code.claude.com/docs/en/vs-code):

> **"The extension and CLI share the same conversation history. To continue an extension conversation in the CLI, run `claude --resume` in the terminal."**

→ Sessions **CÓ share** giữa Extension và Terminal CLI. Settings (`~/.claude/settings.json`, hooks, allowed commands) cũng share luôn.

### Tại sao test "remember 42" thất bại?

Vấn đề ở chỗ tôi dùng **sai lệnh resume**:

| Lệnh | Behavior | Có thấy session từ extension? |
|------|----------|:------------------------------:|
| `claude -c` (continue) | Nhảy thẳng vào session **most recent** của **directory hiện tại** | ⚠️ Không chắc — phụ thuộc most recent là gì |
| `claude --resume` (-r) | Mở **interactive picker** với danh sách tất cả sessions | ✅ Có |
| `claude --session-id <UUID>` | Nhảy thẳng vào session cụ thể | ✅ Có (nếu biết UUID) |

**Lý do `claude -c` không hoạt động trong test:**

`-c` chỉ resume "most recent" của current working directory. Nếu:

- Session từ extension đang chạy LIVE → có thể không count là "completed", `-c` skip
- Hoặc terminal context khác với extension context (folder khác)
- Hoặc most recent là session khác

→ Đây là lý do terminal hiện setup wizard.

### Test lại đúng cách

**Bước 1:** Chat trong Extension:

```
> Hello, remember the number 42
```

**Bước 2:** Mở terminal:

```bash
claude --resume
```

**Bước 3:** Picker hiện ra với tất cả sessions, tìm session vừa chat:

```
Resume Session
Search...

> Hello, remember the number 42
  2 minutes ago · main · 5KB
```

→ Chọn session → resume thành công với context đầy đủ.

### Caveat: Resume LIVE session bị broken

Có [issue #12819 trên GitHub](https://github.com/anthropics/claude-code/issues/12819) đã được report:

> Khi resume một session đang LIVE từ extension, extension hiển thị transcript nhưng **không thực sự connect** tới CLI session đang chạy. Message gõ ở extension không tới được CLI và ngược lại.

**Hiểu đơn giản:** Extension và CLI **không phải 2 cửa sổ song song của cùng process**. Chúng là **2 client đọc cùng 1 file lịch sử conversation** (transcript.jsonl).

Nghĩa là:

- ✅ Resume session đã **kết thúc** từ interface khác → OK
- ❌ Resume session đang **LIVE** ở interface khác → Hiển thị transcript nhưng không sync messages

### Workflow đúng cho switch giữa 2 interfaces

#### Pattern: Đóng → Resume

```bash
# Đang code trong VS Code Extension
# → Cần dùng power features (--worktree, scripts, etc.)

# Bước 1: ĐÓNG conversation trong extension
# (close tab hoặc /exit, không chỉ minimize)

# Bước 2: Mở terminal
claude --resume
# → Picker, chọn conversation → tiếp tục bình thường

# Cũng work ngược lại:
# Đóng terminal session → mở extension → click history → resume
```

#### Pattern: Reference terminal output trong extension

Bonus tip: Trong extension, có thể reference terminal output bằng `@terminal:name`:

```
# Trong extension prompt:
> Phân tích lỗi này: @terminal:1
# (1 là số terminal trong VS Code)

# Hoặc theo title:
> Đọc log Kafka: @terminal:kafka-logs
```

→ Claude đọc command output, error, log mà không cần copy-paste. Cực hữu ích khi debug.

### Khi nào dùng cái nào?

**Dùng Extension Panel khi:**

- ✅ Code-focused tasks: edit components, refactor
- ✅ UI iteration nhanh: thấy preview ngay
- ✅ Plan mode review (visual tốt hơn)
- ✅ Inline diff review trước khi accept
- ✅ Single task, focused work

**Dùng Terminal CLI khi:**

- ✅ Multi-task parallel: mỗi terminal 1 session độc lập
- ✅ Quick automation, scripting (`-p` mode)
- ✅ Power features: `--worktree`, `--bare`, `--max-turns`, `--fork-session`
- ✅ Custom subagents qua `--agents` JSON
- ✅ CI/CD, batch jobs

### Quy tắc vàng

> **Một session = một surface tại một thời điểm.**
>
> Sessions share được giữa Extension và CLI, NHƯNG:
>
> - Đừng chạy đồng thời cùng 1 session ở cả 2 surface (sẽ broken sync)
> - Khi cần "chuyển nhà": ĐÓNG ở chỗ này → `claude --resume` ở chỗ kia
> - Tránh resume một session đang LIVE

## Case 4: "Remember X" trong Extension tạo file MEMORY.md {#case-4}

### Tình huống

Khi tôi gõ `remember 42` trong Extension Panel, Claude làm điều này:

```
✓ Write MEMORY.md
  2 lines

  - [User asked to remember 42](user_remembers_42.md) — literal recall

✓ Done. Stored 42 in memory — I'll recall it in future conversations.
```

### Hiểu đúng về behavior này

Đây **không phải bug** — đây là behavior có chủ đích của Claude Code:

- Claude Code lưu persistent memory vào file `MEMORY.md` để **share giữa các sessions**
- Vì sessions share giữa Extension và CLI (Case 3), file này được đọc bởi cả 2
- Pattern tương tự `CLAUDE.md` nhưng dành cho user-driven memory (không phải project conventions)

### Vẫn có vấn đề cần lưu ý

**1. Files có thể accidentally commit vào git**

```bash
# Nếu không gitignore, sẽ thấy MEMORY.md trong:
git status
# → Modified: MEMORY.md (file mới được tạo)
```

**2. File phantom từ markdown links**

Trong ví dụ trên, Claude tạo link `[...](user_remembers_42.md)` — file này có thể không tồn tại thật, chỉ là link reference. Khi tools khác (như render diff) cố đọc file → có thể trigger lỗi (case 5).

**3. Memory này không có cấu trúc**

Free-form text, không như `CLAUDE.md` hierarchy có structure rõ ràng. Sau nhiều lần "remember X", file MEMORY.md có thể lộn xộn, hard to maintain.

### Khuyến nghị sử dụng

#### ✅ Dùng "remember X" khi:

- Cần persist 1-2 facts đơn giản across sessions
- Không quan trọng structure
- Sẵn sàng review MEMORY.md định kỳ
- Đã gitignore MEMORY.md hoặc commit có chủ đích

#### ❌ Đừng dùng "remember X" khi:

- Cần persist project conventions, architecture decisions → dùng `CLAUDE.md`
- Cần structured knowledge accumulation → dùng subagent với `memory: project`
- Trong shared repo mà chưa thống nhất với team

### Best practice setup

#### Bước 1: Gitignore MEMORY.md (mặc định)

```bash
# Add vào .gitignore
echo "" >> .gitignore
echo "# Claude Code persistent memory (user-specific)" >> .gitignore
echo "MEMORY.md" >> .gitignore
echo "user_remembers_*.md" >> .gitignore

# Hoặc nếu muốn commit (team agreement)
# Để trống .gitignore, document trong README
```

#### Bước 2: Edit CLAUDE.md cho project conventions

Thay vì dùng "remember", edit CLAUDE.md trực tiếp:

```bash
cat >> CLAUDE.md << 'EOF'

## Project Conventions
- Branch naming: `feat/<JIRA-ID>-<slug>`
- Commit format: `[<JIRA-ID>] <type>: <message>`
- Magic numbers: 42 (xem ADR-001)
EOF
```

→ Có cấu trúc, commit có chủ đích, mọi Claude session đều đọc được.

#### Bước 3: Subagent với memory cho structured knowledge

`.claude/agents/project-explorer.md`:

```markdown
---
name: project-explorer
description: Project knowledge expert
memory: project
---

You build up project knowledge over time.
On invocation, read .claude/agent-memory/project-explorer/MEMORY.md
After tasks, update MEMORY.md với:
- Architecture insights
- Recent decisions
- Gotchas discovered
```

→ Knowledge được tích lũy có cấu trúc, tracked theo agent, không rác repo.

### So sánh 3 cơ chế memory

| Cơ chế | Storage | Best for | Structured? |
|--------|---------|----------|:-----------:|
| **`MEMORY.md`** (auto by "remember X") | `MEMORY.md` ở project root | Quick personal notes | ❌ |
| **`CLAUDE.md`** (manual edit) | `CLAUDE.md` hierarchy | Project conventions, team-shared | ✅ |
| **Subagent memory** | `.claude/agent-memory/<agent>/MEMORY.md` | Structured domain knowledge | ✅ |

→ Recommend cho monorepo: dùng kết hợp **CLAUDE.md** + **subagent memory**, gitignore `MEMORY.md`.

## Case 5: `claude -c` crash với lỗi `null is not an object` {#case-5}

### Tình huống

Sau khi test "remember 42" trong Extension Panel, tôi mở terminal và gõ `claude -c`. Crash ngay lập tức với stack trace dài:

```
ERROR  null is not an object (evaluating 'A.split')

at _KB (/$bunfs/root/claude:2122:1437)
at ao_ (/$bunfs/root/claude:1886:4846)
at Z$ (/$bunfs/root/claude:678:20801)
...
```

### Phân tích nguyên nhân

Function `_KB` là render structured patch (file diff):

1. Nhận `originalFile` (content của file gốc)
2. Cố gọi `.split('\n')` để get firstLine
3. Nhưng `originalFile` đang là `null` → crash

**Nguyên nhân có thể:**

#### 1. Resume LIVE session (most likely)

Như đã đề cập ở Case 3 — sessions share giữa Extension và CLI, nhưng resume **session đang LIVE** ở interface khác sẽ broken sync. Extension đang giữ session active → CLI cố resume → state inconsistent → crash render diff.

#### 2. File reference đã thay đổi

Session cũ có reference đến file mà giờ:

- File đã bị delete/move
- Hoặc file phantom (như `user_remembers_42.md` từ MEMORY.md link)
- Path file đã thay đổi

#### 3. Bug version cũ

Có thể version Claude Code đang dùng có bug, đã fix trong version mới hơn.

### Giải pháp

#### Cách 1: Đóng extension session trước, rồi resume CLI ⭐

```bash
# Bước 1: Trong VS Code Extension Panel
# Đóng conversation hiện tại (close tab hoặc /exit)
# KHÔNG chỉ minimize, phải close hẳn

# Bước 2: Trong terminal
claude --resume
# → Picker hiện ra, chọn session
# → Resume thành công, không crash
```

#### Cách 2: Skip session cũ, start fresh

```bash
# Đừng dùng -c với session đang lỗi
claude -n "fresh-task"
```

#### Cách 3: Update Claude Code

```bash
# Check version
claude --version

# Update
claude update
# Hoặc:
npm install -g @anthropic-ai/claude-code@latest
```

#### Cách 4: Cleanup session bị corrupt (worst case)

```bash
# List projects để tìm session crash
ls -lt ~/.claude/projects/

# Backup session bị corrupt (để phòng)
mv ~/.claude/projects/<problematic-folder> \
   ~/.claude/projects/<problematic-folder>.bak

# Test lại
claude --resume
```

### Bài học rút ra

**1. Đừng switch interfaces khi session đang LIVE**

Workflow đúng:

```
Extension Panel → close conversation → đóng tab
↓
Terminal: claude --resume → chọn session
↓
Tiếp tục bình thường
```

**2. Phân biệt `-c` và `--resume`**

```bash
# claude -c: Most recent của directory
#   → Có thể crash nếu most recent là session live ở extension

# claude --resume: Picker tất cả sessions
#   → An toàn hơn, có thể skip session lỗi
```

**3. Update Claude Code thường xuyên**

Bug như `null is not an object` thường được fix trong patches. Update mỗi 1-2 tuần để tránh known issues.

## Case 6: 15 file changes lẫn lộn 2 việc trên 1 branch {#case-6}

### Tình huống thực tế

Mở Source Control panel của VS Code, tôi shocked:

```
CHANGES (15 files):
≡ blog/2026-04-22-claude-code-slash-commands.md
≡ blog/2026-04-23-claude-code-memory.md
≡ blog/2026-04-24-claude-code-skills.md
≡ blog/2026-04-25-claude-code-subagents.md
≡ blog/2026-04-26-claude-code-mcp.md
≡ blog/2026-04-27-claude-code-hooks.md
≡ blog/2026-04-28-claude-code-plugins.md
≡ blog/2026-04-29-claude-code-checkpoints.md
≡ blog/2026-04-30-claude-code-advanced-features.md
≡ blog/2026-05-01-claude-code-cli.md
≡ components/common/floating-phone.tsx
≡ components/common/footer.tsx
≡ components/common/index.ts
≡ components/common/header/index.tsx
≡ components/layouts/main.tsx
≡ pages/about.tsx

Branch: feat/portfolio-redesign-fire-theme
```

**Vấn đề:** Branch tên là `feat/portfolio-redesign-fire-theme` nhưng có:

1. **10 files blog content** — series tutorial Claude Code
2. **6 files component changes** — portfolio UI redesign

Hai việc hoàn toàn khác nhau bị trộn vào 1 branch!

### Anti-pattern này gây ra gì?

- ❌ PR review khó: reviewer phải đọc 2 contexts khác nhau
- ❌ Revert nguy hiểm: revert UI sẽ revert cả blog content
- ❌ Conflict cao: blog content xung đột với UI changes khi rebase
- ❌ Git history confusing: 1 commit mix code + content
- ❌ CI/CD không hiệu quả: build full khi chỉ thay đổi blog content

### Giải pháp: Tách branches

```bash
cd ~/Desktop/pinit/pinit

# Bước 1: Stash all changes
git stash

# Bước 2: Tạo branch cho blog content
git checkout main && git pull
git checkout -b content/claude-code-blog-series

# Bước 3: Pop stash, stage chỉ blog files
git stash pop
git add 'blog/2026-04-*.md' 'blog/2026-05-*.md'
git commit -m "[content] Add Claude Code blog series 10 modules"
git push -u origin content/claude-code-blog-series

# Bước 4: Stash phần còn lại (UI changes)
git stash

# Bước 5: Quay về feature branch cho UI work
git checkout feat/portfolio-redesign-fire-theme
git stash pop

# Giờ chỉ còn UI changes ở branch này
git status
# → 6 files components/, pages/
```

### Setup workflow phòng ngừa

#### Pattern: Mỗi loại work = mỗi branch riêng

```
Branches naming convention:

content/<topic>           → Blog posts, documentation
feat/<jira-id>-<slug>     → New features
fix/<jira-id>-<slug>      → Bug fixes
hotfix/<jira-id>-<slug>   → Urgent production fixes
refactor/<scope>-<slug>   → Refactoring
chore/<task>              → Tooling, configs
```

#### Pattern: Worktree cho parallel work

```bash
# Main folder cho UI work
cd ~/Desktop/pinit/pinit
git checkout feat/portfolio-redesign-fire-theme

# Worktree riêng cho blog content
git worktree add ../pinit-blog content/claude-code-blog-series

# Mở 2 VS Code windows song song:
code .                  # Window 1: UI work
code ../pinit-blog      # Window 2: Blog content

# Mỗi window: extension chat tách biệt
# Mỗi window: dev server riêng (port 3000 + 3001)
# Không lẫn lộn context!
```

#### Pattern: Pre-commit hook check

`.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Block commit nếu mix blog + components

CHANGED=$(git diff --cached --name-only)
HAS_BLOG=$(echo "$CHANGED" | grep -c "^blog/" || true)
HAS_CODE=$(echo "$CHANGED" | grep -c "^components/\|^pages/" || true)

if [ "$HAS_BLOG" -gt 0 ] && [ "$HAS_CODE" -gt 0 ]; then
  echo "❌ Cannot mix blog content + code changes in 1 commit"
  echo "Use separate commits hoặc branches:"
  echo "  - blog/  → branch content/*"
  echo "  - components/, pages/  → branch feat/*"
  exit 1
fi
```

```bash
chmod +x .git/hooks/pre-commit
```

→ Git tự động chặn commit không hợp lệ.

## Case 7: Resume session 1 tuần cũ trên branch khác — nên không? {#case-7}

### Tình huống

Gõ `claude -r` mở picker session, hiện duy nhất 1 session:

```
Resume Session
Search...

> sumary detail and all of thing this project and update in readme.md
  1 week ago · main · 1.9 MB

Ctrl+A to show all projects · Ctrl+B to toggle branch
Ctrl+V to preview · Ctrl+R to rename · Esc to cancel
```

**Phân tích:**

- Session này 1 tuần cũ, branch `main`
- Hiện tại tôi đang ở `feat/portfolio-redesign-fire-theme` với 15 file changes
- Resume có nên không?

### Câu trả lời

**Không nên resume.** Lý do:

#### 1. Context stale

Session 1 tuần qua trỏ đến state code lúc đó. Trong 1 tuần:

- Files đã thay đổi nhiều
- Có thể delete/move/rename files
- Branch đã divergent

→ Claude resume với context cũ → gợi ý sai, edit sai files.

#### 2. Branch khác → context mismatch

Session ở `main`, hiện tại ở `feat/portfolio-redesign-fire-theme`. Files khác hoàn toàn:

- Blog files (10 cái) chưa tồn tại lúc session cũ chạy
- Components đã refactor
- Configs có thể đã đổi

→ Resume → Claude confuse về current state.

#### 3. Nguy cơ crash (case 5)

Session cũ có thể reference files giờ không còn → crash khi render diff.

### Giải pháp đúng

#### Lựa chọn 1: Skip + start fresh (recommend)

```bash
# Bấm Esc trong picker
# Sau đó:
claude -n "blog-and-redesign-cleanup"

# Bắt đầu fresh với context hiện tại
> Tôi đang ở branch feat/portfolio-redesign-fire-theme
> với 15 file changes lẫn lộn blog + UI.
> Hãy giúp tôi tách thành 2 branches.
```

#### Lựa chọn 2: Preview rồi quyết định

Trong picker, bấm `Ctrl+V`:

```
Preview content session cũ
↓
Đọc xem có info hữu ích không
↓
Esc → cancel nếu không cần
```

#### Lựa chọn 3: Conversation Search trong session mới

Thay vì resume, search context cũ trong session mới:

```bash
claude -n "current-task"

> Search past chats về "readme summary project"
```

→ Claude dùng `conversation_search` tool, đọc snippets relevant từ session cũ, đưa vào context hiện tại mà không resume hẳn.

### Best practices session management

#### Rule 1: Đặt tên session từ đầu

```bash
# ❌ Bad
claude

# ✅ Good
claude -n "PE-123-auth-2fa-feature"
```

#### Rule 2: Cleanup định kỳ

```bash
# Check disk usage
du -sh ~/.claude/projects/

# List sessions theo tuổi
ls -lt ~/.claude/projects/

# Xóa sessions > 30 ngày (manual review trước)
find ~/.claude/projects -name "transcript.jsonl" -mtime +30 \
  -exec dirname {} \; | xargs -I {} ls -la {}
```

#### Rule 3: Đừng resume cross-branch

```bash
# Nếu session ở branch A, hiện đang ở branch B
# → Đừng resume, start fresh

# Trừ khi explicitly:
git checkout <branch-cũ>  # Match branch trước
claude -r "session-name"  # Rồi mới resume
```

#### Rule 4: Khi nào nên resume?

✅ **Resume khi:**

- Cùng branch, cùng task
- Trong vòng vài giờ tới 1-2 ngày
- Files chưa thay đổi nhiều
- Cần tiếp tục đúng context

❌ **Không resume khi:**

- Session > 1 tuần
- Branch khác
- Files đã thay đổi nhiều
- Task khác hẳn (dù related)

## Tổng kết: Bộ quy tắc cho monorepo workflow {#tong-ket}

### 7 quy tắc rút ra từ 7 cases

#### 1. Sessions auto-save — đừng sợ crash

```bash
# Setup naming convention từ đầu
claude -n "PE-{ID}-{description}"

# Recovery dễ dàng
claude -c           # most recent
claude -r "name"    # specific session
```

#### 2. Multi-context = Multi-pattern

| Tình huống | Pattern |
|-----------|---------|
| Khác service hoàn toàn | Multiple sessions trong terminals khác |
| Cùng service, khác branch | Git Worktrees |
| Bug related to feature | Fork session |
| Bug nhỏ, fix nhanh | Same session + Rewind |

#### 3. Extension và Terminal CLI share sessions, nhưng có caveat

```
Sessions share được giữa Extension và Terminal CLI ✓
- claude --resume → mở picker show all sessions
- Settings, hooks, allowed commands cũng share

NHƯNG đừng:
- Resume session đang LIVE ở interface khác (broken sync)
- Mix cả 2 interfaces cho cùng 1 task

Workflow đúng khi switch:
Đóng session ở Extension → claude --resume ở Terminal
```

**Phân biệt `-c` và `--resume`:**

```bash
claude -c            # Most recent của cwd, có thể crash với live session
claude --resume      # Picker, an toàn hơn, chọn được session khác
claude --session-id  # Chọn UUID cụ thể
```

#### 4. Hiểu đúng 3 cơ chế memory

```bash
# 1. "Remember X" pattern → tạo MEMORY.md
#    Use case: quick personal notes
#    ⚠️ Gitignore nếu không muốn commit

# 2. CLAUDE.md (manual edit) → project conventions
echo "## Notes\n- Magic number: 42" >> CLAUDE.md

# 3. Subagent với memory: project → structured knowledge
#    Best for: domain expertise tích lũy over time
```

#### 5. Update Claude Code thường xuyên

```bash
# Tránh bugs cũ như null is not an object
claude update
# Hoặc
npm install -g @anthropic-ai/claude-code@latest
```

#### 6. Branch phải sạch sẽ

```
Naming convention:
- content/* → blog, docs
- feat/*    → features
- fix/*     → bugs
- hotfix/*  → production fixes
- refactor/* → cleanups
- chore/*   → tooling

Pre-commit hook để enforce
```

#### 7. Đừng resume session quá cũ

```
✅ Resume: cùng branch, cùng task, < 2 ngày
❌ Don't: cross-branch, > 1 tuần, task khác
→ Thay vào đó: claude -n "new-name" + conversation_search
```

### Workflow daily đề xuất

```bash
# Morning: Nhận task mới từ PO/BA
cd ~/monorepo/services/<relevant-service>

# Setup task workspace
git checkout -b feat/PE-789-new-feature

# Start session với name rõ ràng
claude -n "PE-789-new-feature"

# Work...
> Generate README cho service này

# Lunch break: máy crash hay close laptop
# (không lo, sessions saved)

# Afternoon: resume
claude -r "PE-789-new-feature"
> Continue from where we left off

# Sếp interrupt: hotfix urgent
# Mở terminal mới, KHÔNG đóng terminal hiện tại
git worktree add ../monorepo-hotfix hotfix/PE-456-urgent-bug
cd ../monorepo-hotfix
claude -n "PE-456-urgent-bug"
> Investigate timeout issue

# Fix xong, push PR, quay lại terminal feature
# Context feature vẫn intact

# End of day: commit work
git add -p  # interactive staging
git commit -m "[feat] PE-789: ..."
git push
```

### Setup tooling 1 lần để forever benefit

```bash
# 1. CLAUDE.md hierarchy
# Root + per-service CLAUDE.md
# (xem chi tiết trong blog post Memory)

# 2. Subagents per service với memory: project
# .claude/agents/<service>-explorer.md

# 3. Custom slash commands
# /new-task, /sync-readme

# 4. Pre-commit hooks
# Block mix blog + code commits
# Validate frontmatter

# 5. Auto-mode permissions baseline
python3 setup-auto-mode-permissions.py \
  --include-edits --include-tests --include-git-write
```

### Action items cho bạn

Nếu bạn đang gặp vấn đề tương tự:

**Hôm nay (30 phút):**

1. ✅ Test resume cross-interface đúng cách: chat extension → close → `claude --resume` ở terminal
2. ✅ Verify Extension và Terminal share session: chat extension một câu, đóng tab, `claude --resume` xem có không
3. ✅ Check disk usage `~/.claude/projects/` cleanup nếu > 5GB

**Tuần này (vài giờ):**

4. ✅ Setup CLAUDE.md hierarchy cho monorepo
5. ✅ Tạo subagent cho service đang làm
6. ✅ Đặt naming convention cho branches + sessions
7. ✅ Setup pre-commit hook block mixed commits
8. ✅ Gitignore `MEMORY.md` nếu không muốn commit

**Tháng này:**

9. ✅ Pack workflow thành plugin nội bộ team
10. ✅ Onboard team members theo guide
11. ✅ Iterate dựa trên pain points thực tế

## Bonus: 2 tips chưa biết về Claude Code

### Bonus 1: Reference terminal output bằng `@terminal:name`

Trong Extension Panel, có thể reference output của terminal mà không cần copy-paste:

```
# Trong extension prompt:
> Phân tích lỗi này: @terminal:1
# (1 là số terminal trong VS Code)

# Hoặc theo title của terminal:
> Đọc log Kafka consumer: @terminal:kafka-consumer
```

→ Claude tự đọc command output, error, log từ terminal đó. Cực hữu ích khi debug Kafka, Vertica, BigQuery logs trong workflow của tôi.

### Bonus 2: `--fork-session` cho experiment

Combo `--fork-session` với `--continue` hoặc `--resume` tạo session ID mới thay vì reuse:

```bash
# Đang debug ở event-processor, muốn thử hướng giải quyết khác
# mà không phá session gốc:
claude -c --fork-session

# Tương đương "git branch" cho conversation
# Original session intact, fork là independent
```

**Use cases:**

- Try alternative approach without losing original
- A/B test different solutions
- Branch off từ successful work cho variations
- Test breaking changes

## Kết bài

Quản lý context khi dùng Claude Code trong monorepo phức tạp **không phải về nhớ commands** mà là về **understanding mental model**:

- Sessions là **persistent state on disk**, share giữa Extension và CLI
- Nhưng **2 interfaces là 2 client đọc cùng file lịch sử** — không phải 2 cửa sổ song song của 1 process
- Branches phải **clean và focused**
- Tools (worktree, fork session, CLAUDE.md, subagent memory) **bổ sung cho nhau**

Khi đã có mental model đúng, mọi tình huống — từ crash recovery đến parallel multi-context work — đều thành routine. Workflow chạy mượt, không lo mất context, không confusion.

**Lessons learned của tôi:**

1. **Mất 2 ngày debug** vì nghĩ Extension và CLI tách biệt — thực ra share, chỉ cần dùng đúng `claude --resume` thay vì `claude -c`
2. **Crash `null is not an object`** là do resume LIVE session, fix bằng cách đóng extension trước khi resume terminal
3. **15 file changes lẫn 2 việc** là anti-pattern phổ biến nhất — pre-commit hook là cứu cánh
4. **Worktree** thay đổi cuộc sống cho monorepo work — không bao giờ phải `git stash` nữa

**Câu hỏi cho bạn:**

- Bạn đang gặp case nào tương tự?
- Workflow hiện tại có pain points gì?
- Setup nào trên đây dễ apply nhất cho team?

Comment ở dưới hoặc DM mình. Tôi sẽ tổng hợp các case thực tế khác thành phần 2 của series này.

## Resources liên quan

- [Module 02: Memory & CLAUDE.md hierarchy](/blog/claude-code-memory)
- [Module 04: Subagents với memory:project](/blog/claude-code-subagents)
- [Module 08: Checkpoints & Rewind](/blog/claude-code-checkpoints)
- [Module 09: Advanced Features (Worktrees, Fork)](/blog/claude-code-advanced-features)
- [Module 10: CLI Reference](/blog/claude-code-cli)

---

*Bài viết tổng hợp từ trải nghiệm thực tế dùng Claude Code trong monorepo công ty với Java, Python, Go, React services và DevOps/DataOps integrations.*
