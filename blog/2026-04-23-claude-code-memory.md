---
slug: claude-code-memory
title: Claude Code Memory - Quản lý context xuyên session
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Claude, AI, DevTools, Memory]
date: '2026-04-23T12:00:00Z'
image: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80
---

Memory cho phép Claude giữ context giữa các session thay vì quên sạch sau mỗi lần restart. Bài viết này tổng hợp đầy đủ memory hierarchy 8 cấp, cách dùng `CLAUDE.md`, modular rules, auto memory, và cách setup memory hiệu quả cho project blog cá nhân.

<!-- truncate -->

# Claude Code Memory: Từ cơ bản đến nâng cao

## 1. Memory là gì?

Memory cho phép Claude **giữ context giữa các session** thay vì quên sạch sau mỗi lần restart. Có 2 dạng chính:

| Dạng | Nơi áp dụng | Cơ chế |
|------|-----------|--------|
| **Auto-synthesis** | claude.ai (web/desktop) | Tự tổng hợp memory mỗi 24h từ các cuộc hội thoại |
| **Filesystem-based** | Claude Code | File `CLAUDE.md` bạn tự viết, version-control được |

**Lợi ích chính:**

- Share project standards với team qua git
- Lưu preferences cá nhân của developer
- Maintain rule riêng cho từng directory/module
- Import doc bên ngoài qua `@path`
- Version control memory như một phần của project

Hệ thống memory hoạt động ở **nhiều cấp** — từ global personal preferences xuống tới subdirectory cụ thể, cho phép kiểm soát chi tiết Claude nhớ gì và áp dụng kiến thức đó như thế nào.

## 2. Memory Commands - Tham khảo nhanh

| Lệnh | Mục đích | Cách dùng | Khi dùng |
|------|----------|-----------|----------|
| `/init` | Khởi tạo project memory | `/init` | Project mới, lần đầu setup `CLAUDE.md` |
| `/memory` | Mở editor sửa memory file | `/memory` | Update lớn, reorganize, review |
| Prefix `#` | Thêm rule 1 dòng nhanh | `# Your rule here` | Trong lúc chat, rule đơn giản |
| `# new rule into memory` | Thêm rule chi tiết nhiều dòng | `# new rule into memory` + content | Rule phức tạp |
| `# remember this` | Memory bằng natural language | `# remember this` + content | Conversational update |
| `@path/to/file` | Import nội dung file ngoài | `@README.md` hoặc `@docs/api.md` | Reference doc đã có |

## 3. Quick Start - Khởi tạo Memory

### `/init` - Cách nhanh nhất

```
/init
```

**Làm gì:**

- Tạo file `CLAUDE.md` (thường ở `./CLAUDE.md` hoặc `./.claude/CLAUDE.md`)
- Setup project conventions và guidelines
- Tạo nền cho context persistence giữa các session
- Cung cấp template structure document project standards

**Interactive mode (multi-phase wizard):**

```bash
CLAUDE_CODE_NEW_INIT=true claude
/init
```

### Quick update với prefix `#`

Bạn có thể thêm rule nhanh vào memory **trong bất kỳ cuộc hội thoại nào** bằng cách bắt đầu message với `#`:

```
# Always use TypeScript strict mode in this project
# Prefer async/await over promise chains
# Run npm test before every commit
# Use kebab-case for file names
```

**Cách hoạt động:**

1. Gõ `#` + rule
2. Claude nhận diện đây là memory update request
3. Claude hỏi muốn lưu vào file nào (project/personal)
4. Rule được append vào CLAUDE.md tương ứng
5. Session sau tự load context này

### `/memory` - Mở editor

```
/memory
```

Mở memory files trong editor mặc định, cho phép update/reorganize lớn và truy cập tất cả memory files trong hierarchy.

**So sánh `/memory` vs `/init`:**

