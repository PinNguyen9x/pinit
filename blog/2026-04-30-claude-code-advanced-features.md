---
slug: claude-code-advanced-features
title: Claude Code Advanced Features - Planning, thinking, automation
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Claude, AI, DevTools, Advanced]
date: '2026-04-30T12:00:00Z'
image: https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&auto=format&fit=crop&q=80
---

Module cuối cùng trong series Claude Code tổng hợp 22 advanced capabilities mở rộng core Claude Code: Planning Mode, Extended Thinking, Auto Mode, Background Tasks, Scheduled Tasks, Permission Modes, Headless Mode cho CI/CD, Voice Dictation, Chrome Integration, Remote Control, và nhiều hơn nữa. Đây là post khép lại 9-module series về toàn bộ ecosystem Claude Code.

<!-- truncate -->

# Claude Code Advanced Features: Toàn cảnh các capabilities

## Tổng quan - 22 Advanced Features

| # | Feature | Mô tả nhanh |
|---|---------|-------------|
| 1 | **Planning Mode** | Lập plan chi tiết trước khi code |
| 2 | **Extended Thinking** | Deep reasoning với effort levels |
| 3 | **Auto Mode** | Background safety classifier (Research Preview) |
| 4 | **Background Tasks** | Long-running ops không block conversation |
| 5 | **Scheduled Tasks** | `/loop` recurring + reminders |
| 6 | **Permission Modes** | 6 modes control quyền |
| 7 | **Headless Mode** | Non-interactive cho CI/CD (`claude -p`) |
| 8 | **Session Management** | Resume, fork, rename sessions |
| 9 | **Interactive Features** | Keyboard shortcuts, vim mode, bash mode |
| 10 | **Voice Dictation** | Push-to-talk 20 languages |
| 11 | **Channels** | MCP push messages vào session |
| 12 | **Chrome Integration** | Live browser automation |
| 13 | **Remote Control** | Control session từ phone/tablet |
| 14 | **Web Sessions** | Run Claude Code trên claude.ai/code |
| 15 | **Desktop App** | Standalone app với visual diff |
| 16 | **Task List** | Persistent tasks across compactions |
| 17 | **Prompt Suggestions** | Smart suggestions từ git history |
| 18 | **Git Worktrees** | Isolated parallel work |
| 19 | **Sandboxing** | OS-level filesystem/network isolation |
| 20 | **Managed Settings** | Enterprise deployment |
| 21 | **Configuration** | JSON config files |
| 22 | **Custom Keybindings** | `/keybindings` editor |

## 1. Planning Mode

Planning mode cho Claude **think through complex tasks** trước khi implement — tạo detailed plan để bạn review/approve.

### Two-Phase Approach

1. **Planning Phase** — Claude analyze task, tạo detailed plan
2. **Implementation Phase** — Sau approval, Claude execute

### Khi nào dùng?

✅ **Use cho:** Complex multi-file refactoring, new features, architectural changes, database migrations

❌ **Don't use cho:** Simple bug fixes, formatting changes, single-file edits, quick queries

### Activation

**Slash command:**

```
/plan Implement user authentication system
```

**CLI flag:**

```bash
claude --permission-mode plan
```

**Phím tắt:**

- `Shift + Tab` — Toggle permission modes
- `Alt + M` — Toggle (Windows/Linux)

**Model alias `opusplan`:** Opus cho planning, Sonnet cho execution:

```bash
claude --model opusplan "design and implement the new API"
```

### Example Output

```
User: /plan Add a real-time notification system

Claude: I'll create a plan for implementing real-time notifications.

## Implementation Plan

### Phase 1: Infrastructure Setup
1. Install WebSocket libraries (socket.io)
2. Set up WebSocket server
3. Configure connection management

### Phase 2: Backend Implementation
4. Create notification service
5. Implement notification queue
6. Add database schema for notifications
7. Create API endpoints

### Phase 3: Frontend Integration
8. Set up WebSocket client
9. Create notification UI components
10. Implement notification state management

### Phase 4: Testing & Deployment
11. Write unit tests
12. Write integration tests
13. Update documentation
14. Deploy to staging

Estimated time: 3-4 hours
Files to modify: 12
New files to create: 8

Ready to proceed? (yes/no/modify plan)
```

## 2. Extended Thinking

Extended thinking cho Claude **dành nhiều thời gian reasoning** trước khi đưa solution.

