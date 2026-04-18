---
slug: claude-code-subagents
title: Claude Code Subagents - Delegate task cho AI chuyên biệt
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Claude, AI, DevTools, Subagents]
date: '2026-04-25T12:00:00Z'
image: https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&auto=format&fit=crop&q=80
---

Subagents là AI assistants chuyên biệt mà Claude Code có thể delegate task tới. Mỗi subagent có context window riêng, system prompt tùy chỉnh, và tools cấu hình được — giải quyết bài toán "context exhaustion" trong session dài. Bài viết này tổng hợp đầy đủ cách config, invoke, và áp dụng subagents thực tế cho project blog cá nhân.

<!-- truncate -->

# Claude Code Subagents: Từ cơ bản đến nâng cao

## 1. Subagents là gì?

**Subagents** là **AI assistants chuyên biệt** mà Claude Code có thể **delegate task tới**. Mỗi subagent:

- Có **mục đích cụ thể** (code review, security audit, testing...)
- Dùng **context window riêng** tách khỏi conversation chính
- Có thể config với **tools cụ thể** và **system prompt tùy chỉnh**

Subagent hoạt động độc lập với "clean slate" — chỉ nhận context cần thiết cho task của nó, rồi return result cho main agent để tổng hợp.

### Key Benefits

| Benefit | Mô tả |
|---------|-------|
| **Context preservation** | Chạy trong context riêng — không pollute conversation chính |
| **Specialized expertise** | Fine-tuned cho domain cụ thể — tỷ lệ thành công cao hơn |
| **Reusability** | Dùng được across projects, share với team |
| **Flexible permissions** | Tool access khác nhau cho từng subagent |
| **Scalability** | Nhiều agent cùng làm các task song song |

### Vì sao Subagents quan trọng?

> Mỗi developer dùng Claude Code lâu sẽ gặp tường: session dài 3-4 tiếng, response vague, model quên decision đã chốt giờ trước, code drift khỏi pattern. **Context window đầy noise.** Cách thông thường là start session mới — nhưng mất hết context.
>
> Subagents là kiến trúc giải quyết vấn đề này: delegate task chuyên biệt sang isolated worker, kết quả flow ngược lại main agent.

**Quick Start:** Dùng lệnh `/agents` để tạo, view, edit, manage subagent một cách tương tác.

## 2. File Locations & Priority

Subagents files lưu ở nhiều location với scope khác nhau:

| Priority | Loại | Vị trí | Scope |
|----------|------|--------|-------|
| **1 (cao nhất)** | CLI-defined | Qua flag `--agents` (JSON) | Chỉ trong session |
| **2** | Project subagents | `.claude/agents/` | Project hiện tại |
| **3** | User subagents | `~/.claude/agents/` | Mọi project |
| **4 (thấp nhất)** | Plugin agents | Plugin `agents/` directory | Qua plugins |

Khi cùng tên, **priority cao hơn thắng**.

## 3. Configuration - Frontmatter đầy đủ

### File Format

Subagent là file Markdown với YAML frontmatter + system prompt:

```markdown
---
name: your-sub-agent-name
description: Description of when this subagent should be invoked
tools: tool1, tool2, tool3                    # Optional - inherits all tools nếu omit
disallowedTools: tool4                        # Optional - tools cấm dùng
model: sonnet                                  # Optional - sonnet, opus, haiku
permissionMode: default                        # Optional - permission mode
maxTurns: 20                                   # Optional - giới hạn agentic turns
skills: skill1, skill2                         # Optional - skills preload vào context
mcpServers: server1                            # Optional - MCP servers available
memory: user                                   # Optional - persistent memory
background: false                              # Optional - chạy background
effort: high                                   # Optional - reasoning effort
isolation: worktree                            # Optional - git worktree isolation
initialPrompt: "Start by analyzing..."         # Optional - first turn auto-submitted
---

Your subagent's system prompt goes here. This can be multiple paragraphs
and should clearly define the subagent's role, capabilities, and approach
to solving problems.
```

### Configuration Fields - Reference đầy đủ