| Khía cạnh | `/memory` | `/init` |
|-----------|-----------|---------|
| **Mục đích** | Sửa memory file đã có | Tạo CLAUDE.md mới |
| **Khi dùng** | Update/modify project context | Bắt đầu project mới |
| **Hành động** | Mở editor để chỉnh sửa | Generate starter template |
| **Workflow** | Maintain liên tục | One-time setup |

### Memory Imports với `@path`

Files `CLAUDE.md` hỗ trợ syntax `@path/to/file` để include content bên ngoài:

```markdown
# Project Documentation
See @README.md for project overview
See @package.json for available npm commands
See @docs/architecture.md for system design

# Import từ home directory với absolute path
@~/.claude/my-project-instructions.md
```

**Đặc điểm import:**

- Hỗ trợ cả relative và absolute paths
- Recursive imports tới đa **5 levels**
- Lần đầu import từ external location sẽ trigger approval dialog (security)
- Import directives **không evaluate** trong markdown code spans/blocks
- Tránh duplicate bằng cách reference doc đã có
- Tự động include content vào context của Claude

## 4. Memory Architecture - 8 cấp Hierarchy

Memory trong Claude Code theo cấu trúc **phân cấp** — các scope khác nhau phục vụ mục đích khác nhau.

### Memory Hierarchy đầy đủ (theo thứ tự ưu tiên)

| Cấp | Tên | Vị trí | Best For |
|-----|-----|--------|----------|
| **1 (cao nhất)** | Managed Policy | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`<br/>Linux/WSL: `/etc/claude-code/CLAUDE.md`<br/>Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | Policy toàn org, security, compliance |
| **2** | Managed Drop-ins (v2.1.83+) | `managed-settings.d/` | Modular policy files |
| **3** | Project Memory | `./.claude/CLAUDE.md` hoặc `./CLAUDE.md` | Team standards, architecture (commit git) |
| **4** | Project Rules | `./.claude/rules/*.md` | Modular, path-specific rules |
| **5** | User Memory | `~/.claude/CLAUDE.md` | Personal preferences (mọi project) |
| **6** | User-Level Rules | `~/.claude/rules/*.md` | Personal rules (mọi project) |
| **7** | Local Project Memory | `./CLAUDE.local.md` | Personal project-specific (legacy) |
| **8 (thấp nhất)** | Auto Memory | `~/.claude/projects/<project>/memory/` | Note tự động của Claude |

> **Lưu ý:** `CLAUDE.local.md` không còn trong official documentation tính tới March 2026. Cho project mới nên dùng `~/.claude/CLAUDE.md` (user-level) hoặc `.claude/rules/` (project-level, path-scoped) thay thế.

### Memory Discovery Behavior

Claude search memory files theo thứ tự sau, location sớm hơn ưu tiên cao hơn:

```
Managed Policy → Managed Drop-ins → Project Memory → Project Rules
  → User Memory → User Rules → Local Project Memory → Auto Memory
       ↓
   imports @ → loads referenced files recursively (max 5 levels)
```

## 5. Loại trừ CLAUDE.md với `claudeMdExcludes`

Trong monorepo lớn, một số `CLAUDE.md` có thể không liên quan tới task hiện tại. `claudeMdExcludes` cho phép skip chúng:

```json
// ~/.claude/settings.json hoặc .claude/settings.json
{
  "claudeMdExcludes": [
    "packages/legacy-app/CLAUDE.md",
    "vendors/**/CLAUDE.md"
  ]
}
```

Patterns match path **relative tới project root**. Hữu ích cho monorepo nhiều sub-project, repo có CLAUDE.md vendored, giảm noise context window.

## 6. Modular Rules System

Tạo rules có cấu trúc, theo path cụ thể, dùng thư mục `.claude/rules/`:

```
your-project/
├── .claude/
│   ├── CLAUDE.md
│   └── rules/
│       ├── code-style.md
│       ├── testing.md
│       ├── security.md
│       └── api/                  # Subdirectories được hỗ trợ
│           ├── conventions.md
│           └── validation.md

~/.claude/
├── CLAUDE.md
└── rules/                        # User-level rules (mọi project)
    ├── personal-style.md
    └── preferred-patterns.md
