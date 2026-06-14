---
slug: claude-code-skills
title: Claude Code Skills - Đóng gói kiến thức tái sử dụng
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Claude, AI, DevTools, Skills]
date: '2026-04-24T12:00:00Z'
image: https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80
---

Skills là cơ chế đóng gói "kiến thức + hướng dẫn + tài nguyên" mà Claude tự động load khi context phù hợp. Khác với slash command phải user gõ `/cmd`, Skills có thể tự kích hoạt nhờ Progressive Disclosure 3 cấp giúp tiết kiệm context. Bài viết này tổng hợp đầy đủ cấu trúc Skill, frontmatter, invocation modes, và áp dụng thực tế cho blog cá nhân.

<!-- truncate -->

# Claude Code Skills: Từ cơ bản đến nâng cao

## 1. Skills là gì?

**Skills** là gói "kiến thức + hướng dẫn" mà Claude **tự động load** khi context phù hợp. Khác với slash command phải user gõ `/cmd`, Skills có thể tự được kích hoạt.

Mỗi skill là **một thư mục** chứa file `SKILL.md` (instructions chính) + các file phụ trợ (scripts, templates, references). Claude tự quyết định khi nào dùng skill nào dựa trên `description` trong frontmatter.

**Lợi ích chính:**

- **Auto-invocation** — Claude tự gọi khi cần, không phải gõ `/cmd`
- **Bundle resources** — đóng gói scripts, templates, references cùng skill
- **Progressive disclosure** — chỉ load chi tiết khi cần (tiết kiệm context)
- **Subagent execution** — chạy trong context isolated với `context: fork`
- **Cross-platform** — theo Agent Skills standard (claude.ai, Claude Code, Claude API đều dùng được)

> 📝 **Lưu ý:** Custom slash commands đã được **gộp vào Skills**. Files trong `.claude/commands/` vẫn chạy nhưng skills (`.claude/skills/`) là cách được khuyên dùng.

## 2. Progressive Disclosure Architecture (3 Levels)

Đây là điểm hay nhất của Skills — Claude load context theo từng tầng, **không nuốt hết** một lúc:

```
┌─────────────────────────────────────────────┐
│ Level 1: Metadata (luôn được load)          │
│   - YAML Frontmatter (name + description)   │
│   - ~100 tokens/skill                       │
└─────────────────────────────────────────────┘
                ↓ (khi Claude detect skill phù hợp)
┌─────────────────────────────────────────────┐
│ Level 2: Instructions (khi triggered)       │
│   - SKILL.md body                           │
│   - Dưới 500 dòng / ~5k tokens              │
└─────────────────────────────────────────────┘
                ↓ (khi cần chi tiết)
┌─────────────────────────────────────────────┐
│ Level 3: Resources (on-demand)              │
│   - Scripts, templates, references          │
│   - Effectively unlimited                   │
└─────────────────────────────────────────────┘
```

**Hệ quả thực tế:**

- Bạn có thể có **hàng chục/trăm skills** mà không phình context
- Claude chỉ "biết tên" và "biết khi nào dùng" mỗi skill (Level 1)
- Khi user hỏi gì đó match → Claude bash vào filesystem đọc SKILL.md (Level 2)
- Nếu SKILL.md reference file phụ → đọc file đó (Level 3)
- **Code của script không bao giờ vào context** — chỉ output của script vào

## 3. Cấu trúc thư mục Skill

### Cấu trúc tối thiểu

```
my-skill/
└── SKILL.md          # Required, dưới 500 dòng
```

### Cấu trúc đầy đủ (recommended cho skill phức tạp)

```
my-skill/
├── SKILL.md          # Instructions chính (required)
├── templates/        # Templates Claude fill in
│   └── output-format.md
├── examples/         # Example outputs minh hoạ format mong muốn
│   └── sample-output.md
├── references/       # Domain knowledge, specifications
│   └── api-spec.md
└── scripts/          # Scripts Claude execute được
    └── validate.sh
```

> ⚠️ **Strict rule:** Tên file phải là `SKILL.md` chính xác (case-sensitive). `skill.md`, `Skill.md`, `Skills.md` đều **bị ignore**. Đừng để `README.md` trong skill folder.

### Quy tắc keep SKILL.md gọn

- **Dưới 500 dòng** (Anthropic recommend dưới 5,000 từ / ~5k tokens)
- Move chi tiết reference, large examples, specifications vào file riêng
- Reference từ SKILL.md bằng relative path: `[API reference](references/api-spec.md)`

