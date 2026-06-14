---
slug: claude-code-slash-commands
title: Claude Code Slash Commands - Hướng dẫn toàn diện
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Claude, AI, DevTools, Productivity]
date: '2026-04-22T12:00:00Z'
image: https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80
---

Slash commands là cơ chế shortcut mạnh mẽ trong Claude Code, giúp bạn điều khiển hành vi của AI mà không cần gõ lại prompt dài. Bài viết này tổng hợp đầy đủ các loại slash commands, cách tạo command tùy chỉnh dạng Skills, và ứng dụng thực tế cho blog cá nhân.

<!-- truncate -->

# Claude Code Slash Commands: Từ cơ bản đến nâng cao

## 1. Slash Commands là gì?

Slash commands là **shortcut điều khiển hành vi của Claude Code** trong phiên làm việc tương tác. Bạn gõ `/tên-lệnh` và Claude thực thi instruction đã định sẵn, thay vì phải nhập lại prompt dài mỗi lần.

Có **4 loại** slash commands chính:

| Loại | Ví dụ | Nguồn |
|------|-------|-------|
| **Built-in** | `/help`, `/clear`, `/model` | Có sẵn trong Claude Code |
| **Skills** | `/optimize`, `/pr` | User tự định nghĩa qua `SKILL.md` |
| **Plugin** | `/frontend-design:frontend-design` | Từ plugin đã cài |
| **MCP prompts** | `/mcp__github__list_prs` | Từ MCP servers |

> ⚠️ **Lưu ý quan trọng:** Custom slash commands đã được **gộp vào Skills**. Files trong `.claude/commands/` vẫn chạy được nhưng `.claude/skills/` là cách được khuyên dùng hiện nay. Cả hai đều tạo ra shortcut `/command-name`.

## 2. Built-in Commands - Tham khảo nhanh

Có hơn **55+ built-in commands** và **5 bundled skills**. Gõ `/` trong Claude Code để xem tất cả, hoặc `/` + chữ cái để filter.

### Quản lý phiên & cấu hình

| Lệnh | Mục đích |
|------|----------|
| `/help` | Hiện trợ giúp |
| `/clear` (alias `/reset`, `/new`) | Xóa hội thoại |
| `/exit` (alias `/quit`) | Thoát REPL |
| `/config` (alias `/settings`) | Mở Settings |
| `/status` | Hiện version, model, tài khoản |
| `/doctor` | Chẩn đoán cài đặt |
| `/login` / `/logout` | Đăng nhập/Đăng xuất Anthropic |
| `/theme` | Đổi color theme |
| `/keybindings` | Cấu hình phím tắt |

### Quản lý hội thoại & context

| Lệnh | Mục đích |
|------|----------|
| `/context` | Hiển thị mức dùng context dạng grid màu |
| `/compact [instructions]` | Nén hội thoại (tùy chọn focus) |
| `/copy [N]` | Copy response Claude vào clipboard |
| `/export [filename]` | Xuất hội thoại ra file/clipboard |
| `/cost` | Xem thống kê dùng token |
| `/btw <question>` | Hỏi phụ không thêm vào history |

### Phiên & rewind

| Lệnh | Mục đích |
|------|----------|
| `/resume [session]` (alias `/continue`) | Tiếp tục hội thoại |
| `/rename [name]` | Đổi tên phiên |
| `/branch [name]` | Tách hội thoại sang phiên mới |
| `/rewind` (alias `/checkpoint`) | Rewind code/hội thoại |

### Memory & Skills

| Lệnh | Mục đích |
|------|----------|
| `/init` | Tạo `CLAUDE.md` |
| `/memory` | Sửa `CLAUDE.md`, toggle auto-memory |
| `/skills` | Liệt kê skills có sẵn |
| `/agents` | Quản lý cấu hình agent |

### Lập kế hoạch & thực thi

| Lệnh | Mục đích |
|------|----------|
| `/plan [description]` | Vào plan mode |
| `/effort [low\|medium\|high\|max\|auto]` | Đặt mức effort |
| `/fast [on\|off]` | Toggle fast mode |
| `/model [model]` | Chọn model |
| `/tasks` | Liệt kê/quản lý background tasks |
| `/schedule [description]` | Tạo/quản lý task định lịch |

### Code review & PR