| Field | Required | Mô tả |
|-------|----------|-------|
| `name` | ✅ | Unique ID (lowercase + hyphen) |
| `description` | ✅ | Mô tả purpose. Include "use PROACTIVELY" để khuyến khích auto-invoke |
| `tools` | ❌ | Comma-separated tools. Omit → inherit tất cả |
| `disallowedTools` | ❌ | Tools subagent **không được** dùng |
| `model` | ❌ | `sonnet`, `opus`, `haiku`, full model ID, hoặc `inherit` |
| `permissionMode` | ❌ | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | ❌ | Giới hạn số agentic turns |
| `skills` | ❌ | Skills preload — inject full skill content vào context khi start |
| `mcpServers` | ❌ | MCP servers available cho subagent |
| `hooks` | ❌ | Component-scoped hooks (PreToolUse, PostToolUse, Stop) |
| `memory` | ❌ | Persistent memory scope: `user`, `project`, `local` |
| `background` | ❌ | `true` để chạy luôn ở background |
| `effort` | ❌ | `low`, `medium`, `high`, `max` |
| `isolation` | ❌ | `worktree` để có git worktree riêng |

### Tool Configuration - 3 cách

**Cách 1: Inherit tất cả tools (omit field)**

```yaml
---
name: full-access-agent
description: Agent with all available tools
---
```

**Cách 2: Specify tools cụ thể**

```yaml
---
name: limited-agent
description: Agent with specific tools only
tools: Read, Grep, Glob, Bash
---
```

**Cách 3: Conditional tool access (whitelist pattern)**

```yaml
---
name: conditional-agent
description: Agent with filtered tool access
tools: Read, Bash(npm:*), Bash(test:*)
---
```

### CLI-Based Configuration

Định nghĩa subagent cho **một session** dùng `--agents` flag với JSON:

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

CLI definitions ưu tiên cao nhất — override mọi nguồn khác trong session đó.

## 4. Built-in Subagents

Claude Code có sẵn **6 built-in subagents** luôn available:

| Agent | Model | Mục đích |
|-------|-------|----------|
| **general-purpose** | Inherits | Complex multi-step tasks |
| **Plan** | Inherits | Research cho plan mode |
| **Explore** | Haiku | Read-only codebase exploration |
| **Bash** | Inherits | Terminal commands trong context riêng |
| **statusline-setup** | Sonnet | Cấu hình status line |
| **Claude Code Guide** | Haiku | Trả lời câu hỏi về Claude Code features |

### Explore Subagent (read-only)

3 thoroughness levels:

- **`"quick"`** — fast searches, tìm pattern cụ thể
- **`"medium"`** — moderate exploration, default
- **`"very thorough"`** — comprehensive analysis, có thể chậm

## 5. Quản lý Subagents

### `/agents` Command (recommended)

```
/agents
```

Interactive menu để:

- View tất cả subagents (built-in, user, project)
- Tạo subagent mới với guided setup
- Edit/delete custom subagents và tool access
- Xem subagent nào active khi có duplicate

### Direct File Management

```bash
# Project subagent
mkdir -p .claude/agents
cat > .claude/agents/test-runner.md << 'EOF'
---
name: test-runner
description: Use proactively to run tests and fix failures
---

You are a test automation expert. When you see code changes, proactively
run the appropriate tests. If tests fail, analyze the failures and fix
them while preserving the original test intent.
EOF

# User subagent (mọi project)
mkdir -p ~/.claude/agents
```

## 6. Sử dụng Subagents - 4 cách invoke

### a) Automatic Delegation

Claude tự delegate dựa trên:

- Mô tả task trong request
- Field `description` của subagent
- Context và tools available

Encourage proactive use bằng cách thêm `"use PROACTIVELY"` hoặc `"MUST BE USED"` vào description:

```yaml
---
name: code-reviewer
description: Expert code review specialist. Use PROACTIVELY after writing or modifying code.
---
```

### b) Explicit Invocation (request bằng tên)

```
> Use the test-runner subagent to fix failing tests
> Have the code-reviewer subagent look at my recent changes
> Ask the debugger subagent to investigate this error
```

### c) @-Mention Invocation

Dùng prefix `@` để **bypass auto-delegation heuristics** và đảm bảo subagent cụ thể được gọi:

```
> @"code-reviewer (agent)" review the auth module
```

### d) Session-Wide Agent

Chạy cả session với 1 agent làm main agent:

```bash
# Via CLI flag
claude --agent code-reviewer
```

## 7. Persistent Memory cho Subagents

Field `memory` cho subagent **persistent directory** survive across conversations.

### Memory Scopes