### Adaptive Thinking trên Opus 4.6+

Opus 4.6 dùng **adaptive thinking** — model tự quyết định khi nào và bao nhiêu cần think. Effort levels:

- **`low`** — minimal reasoning
- **`medium`** — balanced
- **`high`** — deep reasoning (default trên Opus 4.6)
- **`max`** — Opus 4.6 only, maximum reasoning

### Activation

**Phím tắt:** `Alt + T` / `Option + T` — toggle on/off

**Effort level:**

```bash
export CLAUDE_CODE_EFFORT_LEVEL=high
claude --effort high "complex architectural review"
```

**Slash command:**

```
/effort high
```

**Magic word:** Thêm "ultrathink" trong prompt → activate deep reasoning mode.

### Khi nào dùng?

✅ Architectural decisions, complex problem-solving, edge cases analysis
❌ Simple queries, factual lookups, basic edits

> Extended thinking adds latency. Don't enable blanket-style mọi calls — route complex tasks to thinking-enabled, route simpler lookups to standard responses.

## 3. Auto Mode (Research Preview)

Auto Mode dùng **background safety classifier** review mọi action trước khi execute. Claude work autonomously nhưng block dangerous operations.

### Requirements

- **Plan:** Team plan trở lên
- **Model:** Sonnet 4.6 hoặc Opus 4.6
- **Classifier:** Chạy trên Sonnet 4.6 (extra token cost)

### Enable

```bash
claude --enable-auto-mode
# Hoặc cycle to auto mode trong REPL với Shift+Tab
```

### Default Blocked Actions

| Blocked Action | Example |
|----------------|---------|
| Pipe-to-shell installs | `curl \| bash` |
| Sending sensitive data externally | API keys, credentials over network |
| Production deploys | Deploy commands targeting production |
| Mass deletion | `rm -rf` on large directories |
| IAM changes | Permission/role modifications |
| Force push to main | `git push --force origin main` |

### Default Allowed Actions

| Allowed | Example |
|---------|---------|
| Local file operations | Read, write, edit project files |
| Declared dependency installs | `npm install`, `pip install` từ manifest |
| Read-only HTTP | `curl` fetch documentation |
| Pushing to current branch | `git push origin feature-branch` |

## 4. Background Tasks

Long-running operations chạy async không block conversation.

### Commands

```
User: Run tests in background

Claude: Started task bg-1234

/task list           # Show all tasks
/task status bg-1234 # Check progress
/task show bg-1234   # View output
/task cancel bg-1234 # Cancel task
```

**Phím tắt:** `Ctrl+B` — Background currently running task

### Configuration

```json
{
  "backgroundTasks": {
    "enabled": true,
    "maxConcurrentTasks": 5,
    "notifyOnCompletion": true,
    "autoCleanup": true,
    "logOutput": true
  }
}
```

## 5. Scheduled Tasks

Run prompts tự động trên recurring schedule hoặc one-time reminders.

### `/loop` command

```
# Explicit interval
/loop 5m check if the deployment finished

# Natural language
/loop check build status every 30 minutes
```

### One-time reminders

```
remind me at 3pm to push the release branch
in 45 minutes, run the integration tests
```

### Limits & Behavior

- Up to **50 tasks** per session
- **Session-scoped** — cleared khi session end
- Recurring tasks **auto-expire after 3 days**
- Tasks **chỉ fire khi Claude Code running** — no catch-up
- **Not persisted** across restarts

### Cloud Scheduled Tasks (`/schedule`)

Persist across restarts, không cần Claude Code running locally:

```
/schedule daily at 9am run the test suite and report failures
```

## 6. Permission Modes

| Mode | Behavior |
|------|----------|
| **`default`** | Read files only; prompt cho mọi other actions |
| **`acceptEdits`** | Read + edit files; prompt cho commands |
| **`plan`** | Read files only (research mode, no edits) |
| **`auto`** | All actions với background safety classifier |
| **`bypassPermissions`** | All actions, no permission checks (**dangerous**) |
| **`dontAsk`** | Only pre-approved tools execute; others denied |

Cycle với `Shift+Tab`. Set default qua `--permission-mode` flag.

## 7. Headless Mode (`claude -p`)

Non-interactive mode cho automation và CI/CD.

### Examples