```

### Path-Specific Rules với YAML Frontmatter

Định nghĩa rule chỉ áp dụng cho file path cụ thể:

```markdown
---
paths: src/api/**/*.ts
---

# API Development Rules

- All API endpoints must include input validation
- Use Zod for schema validation
- Document all parameters and response types
- Include error handling for all operations
```

**Glob Pattern Examples:**

- `**/*.ts` — tất cả TypeScript files
- `src/**/*` — tất cả files dưới `src/`
- `src/**/*.{ts,tsx}` — nhiều extensions
- `{src,lib}/**/*.ts, tests/**/*.test.ts` — nhiều patterns

## 7. Auto Memory

Auto memory là directory **persistent** nơi Claude **tự động ghi** learning, pattern, insight khi làm việc với project. Khác với CLAUDE.md mà bạn tự viết, auto memory được Claude write trong session.

### Cách Auto Memory hoạt động

- **Vị trí:** `~/.claude/projects/<project>/memory/`
- **Entrypoint:** `MEMORY.md` là file chính
- **Topic files:** Optional, các file riêng cho subject cụ thể
- **Loading behavior:**
  - 200 dòng đầu của `MEMORY.md` được load vào system prompt khi start session
  - Topic files load **on-demand**, không khi startup
- **Read/write:** Claude đọc và ghi memory files trong session khi discover pattern

### Cấu trúc thư mục Auto Memory

```
~/.claude/projects/<project>/memory/
├── MEMORY.md              # Entrypoint (200 dòng đầu load tự động)
├── debugging.md           # Topic file (load on demand)
├── api-conventions.md     # Topic file (load on demand)
└── testing-patterns.md    # Topic file (load on demand)
```

### Bật/tắt Auto Memory

Auto memory điều khiển bằng env variable `CLAUDE_CODE_DISABLE_AUTO_MEMORY`:

| Value | Behavior |
|-------|----------|
| `0` | Force auto memory **on** |
| `1` | Force auto memory **off** |
| *(unset)* | Default (auto memory enabled) |

```bash
# Disable cho 1 session
CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 claude

# Force on
CLAUDE_CODE_DISABLE_AUTO_MEMORY=0 claude
```

### Custom Auto Memory Directory

Mặc định là `~/.claude/projects/<project>/memory/`. Có thể đổi bằng `autoMemoryDirectory` (từ **v2.1.74+**):

```json
{
  "autoMemoryDirectory": "/path/to/custom/memory/directory"
}
```

## 8. Examples thực tế

### Example 1: Project Memory Structure

**File:** `./CLAUDE.md`

```markdown
# Project Configuration

## Project Overview
- **Name**: E-commerce Platform
- **Tech Stack**: Node.js, PostgreSQL, React 18, Docker
- **Team Size**: 5 developers

## Architecture
@docs/architecture.md
@docs/api-standards.md

## Development Standards

### Code Style
- Use Prettier for formatting
- Use ESLint with airbnb config
- Maximum line length: 100 characters
- Use 2-space indentation

### Naming Conventions
- **Files**: kebab-case (user-controller.js)
- **Classes**: PascalCase (UserService)
- **Functions/Variables**: camelCase (getUserById)
- **Constants**: UPPER_SNAKE_CASE (API_BASE_URL)
- **Database Tables**: snake_case (user_accounts)

### Testing Requirements
- Minimum 80% code coverage
- All critical paths must have tests
- Use Jest for unit tests
- Test filenames: `*.test.ts` or `*.spec.ts`

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm test` | Run test suite |
| `npm run lint` | Check code style |
| `npm run build` | Build for production |
```

### Example 2: Personal Memory

**File:** `~/.claude/CLAUDE.md`

```markdown
# My Development Preferences

## About Me
- **Experience Level**: 8 years full-stack development
- **Preferred Languages**: TypeScript, Python
- **Communication Style**: Direct, with examples

## Code Preferences

### Error Handling
I prefer explicit error handling with try-catch blocks and meaningful error messages.

### Comments
Use comments for WHY, not WHAT. Code should be self-documenting.

### Testing
I prefer TDD. Write tests first, then implementation.

## Tooling
- **IDE**: VS Code with vim keybindings
- **Terminal**: Zsh with Oh-My-Zsh
- **Format**: Prettier (100 char line length)
```