| Scope | Directory | Use Case |
|-------|-----------|----------|
| `user` | `~/.claude/agent-memory/<name>/` | Personal notes mọi project |
| `project` | `.claude/agent-memory/<name>/` | Project-specific knowledge share team |
| `local` | `.claude/agent-memory-local/<name>/` | Local knowledge, không commit git |

### Cách hoạt động

- 200 dòng đầu của `MEMORY.md` trong memory dir auto load vào subagent's system prompt
- Tools `Read`, `Write`, `Edit` auto enabled để subagent quản lý memory
- Subagent có thể tạo additional files trong memory dir

### Example

```yaml
---
name: researcher
memory: user
---

You are a research assistant. Use your memory directory to store findings,
track progress across sessions, and build up knowledge over time.

Check your MEMORY.md file at the start of each session to recall previous context.
```

## 8. Background Subagents

Subagents có thể chạy background, free up main conversation cho task khác.

```yaml
---
name: long-runner
background: true
description: Performs long-running analysis tasks in the background
---
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Background subagent task đang chạy |
| `Ctrl+F` | Kill all background agents (bấm 2 lần để confirm) |

> **Lưu ý security:** Background subagents auto-deny mọi permission chưa được pre-approved.

## 9. Worktree Isolation

Setting `isolation: worktree` cho subagent **git worktree riêng** — thay đổi không ảnh hưởng main working tree.

```yaml
---
name: feature-builder
isolation: worktree
description: Implements features in an isolated git worktree
tools: Read, Write, Edit, Bash, Grep, Glob
---
```

### Cách hoạt động

```
Main Working Tree
    ↓ spawns
Subagent với Isolated Worktree
    ↓ thay đổi trong
Separate Git Worktree + Branch
    ↓
Không thay đổi → Auto-cleaned
Có thay đổi    → Returns worktree path + branch
```

## 10. Architecture & Lifecycle

### High-Level Architecture

```
        User
          ↓ asks
    Main Agent (Coordinator)
       ↓   ↓   ↓
Code     Test    Documentation
Reviewer Engineer Subagent
   ↓        ↓        ↓
   returns results to Main
          ↓ synthesizes
        User
```

### Context Management

```
Main Agent Context (50,000 tokens)
       ↓ Clean slate (no main convo history)
Subagent 1 (20k) | Subagent 2 (20k) | Subagent 3 (20k)
       ↓ Results only
Main Agent (synthesis)
```

**Key points:**

- Mỗi subagent **fresh context window**, không có main conversation history
- Chỉ pass **relevant context** cho subagent
- Results **distilled** về main agent
- Ngăn **context token exhaustion** trên project dài

### Key Behaviors

- **No nested spawning** — subagent không spawn được subagent khác (trừ khi có `Agent(name)` config)
- **Background permissions** — background subagents auto-deny permission chưa pre-approved
- **Backgrounding** — `Ctrl+B` để background task
- **Transcripts** — lưu tại `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl`

## 11. Khi nào dùng Subagents?

| Scenario | Dùng Subagent? | Lý do |
|----------|----------------|-------|
| Complex feature nhiều bước | ✅ Có | Tách concerns, ngăn pollution |
| Quick code review | ❌ Không | Overhead không cần thiết |
| Parallel task execution | ✅ Có | Mỗi subagent context riêng |
| Cần specialized expertise | ✅ Có | Custom system prompts |
| Long-running analysis | ✅ Có | Ngăn main context exhaust |
| Single task | ❌ Không | Latency không cần |

## 12. Best Practices

### ✅ Nên (Do's)

- **Start với Claude-generated agents** — generate ban đầu rồi iterate customize
- **Focused subagents** — single, clear responsibility
- **Detailed prompts** — instructions cụ thể, examples, constraints
- **Limit tool access** — chỉ tools cần thiết
- **Version control** — commit project subagents để team dùng chung

### ❌ Không nên (Don'ts)

- Tạo subagents trùng role
- Cấp tools không cần thiết
- Dùng subagent cho task đơn giản 1 bước
- Trộn concerns trong 1 subagent
- Quên pass necessary context

### System Prompt Best Practices

**1. Specific về Role:**

```
You are an expert code reviewer specializing in [specific areas]
```

**2. Define Priorities rõ:**

```
Review priorities (in order):
1. Security Issues
2. Performance Problems
3. Code Quality
```

**3. Specify Output Format:**

```
For each issue provide: Severity, Category, Location, Description, Fix, Impact
```

**4. Include Action Steps:**

```
When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately
```

### Tool Access Strategy

1. **Start Restrictive** — bắt đầu với tools tối thiểu
2. **Expand Only When Needed** — thêm khi requirements đòi
3. **Read-Only When Possible** — Read/Grep cho analysis agents
4. **Sandboxed Execution** — Bash commands giới hạn pattern cụ thể

## 13. Workflow ứng dụng cho Blog Project

Cho project blog cá nhân, đây là 4 subagents hữu ích:

### 1. `blog-editor.md` - Edit & polish bài viết

```markdown
---
name: blog-editor
description: Expert blog editor for technical posts. Use PROACTIVELY after drafting a new blog post or when user asks to "edit", "review", or "polish" a draft. Focus on clarity, flow, technical accuracy, and engaging hooks.
tools: Read, Edit, Grep
model: sonnet
effort: medium
---