```bash
# Run specific task
claude -p "Run all tests"

# Process piped content
cat error.log | claude -p "Analyze these errors"

# JSON output
claude -p --output-format json "Analyze code quality"

# Limit autonomous turns
claude -p --max-turns 5 "refactor this module"

# Disable session persistence
claude -p --no-session-persistence "one-off analysis"
```

### CI/CD Integration (GitHub Actions)

```yaml
name: AI Code Review

on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Claude Code Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p --output-format json \
            --max-turns 3 \
            "Review this PR for code quality, security, performance, and test coverage. Output as JSON" > review.json

      - name: Post Review Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = JSON.parse(fs.readFileSync('review.json', 'utf8'));
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: JSON.stringify(review, null, 2)
            });
```

## 8. Session Management

```bash
# Continue last conversation
claude -c

# Resume named session
claude -r "auth-refactor" "finish this PR"

# Rename trong REPL
/rename auth-refactor

# Fork session để thử alternative
/fork

# Hoặc CLI:
claude --resume auth-refactor --fork-session "try OAuth instead"
```

## 9. Interactive Features - Complete Keyboard Shortcuts

| Shortcut | Mô tả |
|----------|-------|
| `Ctrl+C` | Cancel input/generation |
| `Ctrl+D` | Exit Claude Code |
| `Ctrl+G` | Edit plan in external editor |
| `Ctrl+L` | Clear terminal screen |
| `Ctrl+O` | Toggle verbose output (view reasoning) |
| `Ctrl+R` | Reverse search history |
| `Ctrl+T` | Toggle task list view |
| `Ctrl+B` | Background running tasks |
| `Esc+Esc` | Rewind code/conversation |
| `Shift+Tab` / `Alt+M` | Toggle permission modes |
| `Option+P` / `Alt+P` | Switch model |
| `Option+T` / `Alt+T` | Toggle extended thinking |

### Vim Mode

`/vim` hoặc `/config` để enable. Mode switching: `Esc` (NORMAL), `i/a/o` (INSERT).

### Bash Mode

Execute shell commands trực tiếp với `!` prefix:

```
! npm test
! git status
! cat src/index.js
```

### Custom Keybindings (`/keybindings`)

```json
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor",
        "ctrl+u": null,
        "ctrl+k ctrl+s": "chat:stash"
      }
    }
  ]
}
```

**Reserved keys (không rebound được):** `Ctrl+C`, `Ctrl+D`

## 10. Voice Dictation

```
/voice
```

Push-to-talk voice input với 20 languages. Cần Claude.ai account cho STT.

## 11. Channels (Research Preview)

MCP servers push messages vào running Claude Code sessions:

```bash
claude --channels discord,telegram
```

Supported: Discord, Telegram. Plugins phải approved qua `allowedChannelPlugins` setting.

## 12. Chrome Integration (Beta)

Connect Claude Code tới Chrome/Edge browser cho live web automation:

```bash
claude --chrome      # Enable
claude --no-chrome   # Disable
```

### Capabilities

- **Live debugging** — Read console logs, inspect DOM, debug JS real-time
- **Design verification** — Compare rendered pages vs design mockups
- **Form validation** — Test form submissions, input validation
- **Web app testing** — Interact với authenticated apps
- **Data extraction** — Scrape + process content từ web pages
- **Session recording** — Record browser interactions as GIF

### Limitations

- **Browser support:** Chrome + Edge only
- **WSL:** Không available
- **Third-party providers:** Không support với Bedrock, Vertex, Foundry

## 13. Remote Control

Continue locally running Claude Code session từ phone, tablet, browser. **Local session vẫn chạy trên máy bạn** — không có gì move to cloud.

### Start

```bash
claude remote-control
claude remote-control --name "Auth Refactor"
```

### Connect từ device khác

3 cách:

1. **Session URL** — printed lúc start, mở browser
2. **QR code** — bấm `spacebar` sau start, scan từ phone
3. **Find by name** — browse trên claude.ai/code hoặc Claude mobile app

### Security

- **No inbound ports** opened trên máy
- **Outbound HTTPS only** over TLS
- **Scoped credentials** — short-lived, narrowly scoped tokens

## 14. Web Sessions

Run Claude Code trực tiếp trong browser tại **claude.ai/code**.

```bash
# Create từ CLI
claude --remote "implement the new API endpoints"

# Resume Locally
claude --teleport
```

## 15. Desktop App

Standalone app với visual diff review, parallel sessions, integrated connectors. **macOS + Windows** (Pro, Max, Team, Enterprise).