## 9. Best Practices

### ✅ Nên làm (Do's)

- **Cụ thể, chi tiết:** dùng instruction rõ ràng thay vì vague
  - ✅ "Use 2-space indentation for all JavaScript files"
  - ❌ "Follow best practices"
- **Tổ chức theo markdown sections** rõ ràng
- **Dùng đúng cấp hierarchy:**
  - Managed policy: company-wide policy, security, compliance
  - Project memory: team standards, architecture (commit git)
  - User memory: personal preferences, communication style, tooling
  - Directory memory: module-specific rules
- **Tận dụng imports** với `@path/to/file` để reference doc đã có
- **Document common commands** bạn dùng nhiều
- **Version control project memory:** commit `CLAUDE.md` vào git
- **Review định kỳ** khi project phát triển
- **Cho concrete examples** với code snippets cụ thể

### ❌ Không nên (Don'ts)

- **Không lưu secrets:** API keys, passwords, tokens, credentials
- **Không lưu sensitive data:** PII, private info, proprietary secrets
- **Không duplicate content:** dùng imports `@path` thay vì copy
- **Không vague:** tránh "follow best practices", "write good code"
- **Không quá dài:** giới hạn ~500 dòng/file
- **Không over-organize:** dùng hierarchy chiến lược
- **Không forget update:** memory cũ gây nhầm lẫn
- **Không vượt nesting limits:** memory imports max 5 levels

### Chọn đúng cấp Memory

| Use Case | Memory Level | Lý do |
|----------|-------------|-------|
| Security policy công ty | Managed Policy | Áp dụng toàn org |
| Team code style guide | Project | Share với team qua git |
| Editor shortcut cá nhân | User | Cá nhân, không share |
| API module standards | Directory | Chỉ riêng module đó |

## 10. Workflow ứng dụng cho Blog Project

Với project blog cá nhân, đây là cách setup memory hiệu quả:

### A. `./CLAUDE.md` cho project blog

```markdown
# Blog Project Configuration

## Project Overview
- **Name**: Pin's Personal Blog
- **Tech Stack**: Next.js 14, TypeScript, MDX
- **Hosting**: Vercel
- **Content path**: `blog/*.md`

## Writing Standards

### Frontmatter Schema (mỗi post)
- `title` (string, ≤60 chars cho SEO)
- `slug` (kebab-case, không dấu tiếng Việt)
- `date` (ISO 8601: YYYY-MM-DD)
- `tags` (array, viết thường, ≤5 tags)
- `image` (URL hoặc path tới /public/images)

### Code Style
- Prettier formatting
- ESLint với next/core-web-vitals
- 2-space indentation
- Max line: 100 chars

### Image Handling
- Mỗi ảnh blog dùng `<Image>` của next/image
- Format ưu tiên: WebP/AVIF
- Alt text bắt buộc, ≤125 chars

### MDX Rules
- Heading bắt đầu từ H2 (H1 lấy từ frontmatter title)
- Code blocks bắt buộc có language tag
- Inline link mới mở tab khác

## Git Workflow
- Branch: `post/<slug>` cho bài mới
- Commit message: Conventional Commits
  - `post: thêm bài về Kafka consumer groups`
  - `fix: sửa typo trong post Next.js`
  - `feat: thêm component Callout cho MDX`

## Common Commands
| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Build production |
| `npm run lint` | ESLint check |
```

### B. `~/.claude/CLAUDE.md` cho personal preferences

```markdown
# Pin's Development Preferences

## About Me
- Backend dev với 8+ năm exp
- Stack chính: TypeScript/Next.js, Java (Kafka, microservices)
- Thường làm việc với data infrastructure

## Communication Style
- Trực tiếp, có ví dụ cụ thể
- Tiếng Việt cho giải thích, tiếng Anh cho technical terms
- Thích diagram + before/after code

## Code Preferences
- Always use TypeScript strict mode
- Prefer async/await over promise chains
- Functional > imperative khi có thể
- Error handling explicit, không swallow errors

## Anti-patterns tôi tránh
- `any` type (trừ khi không tránh được)
- `console.log` còn lại trong production code
- Magic numbers (luôn extract thành const)
```

### C. `.claude/rules/` cho path-specific

`.claude/rules/components.md`:

```markdown
---
paths: components/**/*.tsx
---