## 4. SKILL.md - Cấu trúc đầy đủ

### Skeleton

```markdown
---
name: my-skill
description: What this skill does and when to use it
allowed-tools: Read, Grep, Glob
---

# My Skill Name

## Overview
Brief description of what this skill does and the problem it solves.

## When to Use
- Specific trigger scenarios
- What the user might say

## Steps
1. First action with specific tool references
2. Second action with expected format
3. Validation step

## Output Format
Describe the expected output structure.

## Error Handling
- If [tool] fails: [fallback action]
- If [data] is missing: [ask user or skip]

## Examples

### Good Output
[Show what success looks like]

### Common Mistakes
[Show what to avoid]
```

### Frontmatter Fields - Reference đầy đủ

| Field | Mục đích | Validation | Default |
|-------|----------|-----------|---------|
| `name` | Tên skill (thành `/name`) | Tối đa 64 ký tự, lowercase + số + hyphen | Tên thư mục |
| `description` | Mô tả + trigger conditions | Tối đa 1024 ký tự, non-empty | Đoạn đầu body |
| `argument-hint` | Hint argument cho auto-completion | String | None |
| `allowed-tools` | Tools dùng được không cần permission | Comma-separated list | Inherit |
| `model` | Model cụ thể cần dùng | Model ID | Inherit |
| `disable-model-invocation` | Nếu `true`, **chỉ user** gọi được | Boolean | `false` |
| `user-invocable` | Nếu `false`, **chỉ Claude** gọi được | Boolean | `true` |
| `context` | Đặt `fork` để chạy trong subagent isolated | `fork` | None |
| `agent` | Loại agent khi `context: fork` | Agent name | `general-purpose` |
| `shell` | Shell cho `!` commands | `bash` \| `powershell` | `bash` |
| `effort` | Effort level | `low` \| `medium` \| `high` \| `max` \| `auto` | Inherit |

### Description - Field quan trọng nhất

`description` là field **quan trọng nhất** vì Claude dùng nó để quyết định có load skill hay không. **Description dở** → skill không bao giờ trigger hoặc trigger sai chỗ.

**Công thức tốt:** *Cái skill làm gì + Khi nào dùng + Key capabilities*

❌ **Bad descriptions:**

```yaml
description: Helps with code              # Quá vague
description: Queries /api/v2/sprint endpoint with OAuth2 bearer token  # Quá technical
description: Assists with any development task  # Quá broad
```

✅ **Good descriptions:**

```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.

description: Analyze Excel spreadsheets, generate pivot tables, create charts. Use when working with Excel files, spreadsheets, or .xlsx files.

description: Generates weekly sprint reports by pulling data from Jira and GitHub. Use when user asks for sprint summary or weekly progress report.
```

Pattern: **domain → user trigger → output**.

## 5. Invocation Modes - 3 cách Điều khiển

Mặc định, **cả user lẫn Claude** đều có thể gọi skill. Hai field frontmatter điều khiển 3 mode:

| Mode | Frontmatter | Use Case |
|------|------------|----------|
| **Both invoke** (default) | (không set field nào) | Skill an toàn, read-only |
| **User-only** | `disable-model-invocation: true` | Workflow có side effects: `/commit`, `/deploy` |
| **Claude-only** | `user-invocable: false` | Background knowledge không phải command |

### Khi nào dùng cái nào?

```
Skill có side effects (deploy, commit, push, payment...)?
  → disable-model-invocation: true

Skill là background knowledge (system context, codebase facts)?
  → user-invocable: false

Skill read-only / phân tích / generate (review, analyze, doc)?
  → Mặc định (cả hai gọi được)
```

### `allowed-tools` - Hàng rào an toàn

Khi skill active, Claude **chỉ được dùng tools** trong `allowed-tools`. Đây là enforced barrier:

```yaml
# Read-only analysis skill
allowed-tools: Read, Grep, Glob

# Scaffolding skill (cần ghi file)
allowed-tools: Read, Write, Bash(git *)

# Deployment skill (chỉ chạy bash)
allowed-tools: Bash
```

**Combine pattern:** Skill nguy hiểm thường có cả 2:

```yaml
disable-model-invocation: true       # Chỉ user gọi
allowed-tools: Bash                  # Chỉ chạy bash
```