### Core Features

- **Diff view** — File-by-file visual review với inline comments
- **App preview** — Auto-start dev servers với embedded browser
- **PR monitoring** — GitHub CLI integration, auto-fix CI failures, auto-merge
- **Parallel sessions** — Multiple sessions trong sidebar với automatic Git worktree isolation
- **Scheduled tasks** — Recurring tasks (hourly, daily, weekly)
- **Connectors** — GitHub, Slack, Linear, Notion, Asana, Calendar

## 16. Task List

Persistent task tracking **survive context compactions**.

**Toggle:** `Ctrl+T`

### Named Task Directories

```bash
export CLAUDE_CODE_TASK_LIST_ID=my-project-sprint-3
```

→ Multiple sessions share same task list (team workflows, multi-session projects).

## 17. Prompt Suggestions

Smart suggestions dạng grayed-out text dựa trên git history + conversation context.

- `Tab` — accept suggestion
- `Enter` — accept + immediately submit

**Disable:**

```bash
export CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=false
```

## 18. Git Worktrees

Start Claude Code trong isolated worktree — parallel work trên different branches không cần stash/switch.

```bash
claude --worktree
# hoặc
claude -w
```

### Sparse Checkout cho Monorepos

```json
{
  "worktree": {
    "sparsePaths": ["packages/my-package", "shared/"]
  }
}
```

**Auto-Cleanup:** No changes → worktree tự động cleanup khi session end.

## 19. Sandboxing

OS-level **filesystem + network isolation** cho Bash commands.

```bash
claude --sandbox       # Enable
claude --no-sandbox    # Disable
```

### Configuration

```json
{
  "sandbox": {
    "enabled": true,
    "failIfUnavailable": true,
    "filesystem": {
      "allowWrite": ["/Users/me/project"],
      "allowRead": ["/Users/me/project", "/usr/local/lib"],
      "denyRead": ["/Users/me/.ssh", "/Users/me/.aws"]
    },
    "enableWeakerNetworkIsolation": true
  }
}
```

## 20. Managed Settings (Enterprise)

Deploy Claude Code config across organization qua platform-native management tools.

| Platform | Method |
|----------|--------|
| macOS | Managed plist (MDM) |
| Windows | Windows Registry |
| Cross-platform | Managed config files |
| Cross-platform | Managed drop-ins (`managed-settings.d/`) |

### Available Settings

- `disableBypassPermissionsMode` — Ngăn user enable bypass permissions
- `availableModels` — Restrict models user select được
- `allowedChannelPlugins` — Control channel plugins permitted
- `autoMode.environment` — Configure trusted infrastructure cho auto mode

## 21. Configuration & Settings

### Complete Config Example

```json
{
  "permissions": {
    "mode": "default",
    "allowedTools": ["Bash(git log:*)", "Read"],
    "disallowedTools": ["Bash(rm -rf:*)"]
  },

  "hooks": {
    "PreToolUse": [{ "matcher": "Edit", "hooks": ["eslint --fix ${file_path}"] }],
    "PostToolUse": [{ "matcher": "Write", "hooks": ["~/.claude/hooks/security-scan.sh"] }]
  },

  "mcp": {
    "enabled": true,
    "servers": {
      "github": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": {
          "GITHUB_TOKEN": "${GITHUB_TOKEN}"
        }
      }
    }
  }
}
```

### Environment Variables Reference

```bash
# Model selection
export ANTHROPIC_MODEL=claude-opus-4-6

# Thinking
export MAX_THINKING_TOKENS=16000
export CLAUDE_CODE_EFFORT_LEVEL=high

# Feature toggles
export CLAUDE_CODE_DISABLE_AUTO_MEMORY=true
export CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=true
export CLAUDE_CODE_DISABLE_CRON=1
export CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=false
export CLAUDE_CODE_ENABLE_TASKS=true
export CLAUDE_CODE_SIMPLE=true              # --bare flag

# MCP config
export MAX_MCP_OUTPUT_TOKENS=50000
export ENABLE_TOOL_SEARCH=true

# Task management
export CLAUDE_CODE_TASK_LIST_ID=my-project-tasks

# Subagent
export CLAUDE_CODE_SUBAGENT_MODEL=sonnet
```

## 22. Workflow ứng dụng cho Blog Project

Cho project blog Next.js cá nhân, đây là combinations có thể dùng:

### Workflow 1: Plan Mode + Subagents cho feature mới