# Component Rules

- Named export, không default export
- Props interface định nghĩa trên cùng file
- Tránh inline styles, dùng theme tokens hoặc sx prop
```

`.claude/rules/api-routes.md`:

```markdown
---
paths: pages/api/**/*.ts
---

# API Routes Rules

- Validate input bằng Zod
- Return NextResponse với status code đúng
- Try-catch wrap toàn bộ handler
- Log error có context (user ID nếu có, request path)
- Không leak stack trace ra client trong production
```

## 11. Câu hỏi thường gặp (FAQ)

### Q1: Có nên commit `CLAUDE.md` vào git không?

**Có, nếu là project memory** — đây là team standards, architecture, coding conventions. Mỗi developer trong team nên dùng cùng context.

**Không** với personal memory ở `~/.claude/CLAUDE.md` (cá nhân) hoặc `.claude/settings.local.json` (override local).

### Q2: `./CLAUDE.md` và `./.claude/CLAUDE.md` khác nhau gì?

Chức năng giống nhau (đều là project memory). Khác biệt chỉ ở vị trí:

- `./CLAUDE.md` ở root repo, dễ thấy
- `./.claude/CLAUDE.md` trong subdirectory `.claude/`, gọn gàng hơn nếu repo có nhiều file dotfile

Cứ chọn 1 và dùng nhất quán.

### Q3: Imports `@path` có giới hạn gì?

- **Recursive depth tới đa 5 levels**
- Lần đầu import từ external location sẽ trigger approval dialog (security)
- Imports **không evaluate** trong code blocks
- Path hỗ trợ cả relative (`@docs/api.md`) và absolute (`@~/.claude/instructions.md`)

### Q4: Memory có làm context window phình to không?

**Có**. Mỗi memory file được load vào context của Claude khi start session.

**Khuyến nghị:**

- Giới hạn mỗi `CLAUDE.md` ≤500 dòng
- Tách rule theo path bằng `.claude/rules/` (chỉ load khi work với path đó)
- Dùng `claudeMdExcludes` cho monorepo lớn

### Q5: Auto Memory khác gì với Memory tôi tự viết?

| Khía cạnh | Auto Memory | Manual CLAUDE.md |
|-----------|-------------|-------------------|
| Ai viết? | Claude tự ghi | User tự viết |
| Vị trí | `~/.claude/projects/<project>/memory/` | `./CLAUDE.md`, `~/.claude/CLAUDE.md` |
| Khi nào ghi | Trong session, khi discover pattern | User chủ động cập nhật |
| Load behavior | 200 dòng đầu MEMORY.md auto | Toàn bộ file load khi start |
| Version control | Không (cá nhân) | Có (project memory commit git) |

Auto memory **bổ sung**, không thay thế manual memory.

### Q6: Khi nào dùng `.claude/rules/` thay vì viết hết vào `CLAUDE.md`?

Dùng `.claude/rules/` khi:

- Rule chỉ liên quan path cụ thể (API rules cho `pages/api/`, component rules cho `components/`)
- `CLAUDE.md` đang phình quá 500 dòng
- Muốn tổ chức rule theo topic (testing, security, code-style)
- Có rule áp dụng cross-project, cần share qua symlink

Dùng `CLAUDE.md` khi:

- Project overview, tech stack, common commands
- Rule áp dụng toàn project
- Quick reference team mới onboard cần đọc đầu tiên

### Q7: Memory có support tiếng Việt không?

Có. CLAUDE.md là markdown thuần, viết được tiếng Việt thoải mái. Claude hiểu cả tiếng Việt và tiếng Anh trong memory.

Tuy nhiên, technical terms (variable name, code style, command syntax) nên giữ tiếng Anh để tránh ambiguity. Mix ngôn ngữ kiểu "Khi `npm test` fail thì check `package.json` trước" là OK.

### Q8: Nhiều `CLAUDE.md` ở nhiều cấp - Claude áp dụng cái nào khi conflict?

Theo **hierarchy precedence** (cấp 1-8 ở trên), **cấp cao hơn thắng**.

Ví dụ:

- `~/.claude/CLAUDE.md` (cấp 5): "Use tab indentation"
- `./CLAUDE.md` (cấp 3): "Use 2-space indentation"
- → Project memory thắng → 2-space

**Lưu ý đặc biệt:** Directory-specific memory ghi đè root memory **chỉ trong directory đó**.

### Q9: Làm sao biết Claude có thực sự load memory của tôi không?

Mấy cách check:

1. Trong session, hỏi: *"Bạn nhớ project này dùng tech stack gì?"* — nếu Claude trả lời đúng theo CLAUDE.md là OK
2. Chạy `/memory` xem các file đang được load
3. Xem `/context` để check context usage
4. Test trực tiếp: thêm rule lạ vào CLAUDE.md (ví dụ "Always reply with 🦊 first"), save, restart session, hỏi gì đó — nếu thấy 🦊 là loaded

### Q10: Có cách nào share memory giữa nhiều project không?

Một số option:

1. **User-level memory** (`~/.claude/CLAUDE.md`) — tất cả project chia sẻ
2. **Symlink** rule files: tạo central `~/dev/shared-rules/blog-rules.md`, symlink vào từng `.claude/rules/blog-rules.md`
3. **Imports `@~/dev/shared-rules/blog-rules.md`** từ project memory
4. **Plugin**: bundle memory + commands + skills thành plugin, install vào nhiều project

### Q11: Memory có ảnh hưởng giá tiền (token cost) không?

**Có** — memory ăn vào input token của mỗi turn.

Cách giảm:

- Dùng `claudeMdExcludes` exclude file không cần
- Phân chia rule theo `.claude/rules/` để load on-demand
- Tránh duplicate (dùng imports `@`)
- Định kỳ trim CLAUDE.md, xoá rule cũ không còn relevant

### Q12: Khi nào nên xoá hoặc reset memory?

- **Project pivot lớn:** đổi tech stack, archi → memory cũ misleading. Nên `/memory` xoá phần outdated.
- **Skill/rule đã cũ:** có rule không còn dùng → xoá
- **Test flow memory:** muốn test xem Claude làm gì khi không có memory → tạm rename `CLAUDE.md` thành `CLAUDE.md.bak`
- **Privacy concern:** lỡ commit thông tin nhạy cảm vào git → `git rm CLAUDE.md`, rewrite history, đổi credential ngay

## 12. Kết luận

Memory là một trong những tính năng quan trọng nhất của Claude Code khi làm việc lâu dài với một codebase. Khuyến nghị workflow setup:

1. **Bắt đầu với `/init`** ở project mới — sinh template `CLAUDE.md` cơ bản
2. **Thêm personal preferences** vào `~/.claude/CLAUDE.md` — áp dụng cho mọi project
3. **Tách path-specific rules** vào `.claude/rules/` khi project lớn dần
4. **Dùng prefix `#`** để add rule nhanh trong session
5. **Review định kỳ** với `/memory`, trim những rule không còn relevant
6. **Để Auto Memory tự ghi** insight mà bạn không nghĩ tới

Memory đầu tư đúng cách giúp Claude hiểu project sâu hơn, giảm thời gian giải thích lại context, và tăng chất lượng output rõ rệt qua thời gian. Hãy bắt đầu bằng cách chạy `/init` ngay trong project hiện tại và xem Claude tạo template ban đầu như thế nào!