## 6. Dynamic Content trong SKILL.md

### Arguments với `$ARGUMENTS`

```markdown
---
name: fix-issue
description: Fix a GitHub issue
---

Fix GitHub issue $ARGUMENTS following our coding standards.

1. Read the issue description
2. Implement the fix
3. Write tests
4. Create a commit
```

Chạy `/fix-issue 123` → `$ARGUMENTS` = `"123"`.

### Indexed arguments với `$0`, `$1`, `$N`

```markdown
---
name: migrate-component
description: Migrate component from one framework to another
---

Migrate component $0 from $1 to $2.

Steps:
1. Read $0
2. Convert $1 syntax to $2
3. Update tests
```

Chạy `/migrate-component SearchBar React Vue` → `$0`=`SearchBar`, `$1`=`React`, `$2`=`Vue`.

### Shell commands với `!`

```markdown
---
name: pr-summary
description: Summarize changes in a pull request
allowed-tools: Bash(git *)
---

## Context

- Current branch: !`git branch --show-current`
- Changes: !`git diff --stat HEAD`
- Recent commits: !`git log --oneline -10`

## Your task

Summarize the above changes into a PR description.
```

> Commands execute **trước** khi skill content gửi tới Claude. Claude chỉ thấy **output cuối cùng**, không thấy bash command.

### Subagent execution với `context: fork`