```
1. /plan Add comments system với Disqus alternative (custom backend)
   → Claude tạo detailed plan
2. Review, modify nếu cần
3. /plan approve
4. Claude delegate work qua subagents:
   - implementation-agent: backend API
   - test-engineer: integration tests
   - documentation-writer: API docs
5. Background tasks cho test suite chạy
6. Stop hook verify all tasks completed
```

### Workflow 2: Auto Mode cho daily blog work

```bash
# Workflow setup
claude --enable-auto-mode --permission-mode auto
```

Auto mode block:

- `vercel remove`, `git push --force` (production deploys, force push)
- `rm -rf` lớn (mass deletion)

Auto mode allow:

- File reads/writes trong blog/, components/
- `npm install`, `npm run dev`, `npm run build`
- `git add`, `git commit`, `git push origin <feature-branch>`

### Workflow 3: Headless Mode cho CI/CD

`.github/workflows/blog-quality-check.yml`:

```yaml
name: Blog Quality Check

on:
  pull_request:
    paths:
      - 'blog/**.md'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @anthropic-ai/claude-code

      - name: SEO + Quality Audit
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p --output-format json \
            --max-turns 5 \
            "Audit changed MD files for:
            - SEO frontmatter (title 50-60 chars, description 150-160 chars)
            - Image alt texts
            - Code block language tags
            - Internal links validity
            Output as JSON with severity levels" > audit.json
```

### Workflow 4: Scheduled Tasks cho monitoring

```
# Loop monitoring
/loop 30m check Vercel deployment status. If new deploy succeeded, summarize the changes.

# Reminder
remind me at 5pm to schedule next week's blog post
```

### Workflow 5: Git Worktrees cho experiment redesign

```bash
# Trong main project
claude --worktree

# Worktree tự động tạo tại .claude/worktrees/redesign-2026/
# Thử major redesign
> Refactor blog layout với new design system

# Tests pass → merge vào main
# Tests fail → exit worktree, không impact main branch
```

### Workflow 6: Remote Control khi đi cafe

```bash
# Tại nhà — start remote session
claude remote-control --name "Blog Sunday Sprint"

# Press spacebar để show QR code

# Tại cafe — scan QR code từ phone
# Continue session trên iPad/phone
# Local tools (filesystem, MCP) vẫn run trên máy ở nhà
```

### Workflow 7: Chrome Integration cho design review

```bash
claude --chrome
```

```
> Open localhost:3000 và compare blog layout với design ở Figma
> Take screenshots của 5 blog post pages
> Verify dark mode toggles work correctly
> Test contact form submission với invalid email
```

## 23. Câu hỏi thường gặp (FAQ)

### Q1: Plan Mode vs Extended Thinking khác gì?

| Khía cạnh | Plan Mode | Extended Thinking |
|-----------|-----------|-------------------|
| **Output** | Structured implementation plan | Reasoning analysis |
| **Phase** | 2 phases (plan → implement) | Single response với deeper reasoning |
| **User approval** | Có (yes/no/modify) | Không, automatic |
| **File access** | Read-only (no edits) | Có thể edit nếu mode cho phép |
| **Khi dùng** | Complex multi-step features | Architectural decisions, complex problems |

→ **Plan mode** outline steps. **Extended thinking** reason deeper.

### Q2: Auto Mode an toàn không? Có recommend cho personal project không?

**Auto Mode cẩn thận với:**

- ✅ Hữu ích cho **autonomous work** trên large refactors
- ✅ Background classifier block dangerous ops
- ⚠️ Vẫn có **token cost** cho classifier (extra Sonnet 4.6 calls)
- ⚠️ Classifier có thể **false negative** trên edge cases
- ⚠️ Chỉ available **Team plan trở lên**

**Cho personal project:**

- Pro/Max users → dùng **`acceptEdits`** mode + careful permissions trong settings.json là đủ

### Q3: Khi nào dùng Background Tasks vs Subagents?

| Khía cạnh | Background Tasks | Subagents |
|-----------|------------------|-----------|
| **Type** | Async shell commands | AI delegation |
| **Reasoning** | None (just execute) | Full LLM reasoning |
| **Use case** | Build/test/deploy scripts | Specialized AI work |
| **Concurrency** | Multiple parallel | Sequential hoặc parallel |
| **Cost** | Compute only | Token cost |