| Lệnh | Mục đích |
|------|----------|
| `/diff` | Interactive diff viewer cho thay đổi chưa commit |
| `/pr-comments [PR]` | Lấy comments từ GitHub PR |
| `/security-review` | Phân tích branch tìm security vulnerability |
| `/install-github-app` | Cài GitHub Actions app |

### Bundled Skills

| Skill | Mục đích |
|-------|----------|
| `/batch <instruction>` | Điều phối thay đổi parallel quy mô lớn dùng worktrees |
| `/claude-api` | Load Claude API reference cho ngôn ngữ project |
| `/debug [description]` | Bật debug logging |
| `/loop [interval] <prompt>` | Chạy prompt lặp theo interval |
| `/simplify [focus]` | Review files đã thay đổi cho code quality |

## 3. Custom Commands - Skills (cách dùng mới)

Hai cách tạo `/command-name`:

| Cách | Vị trí | Trạng thái |
|------|--------|----------|
| **Skills (recommended)** | `.claude/skills/<name>/SKILL.md` | Chuẩn hiện tại |
| **Legacy Commands** | `.claude/commands/<name>.md` | Vẫn chạy |

> Nếu cùng tên, **skill thắng**. Ví dụ: cả `.claude/commands/review.md` và `.claude/skills/review/SKILL.md` cùng tồn tại — bản skill được dùng.

### Tại sao nên dùng Skills?

- **Cấu trúc thư mục** — bundle scripts, templates, reference files cùng skill
- **Auto-invocation** — Claude tự gọi khi context phù hợp
- **Invocation control** — chọn user/Claude/cả hai có thể gọi
- **Subagent execution** — chạy trong context isolated với `context: fork`
- **Progressive disclosure** — load file phụ chỉ khi cần

### Cách tạo command custom (dạng skill)

```bash
mkdir -p .claude/skills/my-command
```

File `.claude/skills/my-command/SKILL.md`:

```markdown
---
name: my-command
description: What this command does and when to use it
---

# My Command

Instructions for Claude to follow when this command is invoked.

1. First step
2. Second step
3. Third step
```

### Frontmatter - Reference đầy đủ

| Field | Mục đích | Default |
|-------|----------|---------|
| `name` | Tên command (thành `/name`) | Tên thư mục |
| `description` | Mô tả ngắn (giúp Claude biết khi nào dùng) | Đoạn đầu |
| `argument-hint` | Hint argument cho auto-completion | None |
| `allowed-tools` | Tools dùng được không cần permission | Inherit |
| `model` | Model cụ thể cần dùng | Inherit |
| `disable-model-invocation` | Nếu `true`, chỉ user gọi được | `false` |
| `user-invocable` | Nếu `false`, ẩn khỏi menu `/` | `true` |
| `context` | Đặt `fork` để chạy trong subagent isolated | None |
| `agent` | Loại agent khi `context: fork` | `general-purpose` |
| `hooks` | Hooks scope skill (PreToolUse, PostToolUse, Stop) | None |

### Arguments - 2 cách

**Tất cả argument với `$ARGUMENTS`:**

```markdown
---
name: fix-issue
description: Fix a GitHub issue by number
---

Fix issue #$ARGUMENTS following our coding standards
```

Dùng: `/fix-issue 123` → `$ARGUMENTS` = `"123"`

**Argument riêng lẻ với `$0`, `$1`...:**

```markdown
---
name: review-pr
description: Review a PR with priority
---

Review PR #$0 with priority $1
```

Dùng: `/review-pr 456 high` → `$0`=`"456"`, `$1`=`"high"`

### Dynamic context với shell command

Chạy bash command trước prompt với `!` prefix:

```markdown
---
name: commit
description: Create a git commit with context
allowed-tools: Bash(git *)
---

## Context

- Current git status: !`git status`
- Current git diff: !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -5`

## Your task

Based on the above changes, create a single git commit.
```

### File references với `@`

```markdown
Review the implementation in @src/utils/helpers.js
Compare @src/old-version.js with @src/new-version.js
```

### User-only command (không cho Claude tự gọi)

Cho command có side effects (deploy, delete...):

```markdown
---
name: deploy
description: Deploy to production
disable-model-invocation: true
allowed-tools: Bash(npm *), Bash(git *)
---

Deploy the application to production:

1. Run tests
2. Build application
3. Push to deployment target
4. Verify deployment
```

## 4. Plugin Commands & MCP Prompts

### Plugin Commands

Plugins có thể cung cấp custom command:

```
/plugin-name:command-name
```

Hoặc đơn giản `/command-name` khi không có conflict tên.

### MCP Prompts as Commands

MCP servers có thể expose prompts dưới dạng slash command:

```
/mcp__<server-name>__<prompt-name> [arguments]
```

**Examples:**

```
/mcp__github__list_prs
/mcp__github__pr_review 456
/mcp__jira__create_issue "Bug title" high
```

**MCP Permission syntax:**

- `mcp__github` — truy cập toàn bộ GitHub MCP server
- `mcp__github__*` — wildcard mọi tool
- `mcp__github__get_issue` — chỉ tool cụ thể

## 5. Lifecycle - Slash Command chạy như thế nào

```
User gõ /optimize
  ↓
Claude Code tìm trong .claude/skills/ và .claude/commands/
  ↓
Tìm thấy optimize/SKILL.md
  ↓
Parse YAML frontmatter
  ↓
Thực thi !`shell command` (nếu có)
  ↓
Substitute $ARGUMENTS / $0, $1...
  ↓
Gửi prompt đầy đủ tới Claude
  ↓
Claude xử lý → trả kết quả cho user
```

## 6. Best Practices

| ✅ Nên | ❌ Không nên |
|--------|------------|
| Đặt tên rõ ràng, action-oriented | Tạo command cho task chỉ làm 1 lần |
| Có `description` kèm trigger conditions | Logic phức tạp trong command |
| Mỗi command 1 task duy nhất | Hard-code thông tin nhạy cảm |
| `disable-model-invocation` cho command có side effects | Bỏ trống field `description` |
| Dùng `!` prefix lấy dynamic context | Giả định Claude biết state hiện tại |
| Tổ chức file liên quan trong skill directory | Nhồi tất cả vào 1 file |

## 7. Workflow ứng dụng cho Blog Project

Với project blog cá nhân, dưới đây là một số slash commands hữu ích bạn có thể tự tạo:

### `/new-post` - Tạo skeleton bài blog

```markdown
---
name: new-post
description: Create a new blog post skeleton with frontmatter
argument-hint: [post-title]
---

Create a new blog post file at `blog/$ARGUMENTS.md` with:

1. YAML frontmatter (title, date, slug, tags, description)
2. H1 heading từ title
3. Section "Introduction"
4. Section "Main Content" với 2-3 H2 subheadings
5. Section "Conclusion"
6. Slug từ title (kebab-case, không tiếng Việt có dấu)
```

### `/seo-check` - Kiểm tra SEO bài viết

```markdown
---
name: seo-check
description: Check SEO of the current blog post
allowed-tools: Read
---

Đọc bài viết @$ARGUMENTS và kiểm tra:

1. Title length (50-60 ký tự)
2. Meta description (150-160 ký tự)
3. Mật độ keyword
4. H1/H2/H3 hierarchy
5. Internal links và external links
6. Image alt texts
7. Slug chuẩn SEO

Đưa ra recommendations cụ thể với line numbers.
```

### `/publish-post` - Publish + commit + push

```markdown
---
name: publish-post
description: Validate, commit, and push a new blog post
allowed-tools: Bash(git *), Bash(npm *)
disable-model-invocation: true
---

## Context

- Current branch: !`git branch --show-current`
- Changed files: !`git status --short`

## Steps

1. Chạy `npm run lint` và `npm run build` — fix lỗi nếu có
2. Stage chỉ files liên quan tới bài post mới
3. Commit message: "post: <title của bài>"
4. Push lên remote
5. Đưa ra link preview Vercel
```

### `/optimize-image` - Tối ưu ảnh blog

```markdown
---
name: optimize-image
description: Suggest image optimization for blog post
allowed-tools: Read, Bash(file *)
argument-hint: [image-path]
---

Analyze @$ARGUMENTS:
- Format hiện tại
- Kích thước (KB/MB)
- Dimensions