```markdown
---
name: deep-research
description: Research a topic thoroughly across the codebase
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:

1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

`context: fork` chạy skill trong **isolated subagent context** — skill content trở thành task cho subagent có context window riêng, **không làm rối main conversation**.

## 7. Bundled Skills (đi kèm Claude Code)

Claude Code ship sẵn 5 bundled skills, dùng như slash command:

| Skill | Mục đích |
|-------|----------|
| `/batch <instruction>` | Điều phối thay đổi parallel quy mô lớn dùng worktrees |
| `/claude-api` | Load Claude API reference cho ngôn ngữ project |
| `/debug [description]` | Bật debug logging |
| `/loop [interval] <prompt>` | Chạy prompt lặp theo interval |
| `/simplify [focus]` | Review files đã thay đổi cho code quality |

Không cần install/config gì — sẵn sàng trong mọi session.

## 8. Cài đặt

### Personal Skills (mọi project)

```bash
mkdir -p ~/.claude/skills
cp -r my-skill ~/.claude/skills/
chmod +x ~/.claude/skills/my-skill/scripts/*.py
```

### Project Skills (cho project hiện tại, share qua git)

```bash
mkdir -p .claude/skills
cp -r my-skill .claude/skills/
chmod +x .claude/skills/my-skill/scripts/*.py
```

### Verify cài đặt

```bash
# Kiểm tra structure
ls -la ~/.claude/skills/my-skill/

# Trong Claude Code
/skills          # Liệt kê skills available
```

### Update skill

Edit file `SKILL.md` trực tiếp. Thay đổi có hiệu lực **lần restart Claude Code tiếp theo**.

## 9. Skill Lifecycle - Cách Skills hoạt động

```
Session start
  ↓
Claude scan: ~/.claude/skills/, .claude/skills/, plugin skills, bundled
  ↓
Load Level 1 metadata (name + description) của TẤT CẢ skills
  ↓
User gửi message
  ↓
Claude check description nào match
  ↓
Match → bash đọc SKILL.md (Level 2) vào context
  ↓
SKILL.md reference file phụ?
  ↓ (yes)
Claude đọc file đó (Level 3, on-demand)
  ↓
SKILL.md có script execute?
  ↓ (yes)
Claude chạy script → chỉ output vào context, không phải code
  ↓
Claude execute task theo instructions
  ↓
Trả kết quả cho user
```

**Key insight:** Có dozens skills không tốn context — chỉ Level 1 luôn loaded (~100 tokens/skill). Level 2-3 load on-demand khi thực sự dùng.

## 10. Best Practices

### ✅ Nên làm

- **Description rõ + có trigger conditions:** "Use when [scenario]"
- **Keep SKILL.md dưới 500 dòng** — chia nhỏ ra `references/`
- **Một skill = một concern** — không nhồi nhiều task vào 1 skill
- **`disable-model-invocation: true`** cho mọi skill có side effects
- **`allowed-tools` strict** — không để mặc định inherit nếu skill có thể nguy hiểm
- **Test trên model thật** — skill hoạt động khác nhau giữa Sonnet/Opus/Haiku
- **Naming convention:** lowercase, hyphen, gerund form khi phù hợp
- **Versioning:** dùng git để track changes của skill folder

### ❌ Không nên

- Tên file khác `SKILL.md` (case-sensitive!)
- `README.md` trong skill folder (bị conflict)
- Hardcode credentials trong SKILL.md
- Description vague kiểu "helps with code"
- Một skill làm 5 việc khác nhau
- Skill quá dài (>500 dòng) — chia nhỏ ra
- Quên `chmod +x` cho scripts

## 11. Workflow ứng dụng cho Blog Project

Cho project blog cá nhân (Next.js + MDX), bạn có thể tạo các skills:

### Skill 1: `blog-post-writer/`

```
blog-post-writer/
├── SKILL.md
├── templates/
│   ├── frontmatter-template.md
│   └── post-skeleton.mdx
└── references/
    ├── style-guide.md
    └── seo-checklist.md
```

**`SKILL.md`:**

```markdown
---
name: blog-post-writer
description: Generate a complete blog post with proper frontmatter, structured sections, and SEO optimization. Use when user asks to write, draft, or create a new blog post.
allowed-tools: Read, Write, Bash(ls *)
---

# Blog Post Writer

## When to Use
- User says: "viết bài về X", "draft a post on Y", "tạo blog post"
- User provides a topic, outline, or research notes

## Steps

1. **Understand the topic** — đọc thông tin user provide, hỏi nếu thiếu
2. **Generate frontmatter** dùng template `templates/frontmatter-template.md`:
   - `title`: ≤60 chars, có keyword chính
   - `slug`: kebab-case, không tiếng Việt có dấu
   - `date`: ISO 8601 (today)
   - `tags`: ≤5 tags lowercase
3. **Build outline** theo structure `templates/post-skeleton.mdx`:
   - Intro (hook + thesis)
   - 3-5 H2 sections với content
   - Code examples (nếu technical)
   - Conclusion với CTA
4. **Write draft** trong file `blog/<date>-<slug>.md`
5. **SEO check** dùng `references/seo-checklist.md`

## Output Format

File `.md` đầy đủ tại `blog/<date>-<slug>.md` + summary các SEO improvements suggested.
```

### Skill 2: `seo-optimizer/`

```markdown
---
name: seo-optimizer
description: Analyze an existing blog post for SEO improvements. Check title length, meta description, heading hierarchy, keyword density, internal/external links, and image alt texts. Use when user asks to "check SEO", "optimize for SEO", or "improve search ranking" of a post.
allowed-tools: Read, Grep
---

# SEO Optimizer

## When to Use
- User: "check SEO bài này", "tối ưu SEO cho post X"
- After writing a draft, before publishing

## Steps

1. Read post file (path từ user hoặc $ARGUMENTS)
2. Extract frontmatter và analyze:
   - **Title**: 50-60 chars? Có keyword chính?
   - **Description**: 150-160 chars?
   - **Slug**: kebab-case? SEO-friendly?
3. Analyze content:
   - **H1/H2/H3 hierarchy**: chỉ 1 H1, H2 → H3 không skip
   - **Keyword density**: keyword chính xuất hiện 1-3% (không stuffing)
   - **Internal links**: ít nhất 1-2 link tới posts khác
   - **External links**: link tới authoritative source
   - **Image alt texts**: mỗi `<img>` và `![]()` có alt
4. Output báo cáo với:
   - Specific issues + line numbers
   - Recommended fixes
   - Priority (high/medium/low)
```

### Skill 3: `image-optimizer/` (read-only, model-invocable)

```markdown
---
name: image-optimizer
description: Analyze blog images and recommend optimization (format conversion to WebP/AVIF, resize, compression, alt text suggestions). Use when user adds new images or asks to optimize images for blog.
allowed-tools: Read, Bash(file *), Bash(identify *), Bash(du *)
---

# Image Optimizer

## When to Use
- User: "tối ưu ảnh", "compress image", "convert to WebP"
- New image added to /public/images/

## Steps

1. Get image info: `file`, `identify` (ImageMagick), `du -h`
2. Recommendations:
   - **Format**: PNG/JPG → WebP/AVIF (80% smaller)
   - **Dimensions**: nếu >2000px width, resize cho responsive
   - **Compression**: cwebp -q 85 hoặc sharp library
   - **Loading**: srcset suggestions cho responsive
3. Generate alt text dựa trên context bài viết
4. Output commands cụ thể để chạy
```

### Skill 4: `publish-checklist/` (user-only, side effects)

```markdown
---
name: publish-checklist
description: Run pre-publish checklist for blog post: lint, build, SEO check, broken links, preview deploy. ONLY run when user explicitly says "publish", "deploy post", or "ready to ship".
disable-model-invocation: true
allowed-tools: Bash(npm *), Bash(git *), Read
---

# Publish Checklist

## When to Use
**Only when user explicitly says publish/deploy.** Never auto-trigger.

## Steps

1. ✅ `npm run lint` — fix tất cả lint errors
2. ✅ `npm run build` — đảm bảo production build pass
3. ✅ Check broken links trong post mới
4. ✅ SEO score ≥80 (chạy `seo-optimizer` skill)
5. ✅ Image optimization done (chạy `image-optimizer` skill)
6. ✅ `git status` — confirm chỉ files mong muốn changed
7. ⚠️ Confirm với user trước khi `git commit` + `git push`
8. ✅ After push, monitor Vercel preview deploy
9. ✅ Test preview URL manually
10. ✅ Merge to main → production deploy
```

## 12. Câu hỏi thường gặp (FAQ)

### Q1: Sự khác biệt giữa Skill và Slash Command?

Cả hai đều tạo `/command-name`. Khác biệt:

| Khía cạnh | Skill | Custom Command (legacy) |
|-----------|-------|------------------------|
| File | `SKILL.md` (trong thư mục) | `.md` file đơn lẻ |
| Vị trí | `.claude/skills/<name>/SKILL.md` | `.claude/commands/<name>.md` |
| Auto-invoke | ✅ Claude tự gọi khi context match | ❌ Chỉ user gõ |
| Bundle resources | ✅ Scripts, templates, references | ❌ Một file thôi |
| Subagent execution | ✅ `context: fork` | ❌ |
| Trạng thái | Cách mới, recommended | Legacy, vẫn work |

Khi cùng tên: **skill thắng**. Khuyến nghị dùng skills cho mọi development mới.

### Q2: Khi nào nên tạo Skill thay vì Slash Command?

Tạo Skill khi:

- Muốn Claude **tự động** dùng (auto-invoke khi context match)
- Cần bundle scripts/templates/references đi kèm
- Skill có **subtask** muốn chạy trong subagent (`context: fork`)
- Cross-platform (muốn dùng cả ở claude.ai, Claude Code, Claude API)

Tạo Slash Command (legacy) khi:

- Quick prompt template đơn giản, một lần dùng
- User-only invocation luôn (gõ `/cmd` mới chạy)

### Q3: Skill có thể đọc/ghi file không?

Có, nếu có quyền trong `allowed-tools`:

- `Read` — đọc file
- `Write` — ghi file mới
- `Edit` — chỉnh sửa file có sẵn
- `Bash(rm *)` — xóa (cẩn thận!)

Skill không có `allowed-tools` sẽ **inherit** từ parent context. Để strict, luôn explicit:

```yaml
allowed-tools: Read, Grep, Glob   # read-only
```

### Q4: Tại sao description quan trọng đến vậy?

Vì Claude **chỉ thấy description** (Level 1 metadata) khi quyết định có load skill hay không. SKILL.md body (Level 2) chưa load lúc đó.

→ Description **là** quảng cáo của skill cho Claude. Vague description → Claude không biết khi nào dùng → skill chết.

**Test:** Đọc description, bạn (con người) có biết khi nào dùng skill không? Nếu không → Claude cũng không biết.

### Q5: `disable-model-invocation` vs `user-invocable: false` khác nhau gì?

- `disable-model-invocation: true` → **chỉ user** gọi được. Claude không tự gọi. Dùng cho skill có **side effects** (deploy, commit, push)
- `user-invocable: false` → **chỉ Claude** gọi được. Ẩn khỏi menu `/`. Dùng cho **background knowledge** (system context, glossary, conventions)

Hai field độc lập, có thể combine — nhưng combine cả 2 là vô nghĩa (không ai gọi được).

### Q6: Bundled files có vào context không?

**Không** mặc định. Chỉ load khi Claude **chủ động đọc**:

- Templates → load khi SKILL.md reference (`[template](templates/x.md)`)
- References → load khi cần chi tiết
- Scripts → **chạy** chứ không đọc code (chỉ output vào context)

Đây là Progressive Disclosure: skill có thể có dozens reference files mà không tốn context.

### Q7: Tại sao nên dùng script thay vì để Claude tự code?

4 lý do:

1. **Deterministic** — script chạy giống nhau mỗi lần, LLM thì variable
2. **Context-efficient** — script code không vào context, chỉ output
3. **Faster** — sort 10k items bằng script vs token generation, script thắng
4. **Reliable** — validation logic phải đúng 100%, không "hơn 90%"

Ví dụ: skill PDF có script `extract_form_fields.py` → script đọc PDF, return fields. Claude chỉ thấy output `["name", "email", "date"]`, không thấy code parsing.

### Q8: Skill chạy trong container/sandbox không?

Tuỳ platform:

- **claude.ai:** chạy trong code execution container, có network, install package được
- **Claude API:** chạy container không network, không runtime install (phải declare deps trong SKILL.md)
- **Claude Code:** chạy **trên máy bạn**, full filesystem access (cẩn thận skill từ source lạ!)

→ Trên Claude Code, skill có quyền như chính bạn. **Đọc SKILL.md trước khi cài** từ third-party.

### Q9: Có bao nhiêu skills là "quá nhiều"?

Mỗi skill ăn ~100 tokens metadata khi start. Với context window lớn (~200k của Sonnet 4.6):

- 10 skills → ~1k tokens (negligible)
- 100 skills → ~10k tokens (vẫn OK)
- 500+ skills → cảm thấy chậm khi start session

**Sweet spot:** 20-50 skills active. Skills không dùng → chuyển từ `~/.claude/skills/` sang folder backup. Hoặc dùng plugin system để on-demand install.

### Q10: Tôi sửa SKILL.md xong, sao Claude không apply?

Skills load **khi start session**. Sửa xong:

1. Save file
2. Restart Claude Code (hoặc `/reload-plugins` cho plugin skills)
3. Test lại

Một số version có hot-reload nhưng safer là restart.

### Q11: Pre-built skills của Anthropic có gì?

Anthropic có repo `anthropics/skills` với nhiều skills mẫu. Notable:

**Document skills (production-grade):**

- `docx` — Create/edit Word docs với tracked changes, comments
- `pdf` — Extract text/tables, fill forms, merge PDFs
- `pptx` — Read/generate slides, layouts
- `xlsx` — Spreadsheet manipulation, formulas, charts

**Cài qua plugin marketplace:**

```
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

Sau cài: "Use the PDF skill to extract form fields from path/to/file.pdf"

### Q12: Skill và Subagent khác nhau gì?

| Khía cạnh | Skill | Subagent |
|-----------|-------|----------|
| Mục đích | Capability/instruction được auto-load | AI assistant chuyên biệt được delegate task |
| Context | Cùng main context (trừ khi `context: fork`) | Luôn isolated context riêng |
| Invocation | User gõ hoặc Claude tự load | Main agent delegate |
| Resources | SKILL.md + bundled files | Prompt + tool permissions |
| Use case | "How to do X" | "Do X for me with focus" |

Skill có thể spawn subagent (`context: fork`).

## 13. Kết luận

Skills là evolution của slash commands — mạnh hơn, linh hoạt hơn, và quan trọng nhất là **scale được**. Khuyến nghị workflow:

1. **Bắt đầu nhỏ** — tạo 2-3 skills đơn giản trước (ví dụ `blog-post-writer`, `seo-optimizer`)
2. **Description đầu tư kỹ** — dành thời gian viết description rõ ràng, có trigger conditions
3. **Test thật** — trigger thử, xem Claude có load đúng không
4. **Iterate** — refine SKILL.md sau khi dùng vài lần
5. **Mở rộng dần** — khi quen, thêm scripts/templates cho skill phức tạp hơn
6. **Share via plugin** — bundle skills lên GitHub cho team hoặc community dùng

Sweet spot là 20-50 skills active phục vụ workflow hàng ngày. Quá ít thì underused; quá nhiều thì noise. Đầu tư đúng cách, Skills sẽ là "second brain" của bạn — Claude tự nhớ cách làm việc trong project mà không cần bạn nhắc lại mỗi session.

Hãy bắt đầu bằng cách chạy `/skills` để xem các skills có sẵn, rồi tạo skill đầu tiên của riêng bạn ngay hôm nay!