You are an experienced technical blog editor for a personal blog covering
backend development, data infrastructure (Kafka, BigQuery), and Next.js.

## Your Role
Review and polish blog post drafts in `blog/*.md`.

## Review Priorities (in order)
1. **Hook strength** — câu mở đầu có grab attention không?
2. **Technical accuracy** — code snippets có chạy được không? Diagrams chính xác?
3. **Flow** — sections có chuyển tiếp tự nhiên?
4. **Clarity** — câu dài >30 từ split ra; jargon giải thích nếu lần đầu xuất hiện
5. **Voice consistency** — friendly, có ví dụ thực tế

## Output Format
For each issue:
- **Severity:** 🔴 Critical / 🟡 Medium / 🟢 Suggestion
- **Location:** line N
- **Issue:** what's wrong
- **Suggested fix:** before → after
- **Why:** brief reasoning

End với overall verdict: Ready to publish / Needs revision / Major rewrite needed
```

### 2. `seo-auditor.md` - Read-only SEO audit

```markdown
---
name: seo-auditor
description: SEO specialist for blog posts. MUST BE USED before publishing any new post. Audits frontmatter, headings, keyword density, internal/external links, image alt texts, and slug structure.
tools: Read, Grep, Glob
model: haiku
effort: low
---

You are an SEO specialist for personal tech blogs.

## Audit Checklist

### Frontmatter
- [ ] Title 50-60 chars
- [ ] Description 150-160 chars
- [ ] Slug kebab-case, no Vietnamese diacritics
- [ ] Date in ISO 8601 format
- [ ] Tags ≤5, lowercase

### Content Structure
- [ ] Exactly 1 H1 (from frontmatter title)
- [ ] H2 → H3 hierarchy không skip
- [ ] First H2 trong vòng 100 từ đầu
- [ ] Meta keyword chính xuất hiện trong title, H1, first paragraph

### Links
- [ ] Ít nhất 2 internal links tới posts cùng topic
- [ ] External links → authoritative sources
- [ ] No broken links

### Images
- [ ] Mỗi image có alt text ≤125 chars
- [ ] Hero image specified trong `coverImage` frontmatter

## Output Format
SEO Score: X/100

🔴 Critical (block publish):
- [list with line numbers]

🟡 Recommended:
- [list]