Đưa ra:
1. Format khuyến nghị (WebP/AVIF cho web)
2. Compression command (cwebp, sharp)
3. Responsive sizes (srcset suggestions)
4. Alt text dựa trên context bài viết
```

## 8. Câu hỏi thường gặp (FAQ)

### Q1: Sự khác biệt giữa `/commands` và `/skills`?

Cả hai đều tạo `/command-name`. Khác biệt chính:

- `/commands` là cách cũ — chỉ là 1 file `.md` đơn lẻ.
- `/skills` là cách mới — là **thư mục** chứa `SKILL.md` + scripts/templates kèm theo, hỗ trợ auto-invocation và subagent execution.

Khi cùng tên, **skill thắng**. Files trong `.claude/commands/` cũ vẫn chạy nhưng nên migrate dần.

### Q2: Slash command nên đặt cấp project hay user?

- **Project-level** (`.claude/commands/` hoặc `.claude/skills/`) — commit git, share với team
- **User-level** (`~/.claude/commands/` hoặc `~/.claude/skills/`) — preference cá nhân, dùng cho mọi project

Cho blog cá nhân: bạn có thể dùng project-level cho command đặc thù blog (ví dụ `/new-post`), và user-level cho command chung (ví dụ `/optimize`).

### Q3: Làm sao Claude biết khi nào auto-invoke skill mà không cần user gõ?

Phụ thuộc vào field `description` trong frontmatter. Description càng rõ ràng về **trigger conditions** thì Claude càng dễ tự gọi đúng lúc.

Ví dụ tốt:

```yaml
description: Generate API documentation from JSDoc comments. Use when user asks to "document API", "create docs", or has changes in src/api/.
```

Ví dụ dở:

```yaml
description: API docs
```

### Q4: Khi nào nên đặt `disable-model-invocation: true`?

Khi command có **side effects nguy hiểm**: deploy, delete, push, payment... Bạn không muốn Claude tự gọi mà phải user trực tiếp gõ.

Ví dụ: `/deploy`, `/drop-database`, `/cancel-subscription`.

### Q5: Lệnh `!` trong slash command có chạy được lệnh nguy hiểm không?

`!` chạy bash command thực, **CÓ rủi ro** nếu argument từ user không validate. Phải:

1. Whitelist `allowed-tools` cụ thể (ví dụ `Bash(git *)` chỉ cho git command)
2. Không cho user pass argument vào shell substitution
3. Quote variables cẩn thận

Ví dụ an toàn:

```yaml
allowed-tools: Bash(git status), Bash(git log *)
```

Ví dụ nguy hiểm:

```yaml
allowed-tools: Bash(*)
```

### Q6: Command tôi tạo không hoạt động, fix sao?

Checklist:

1. **File path đúng:** `.claude/skills/<name>/SKILL.md` hoặc `.claude/commands/<name>.md`
2. **`name` trong frontmatter** khớp với tên command muốn gọi
3. **Restart Claude Code session** (skill chỉ load khi start)
4. Chạy `/help` xem command có trong danh sách không
5. Kiểm tra YAML frontmatter syntax (đặc biệt indentation)

### Q7: Cài command từ repo bên thứ ba có an toàn không?

**Cẩn thận.** Trước khi `cp` command từ source bên ngoài:

1. Đọc nội dung file `.md` (đặc biệt phần `!` shell commands và `allowed-tools`)
2. Kiểm tra `disable-model-invocation` để biết Claude có tự chạy không
3. Test trong project sandbox/test trước khi dùng project quan trọng
4. Để ý các pattern lén như `Bash(curl *)`, `Bash(rm *)`

## 9. Kết luận

Slash commands là một trong những tính năng mạnh nhất của Claude Code, giúp bạn:

- **Tiết kiệm thời gian** — không phải gõ lại prompt dài cho task lặp lại
- **Đảm bảo consistency** — team cùng dùng một workflow chuẩn
- **Tự động hóa** — kết hợp với hooks và MCP servers cho pipeline phức tạp
- **Mở rộng được** — từ command đơn giản đến skills có scripts, templates kèm theo

Khuyến nghị bắt đầu với 2-3 command đơn giản phục vụ workflow hàng ngày của bạn (ví dụ `/commit`, `/new-post`, `/seo-check`), rồi dần dần mở rộng khi nhận ra pattern lặp lại trong công việc.

Hãy bắt đầu bằng cách gõ `/help` trong Claude Code để khám phá các built-in commands có sẵn, sau đó tạo skill đầu tiên của riêng bạn!