→ **Background Tasks** cho long shell ops. **Subagents** cho specialized AI tasks.

### Q4: Forking session khác Rewind thế nào?

| Khía cạnh | Fork | Rewind |
|-----------|------|--------|
| **Session** | Tạo session NEW từ checkpoint | Cùng session, modify state |
| **Original session** | Preserved nguyên | Modified |
| **Use case** | "What if" parallel approach | Quay lại đường khác |
| **Branching** | Multi-branch | Linear |

### Q5: Sandboxing có chặn được mọi malicious code không?

**Sandboxing là 1 layer defense, không phải silver bullet:**

- ✅ Block filesystem access ngoài allowed paths
- ✅ Network isolation (không full trên macOS)
- ⚠️ Không protect against legitimate-looking malicious code
- ⚠️ Bash sandbox không cover Python/Node scripts spawned

**Defense in depth:**

1. Permission rules (allow/deny patterns)
2. Sandbox (filesystem + network)
3. Hooks (PreToolUse validation)
4. Code review

### Q6: Channels (Discord/Telegram) có scale lên enterprise không?

Hiện tại là **Research Preview** — chưa production-ready cho enterprise:

- 2 integrations only (Discord, Telegram)
- Plugin-based architecture
- Managed via `allowedChannelPlugins` cho team control

Cho enterprise: dùng MCP servers + webhooks pattern thay thế hoặc đợi GA release.

### Q7: Remote Control có thay thế Claude Web không?

**Không** — bổ sung cho nhau:

| | Remote Control | Web Sessions |
|--|----------------|--------------|
| Execution | Local máy bạn | Cloud |
| Latency | Lower | Higher |
| Local tools | Full access | Không |
| Persistence | Local session | Cloud |
| Use case | Continue local work | Start from anywhere |

### Q8: Desktop App vs Claude Code CLI khác gì?

| Feature | CLI | Desktop App |
|---------|-----|-------------|
| Visual diff review | ❌ | ✅ |
| Parallel sessions | Limited | ✅ Full sidebar |
| App preview (dev server) | ❌ | ✅ |
| PR monitoring | Manual | ✅ Auto-fix CI failures |
| Connectors | Manual setup | ✅ Built-in |
| MDM deployment | ❌ | ✅ |
| Speed/footprint | Lighter | Heavier |

→ Desktop App cho **integrated workflow**. CLI cho **scripting + power users**.

### Q9: Worktrees có conflict với git submodules không?

Worktrees + submodules có thể tricky:

- Worktree có own `.git` directory
- Submodules share same submodule URLs
- Manual init submodules sau create worktree:

```bash
cd .claude/worktrees/<name>
git submodule update --init --recursive
```

### Q10: Managed Settings có override user settings không?

**Có** — managed settings **takes precedence** trên user-level:

1. Managed drop-ins (`managed-settings.d/*.json`) merged alphabetically
2. Managed plist/Registry settings
3. User settings (`~/.claude/settings.json`)
4. Project settings (`.claude/settings.json`)

→ Org-level config enforce, user không override được những fields managed.

### Q11: Claude Code có offline mode không?

**Không** — Claude Code requires internet để communicate với Anthropic API.

Local-only options:

- Claude Code's local components (hooks, file operations) work mà không cần network
- MCP servers local-only work nhưng Claude vẫn cần API call
- Cho fully offline: cần on-prem deployment (Bedrock, Vertex, Foundry — Enterprise)

### Q12: Sessions persistence storage ở đâu? Cleanup được không?

**Storage:**

```
~/.claude/projects/{project}/{session-id}/
├── transcript.jsonl     # Conversation history
├── checkpoints/         # Checkpoint snapshots
├── tasks/               # Task list state
└── subagents/           # Subagent transcripts
```

**Cleanup:**

```bash
# Manual cleanup old sessions
find ~/.claude/projects -name "transcript.jsonl" -mtime +30 -exec rm -rf {}/.. \;
```

Disk usage có thể grow với heavy use → periodic cleanup recommended.

### Q13: Extended Thinking có affect performance API/Token cost không?

**Có:**

- Token cost: thinking tokens count toward output budget
- Latency: thêm 5-30s tùy effort level
- API rate limits: thinking tokens count
- Caching: thinking output **không cached** giữa requests

**Cost optimization:**

- Default `medium` cho most tasks
- `high`/`max` chỉ cho architectural decisions
- Disable cho simple queries với `low` hoặc env variable