🟢 Good:
- [what's already done well]
```

### 3. `code-snippet-tester.md` - Verify code trong post

```markdown
---
name: code-snippet-tester
description: Verifies all code snippets in blog posts compile/run correctly. Use after major edits to a technical post or before publishing.
tools: Read, Write, Bash, Edit
model: sonnet
isolation: worktree
---

You are a code quality engineer verifying blog post code samples.

## Workflow
1. Read post file passed via context
2. Extract all code blocks with language tags
3. For each snippet:
   - Create temp file in worktree
   - Run language-specific check:
     - TypeScript → `tsc --noEmit`
     - JavaScript → `node --check`
     - Python → ast.parse
     - Bash → `bash -n`
4. Report results

## Output Format
Code Snippet Audit: X/Y passed

✅ Snippet 1 (TypeScript, line 45): OK
❌ Snippet 2 (Python, line 78): SyntaxError on line 3
   → Suggested fix: missing `:` after `def my_func()`
✅ Snippet 3 (Bash, line 102): OK

Note: I'm using isolation: worktree — safe to test, won't affect main repo.
```

### 4. `research-assistant.md` - Persistent memory cho research

```markdown
---
name: research-assistant
description: Long-term research assistant for blog topics. Maintains persistent notes across sessions. Use when researching new topic for upcoming post.
tools: Read, Write, Edit, Grep, Glob, WebFetch, WebSearch
memory: project
model: sonnet
effort: high
---

You are a research assistant for technical blog posts.

## Memory Strategy
- Check `MEMORY.md` first to load previous research notes
- Update `MEMORY.md` with new findings, sources, key insights
- Create topic-specific files: `kafka-consumer-groups.md`, `nextjs-server-actions.md`

## When Invoked
1. **First time on topic:** create `<topic>.md` in memory dir, gather authoritative sources
2. **Continuing research:** load existing notes, fill gaps, verify outdated info
3. **Pre-write check:** synthesize all notes into outline ready for post drafting

## Sources Priority
1. Official docs (Apache Kafka, Next.js, etc.)
2. Engineering blogs (Confluent, Vercel, Cloudflare, etc.)
3. Peer-reviewed papers
4. Stack Overflow only for specific edge cases

Avoid: Medium articles unless authored by recognized experts, AI-generated content farms
```

## 14. Câu hỏi thường gặp (FAQ)

### Q1: Subagent vs Skill khác nhau gì?

| Khía cạnh | Subagent | Skill |
|-----------|----------|-------|
| **Mục đích** | AI assistant chuyên biệt được delegate task | Capability/instruction tự load khi context match |
| **Context** | Context window riêng (isolated) | Cùng main context (trừ `context: fork`) |
| **Invocation** | Main agent delegate hoặc user @-mention | Auto-invoke hoặc `/skill-name` |
| **System prompt** | Có (system prompt riêng) | Không (chỉ instructions) |
| **Tools** | Configurable, riêng cho subagent | Configurable qua allowed-tools |
| **Use case** | Long-running specialized work | Quick repeatable task |

→ Subagent là "thuê chuyên gia làm task riêng". Skill là "công cụ tự động lấy ra dùng".

### Q2: Subagent có spawn được subagent khác không?

**Mặc định KHÔNG.** Subagent không spawn nested subagent.

**Cách workaround:**

1. Dùng `tools: Agent(worker, researcher)` để allowlist subagent spawn được
2. Coordinator pattern: 1 subagent chỉ làm coordination, delegate cho nhóm worker

### Q3: Khi nào dùng @-mention thay vì auto-delegation?

- **@-mention** khi muốn **chắc chắn** subagent cụ thể được gọi (bypass heuristics)
- **Auto-delegation** khi để Claude tự chọn (description đủ rõ thì auto-delegation OK)

Best practice: Dùng `"use PROACTIVELY"` trong description để encourage auto-delegation cho subagents thường dùng. Reserve @-mention cho edge cases.

### Q4: Subagent có thấy CLAUDE.md không?

**Không** mặc định. Subagent chỉ nhận:

- System prompt (body của file `.md`)
- Working directory hiện tại
- Tools được cấp

CLAUDE.md (memory) thuộc main context, **không pass xuống** subagent.

**Workaround để subagent có context project:**

- Field `memory: project` → subagent đọc `.claude/agent-memory/<name>/MEMORY.md` (file riêng cho subagent)
- Hoặc trong system prompt yêu cầu: "Start by reading CLAUDE.md để hiểu project conventions"
- Hoặc field `skills:` preload skill có project info

### Q5: Subagent có thấy main conversation history không?

**Không**. Đó là điểm hay — clean slate, ngăn context pollution.

Subagent chỉ thấy task description user pass cho nó. Nếu cần context, main agent phải explicitly pass.

### Q6: Background subagent có rủi ro gì?

Có:

- **Permission auto-deny:** background subagents không hỏi user, auto-deny mọi permission chưa pre-approved → có thể "đứng" giữa task
- **Khó debug:** running background, không thấy output realtime
- **Resource consumption:** mỗi background = thêm session running

**Best practice:** Chỉ dùng `background: true` cho subagent **đã được test kỹ**, có scope rõ, không cần user approval mid-task.

### Q7: Subagent dùng model gì? Cost ra sao?

- Default: subagent dùng model main agent đang chạy
- Override: field `model: sonnet|opus|haiku` hoặc full model ID
- **Best practice cost-optimized:**
  - Main session: Opus (coordination + judgment)
  - Implementation subagents: Sonnet (default cho coding)
  - Explore/search subagents: Haiku (fast, cheap)

Cost: subagent dùng token riêng (input + output). Long-running session với nhiều subagents có thể cost gấp 2-3 lần single session.

### Q8: Subagent transcript lưu ở đâu?

Subagent transcripts lưu tại:

```
~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl
```

Có thể đọc bằng:

```bash
cat ~/.claude/projects/myproject/abc123/subagents/agent-xyz789.jsonl | jq
```

JSONL format — inspect được conversation, tool calls, errors. Hữu ích để debug hành vi subagent.

### Q9: Plugin subagent bị hạn chế gì?

Subagent từ plugin **không được dùng:**

- `hooks`
- `mcpServers`
- `permissionMode`

Lý do: ngăn plugin escalate privileges qua subagent hooks → security.

### Q10: Có thể chia sẻ subagent giữa nhiều dev trong team không?

Có:

1. **Project-level** (`.claude/agents/*.md`) — commit vào git, mọi dev clone là có
2. **Plugin** — bundle subagents + skills + hooks → install 1 lệnh
3. **Symlink** từ central repo: `ln -s /shared/agents/code-reviewer.md .claude/agents/code-reviewer.md`

### Q11: Subagent có giới hạn `maxTurns` mặc định không?

Mặc định không có giới hạn — subagent chạy đến khi xong hoặc context full.

**Khi nào set `maxTurns`:**

- Subagent có rủi ro infinite loop (recursive logic, polling pattern)
- Cost-conscious workflow → cap để kiểm soát budget
- Testing subagent mới → set thấp (5-10) để dễ debug

### Q12: Field `effort` ảnh hưởng gì?

`effort` điều chỉnh reasoning depth của subagent:

- `low` — fast, ít reasoning, phù hợp tasks đơn giản
- `medium` — balanced (default)
- `high` — deep reasoning, phù hợp complex analysis (security review, architecture)
- `max` — maximum reasoning, **chỉ dùng được với Opus 4.6+**

Trade-off: cao hơn → chính xác hơn nhưng chậm và tốn token.

### Q13: Tôi sửa subagent file xong, sao không apply?

Subagents loaded **khi session start**. Sau khi sửa:

1. Save file
2. Restart Claude Code, hoặc dùng `/agents` để reload immediately
3. Verify với `claude agents` (hoặc `/agents` interactive)

### Q14: Subagent có dùng được MCP servers không?

Có, nhưng cần explicit:

```yaml
---
name: github-aware-agent
mcpServers: github          # Comma-separated nếu nhiều
---
```

Nếu không list → subagent không thấy MCP tools (đảm bảo isolated).

> **Lưu ý:** Plugin subagents **không được** field `mcpServers` (security restriction).

### Q15: Subagent suy nghĩ quá lâu, làm sao kill?

- `Ctrl+B` — background nó (không kill, chỉ hide)
- `Ctrl+F` (2 lần) — kill all background agents
- Set `maxTurns` từ đầu để cap behavior
- Hoặc Ctrl+C trong main session (kill cả main + subagent)

## 15. Kết luận

Subagents là kiến trúc giải quyết bài toán "context exhaustion" trong session dài — thay vì để main context bị pollute với details của mọi subtask, ta delegate cho specialist agents có context riêng và return distilled results.

Khuyến nghị workflow:

1. **Bắt đầu với built-in agents** — dùng Explore, Plan trước khi tạo custom
2. **Tạo specialist agents khi gặp pattern lặp** — code-reviewer, test-engineer, debugger
3. **Description đầu tư kỹ** — dùng "use PROACTIVELY" cho agents muốn auto-trigger
4. **Tool access strict** — read-only cho analysis agents, sandboxed bash cho execution
5. **Memory cho long-running research** — `memory: project` để build kiến thức qua nhiều session
6. **Worktree isolation cho experiments** — `isolation: worktree` để test thay đổi an toàn
7. **Test kỹ trước khi share** — commit project agents vào git khi đã stable

Kết hợp Subagents với Skills (module trước) cho ra workflow mạnh: Skills cung cấp reusable instructions, Subagents cung cấp isolated execution. Hai cơ chế bổ sung cho nhau, giúp Claude Code scale từ "1 con AI làm tất cả" sang "team AI chuyên môn hóa".

Hãy bắt đầu bằng cách chạy `/agents` để xem các built-in agents có sẵn, rồi tạo subagent đầu tiên (gợi ý: `code-reviewer` hoặc `test-engineer` — hai agents thường dùng nhất trong dev workflow)!