### Q14: Auto Mode classifier có học từ approvals của user không?

**Không** — classifier là **stateless model evaluation**, không train theo user behavior.

Mỗi action evaluate independently dựa trên:

- Action content (command, file, target)
- Trusted infrastructure config (`autoMode.environment`)
- Default rules

Workaround "learning" — dùng `auto-adapt-mode.py` hook tự add safe rules vào allowlist sau approvals.

## 24. Kết luận - Hành trình 9 modules Claude Code

Module 09 này là post cuối cùng trong series 9-part về Claude Code. Recap toàn bộ hành trình:

| Module | Chủ đề | Mục đích |
|--------|--------|----------|
| **01** | Slash Commands | Shortcuts gõ tay |
| **02** | Memory | Context persistence |
| **03** | Skills | Reusable instructions |
| **04** | Subagents | Specialized AI workers |
| **05** | MCP | External integration |
| **06** | Hooks | Event-driven automation |
| **07** | Plugins | Bundle tất cả |
| **08** | Checkpoints | Safety net với rewind |
| **09** | Advanced Features | Planning, thinking, automation |

### Big picture - Claude Code là gì?

Sau 9 modules, ta thấy Claude Code không phải chỉ là "AI helper trong terminal". Nó là **toolkit có 4 tầng abstraction**:

**Tầng 1 - Interaction:** Cách bạn nói với Claude (slash commands, voice, chat)

**Tầng 2 - Knowledge:** Cách Claude biết về project (memory, skills, MCP)

**Tầng 3 - Execution:** Cách Claude làm việc (subagents, background tasks, worktrees, plan mode, extended thinking)

**Tầng 4 - Control:** Cách bạn kiểm soát Claude (hooks, permissions, sandboxing, checkpoints)

Plugins (module 07) là cơ chế đóng gói cả 4 tầng thành package shareable.

### Roadmap khuyến nghị toàn series

**Tuần 1-2 (Cơ bản):**

- Module 01 (Slash Commands)
- Module 02 (Memory)
- Tạo `CLAUDE.md` đầu tiên, học 5-10 built-in commands

**Tuần 3-4 (Tự động hoá nhẹ):**

- Module 03 (Skills) — tạo 2-3 custom skills
- Module 06 (Hooks) — thêm 1 PostToolUse format hook

**Tháng 2 (Specialized):**

- Module 04 (Subagents) — tạo code-reviewer, test-engineer agents
- Module 05 (MCP) — setup GitHub MCP

**Tháng 3 (Power user):**

- Module 07 (Plugins) — bundle workflow thành plugin
- Module 08 (Checkpoints) — học rewind workflow

**Tháng 4+ (Mastery):**

- Module 09 (Advanced) — Plan mode, Extended thinking, Auto mode, Headless cho CI/CD

### Triết lý cuối cùng

> **Đừng học hết toàn bộ Claude Code rồi mới bắt đầu dùng.** Bắt đầu với cơ chế đơn giản nhất giải quyết được vấn đề bạn đang có. Khi gặp pain point cụ thể, mở module tương ứng học cách giải quyết. Lặp lại.
>
> Không có "ninja master" Claude Code phải biết hết 9 modules. Có "developer hiệu quả" biết chọn đúng tool cho đúng task.

### Lời cảm ơn

Cảm ơn bạn đã đọc đến cuối series 9-part về Claude Code. Hy vọng bộ tài liệu này giúp bạn hiểu sâu hơn về toolkit và áp dụng vào workflow hàng ngày.

Claude Code đang phát triển rất nhanh — features mới ra liên tục, best practices đang định hình. Hãy thường xuyên check:

- [Official Documentation](https://code.claude.com/docs)
- [Release Notes](https://github.com/anthropics/claude-code/releases) — `/release-notes` trong session
- [GitHub Issues](https://github.com/anthropics/claude-code/issues) — community discussions
- [Anthropic Engineering Blog](https://www.anthropic.com/engineering) — deep dives

Chúc bạn build được những workflows, plugins, skills, agents tuyệt vời cho project của riêng mình. Happy coding với Claude Code! 🚀

Hãy bắt đầu hành trình bằng cách gõ `/help` trong Claude Code, rồi từng bước explore. Mỗi tuần làm quen với 1 cơ chế mới, sau 2-3 tháng bạn sẽ có toolkit cá nhân hóa hoàn toàn cho cách làm việc của mình.
