---
slug: claude-code-cli
title: Claude Code CLI Reference - Toàn bộ commands và flags
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Claude, AI, DevTools, CLI]
date: '2026-05-01T12:00:00Z'
image: https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&auto=format&fit=crop&q=80
---

Module thứ 10 — cũng là module cuối — trong series Claude Code tổng hợp đầy đủ CLI reference: commands, flags, environment variables, output formats, agent configuration via JSON, và high-value use cases. Đây là tài liệu tham khảo nhanh cho mọi developer sử dụng Claude Code daily.

<!-- truncate -->

# Claude Code CLI Reference: Tham khảo nhanh

## 1. Tổng quan

Claude Code CLI là **cách chính** để tương tác với Claude Code. Cung cấp:

- Run queries trong interactive REPL hoặc print mode
- Manage sessions
- Configure models và permissions
- Integrate Claude vào development workflows
- CI/CD automation

### CLI Architecture

```
User Terminal
    ↓ claude [options] [query]
    ↓
Claude Code CLI
    ├── Interactive REPL Mode (default)
    ├── Print Mode (--print, -p)
    └── Session Resume (--resume)
         ↓
       Claude API
         ↓
       Output (text/json/stream-json)
         ↓
    Terminal/Pipe
```

## 2. CLI Commands chính

| Command | Mô tả | Example |
|---------|-------|---------|
| `claude` | Start interactive REPL | `claude` |
| `claude "query"` | Start REPL với initial prompt | `claude "explain this project"` |
| `claude -p "query"` | Print mode — query rồi exit | `claude -p "explain this function"` |
| `cat file \| claude -p "query"` | Process piped content | `cat logs.txt \| claude -p "explain"` |
| `claude -c` | Continue most recent conversation | `claude -c` |
| `claude -c -p "query"` | Continue trong print mode | `claude -c -p "check for type errors"` |
| `claude -r "<session>" "query"` | Resume session theo ID/name | `claude -r "auth-refactor" "finish this PR"` |
| `claude update` | Update tới version mới | `claude update` |
| `claude mcp` | Configure MCP servers | `claude mcp list` |
| `claude mcp serve` | Run Claude Code as MCP server | `claude mcp serve` |
| `claude agents` | List configured subagents | `claude agents` |
| `claude auto-mode defaults` | Print auto mode rules JSON | `claude auto-mode defaults` |
| `claude remote-control` | Start Remote Control server | `claude remote-control` |
| `claude plugin` | Manage plugins | `claude plugin install my-plugin` |
| `claude auth login` | Log in (`--email`, `--sso`) | `claude auth login --email user@example.com` |
| `claude auth logout` | Log out current account | `claude auth logout` |
| `claude auth status` | Check auth status (exit 0/1) | `claude auth status` |

## 3. Core Flags

| Flag | Mô tả | Example |
|------|-------|---------|
| `-p, --print` | Print response without interactive | `claude -p "query"` |
| `-c, --continue` | Load most recent conversation | `claude --continue` |
| `-r, --resume` | Resume session theo ID/name | `claude --resume auth-refactor` |
| `-v, --version` | Output version | `claude -v` |
| `-w, --worktree` | Start trong isolated git worktree | `claude -w` |
| `-n, --name` | Session display name | `claude -n "auth-refactor"` |
| `--from-pr <number>` | Resume sessions linked to PR | `claude --from-pr 42` |
| `--remote "task"` | Create web session trên claude.ai | `claude --remote "implement API"` |
| `--remote-control, --rc` | Interactive với Remote Control | `claude --rc` |
| `--teleport` | Resume web session locally | `claude --teleport` |
| `--bare` | Minimal mode (skip hooks/skills/plugins/MCP/CLAUDE.md) | `claude --bare` |
| `--enable-auto-mode` | Unlock auto permission mode | `claude --enable-auto-mode` |
| `--channels` | Subscribe MCP channel plugins | `claude --channels discord,telegram` |
| `--chrome` / `--no-chrome` | Toggle Chrome integration | `claude --chrome` |
| `--effort` | Set thinking effort level | `claude --effort high` |
| `--init` / `--init-only` | Run initialization hooks | `claude --init` |
| `--maintenance` | Run maintenance hooks rồi exit | `claude --maintenance` |
| `--disable-slash-commands` | Disable all skills/slash commands | `claude --disable-slash-commands` |
| `--no-session-persistence` | Disable session saving (print mode) | `claude -p --no-session-persistence "query"` |

## 4. Interactive vs Print Mode

```
claude (default)
    ├── Interactive REPL
    │    Features:
    │    - Multi-turn conversation
    │    - Tab completion
    │    - History
    │    - Slash commands
    │
    └── Print Mode (-p)
         Features:
         - Single query
         - Scriptable
         - Pipeable
         - JSON output
```

### Interactive Mode (default)

```bash
# Start interactive session
claude

# Start với initial prompt
claude "explain the authentication flow"
```

### Print Mode (`-p`)

```bash
# Single query, then exit
claude -p "what does this function do?"

# Process file content
cat error.log | claude -p "explain this error"

# Chain với other tools
claude -p "list todos" | grep "URGENT"
```

> **Note:** CLI trước đây gọi là "headless mode". `-p` flag và CLI options work the same.

## 5. Bare Mode (`--bare`)

Reduce startup time bằng cách skip auto-discovery của:

- Hooks
- Skills
- Plugins
- MCP servers
- Auto memory
- CLAUDE.md

→ Hữu ích cho **CI và scripts** nơi cần same result trên mọi máy. Hook trong teammate's `~/.claude` hoặc MCP server trong project's `.mcp.json` **sẽ KHÔNG run** vì bare mode không read.

```bash
# One-off summarize trong bare mode, pre-approve Read tool
claude --bare -p "Summarize this file" --allowedTools "Read"
```

> Bare mode skips OAuth + keychain reads. Authentication phải từ `ANTHROPIC_API_KEY` hoặc `apiKeyHelper` trong JSON pass tới `--settings`.

## 6. Model & Configuration

| Flag | Mô tả | Example |
|------|-------|---------|
| `--model` | Set model (sonnet, opus, haiku, full name) | `claude --model opus` |
| `--fallback-model` | Auto fallback khi overloaded | `claude -p --fallback-model sonnet "query"` |
| `--agent` | Specify agent cho session | `claude --agent my-custom-agent` |
| `--agents` | Define custom subagents qua JSON | (xem section 12) |
| `--effort` | Set effort level | `claude --effort high` |

### Model Selection

```bash
# Use Opus 4.7 cho complex tasks
claude --model opus "design a caching strategy"

# Use Haiku 4.5 cho quick tasks
claude --model haiku -p "format this JSON"

# Full model name
claude --model claude-sonnet-4-6-20250929 "review this code"

# Với fallback cho reliability
claude -p --model opus --fallback-model sonnet "analyze architecture"

# Use opusplan (Opus plans, Sonnet executes)
claude --model opusplan "design and implement the caching layer"
```

### Effort Levels (Opus 4.7)

Opus 4.7 supports adaptive reasoning với **5 effort levels**:

- `low` — minimal
- `medium` — balanced
- `high` — deep
- `xhigh` — new in v2.1.111, **default trên Opus 4.7**
- `max` — Opus 4.7 only

```bash
# CLI flag
claude --effort xhigh "complex review"

# Slash command
/effort xhigh

# Environment variable
export CLAUDE_CODE_EFFORT_LEVEL=xhigh
```

> "ultrathink" keyword trong prompts activate deep reasoning mode. `max` exclusive Opus 4.7.

## 7. System Prompt Customization

| Flag | Mô tả | Example |
|------|-------|---------|
| `--system-prompt` | Replace entire default prompt | `claude --system-prompt "You are a Python expert"` |
| `--system-prompt-file` | Load prompt từ file (print mode only) | `claude -p --system-prompt-file ./prompt.txt "query"` |
| `--append-system-prompt` | Append to default prompt | `claude --append-system-prompt "Always use TypeScript"` |

### Examples

```bash
# Complete custom persona
claude --system-prompt "You are a senior security engineer. Focus on vulnerabilities."

# Append specific instructions
claude --append-system-prompt "Always include unit tests with code examples"

# Load complex prompt từ file
claude -p --system-prompt-file ./prompts/code-reviewer.txt "review main.py"
```

### Practical example: Security review từ PR diff

```bash
gh pr diff "$1" | claude -p \
  --append-system-prompt "You are a security engineer. Review for vulnerabilities." \
  --output-format json
```

## 8. Tool & Permission Management

| Flag | Mô tả | Example |
|------|-------|---------|
| `--tools` | Restrict available built-in tools | `claude -p --tools "Bash,Edit,Read" "query"` |
| `--allowedTools` | Tools execute không prompt | `"Bash(git log:*)" "Read"` |
| `--disallowedTools` | Tools removed khỏi context | `"Bash(rm:*)" "Edit"` |
| `--dangerously-skip-permissions` | Skip all permission prompts | `claude --dangerously-skip-permissions` |
| `--permission-mode` | Begin in specific mode | `claude --permission-mode auto` |
| `--enable-auto-mode` | Unlock auto permission mode | `claude --enable-auto-mode` |

### Permission Examples

```bash
# Read-only mode cho code review
claude --permission-mode plan "review this codebase"

# Restrict tới safe tools only
claude --tools "Read,Grep,Glob" -p "find all TODO comments"

# Allow specific git commands không prompts
claude --allowedTools "Bash(git status:*)" "Bash(git log:*)"

# Block dangerous operations
claude --disallowedTools "Bash(rm -rf:*)" "Bash(git push --force:*)"
```

### `--allowedTools` Permission Rule Syntax

`--allowedTools` flag dùng permission rule syntax:

- Trailing `*` enables **prefix matching**: `Bash(git diff *)` allows mọi command bắt đầu với `git diff`
- **Space trước `*` quan trọng**: không có space, `Bash(git diff*)` cũng match `git diff-index`

## 9. Output & Format

| Flag | Mô tả | Options |
|------|-------|---------|
| `--output-format` | Output format (print mode) | `text`, `json`, `stream-json` |
| `--input-format` | Input format (print mode) | `text`, `stream-json` |
| `--verbose` | Verbose logging | |
| `--include-partial-messages` | Include streaming events | Cần `stream-json` |
| `--json-schema` | Validated JSON matching schema | |
| `--max-budget-usd` | Maximum spend (print mode) | |

### Output Format Examples

```bash
# Plain text (default)
claude -p "explain this code"

# JSON cho programmatic use
claude -p --output-format json "list all functions in main.py"

# Streaming JSON cho real-time processing
claude -p --output-format stream-json "generate a long report"

# Structured output với schema validation
claude -p --json-schema '{"type":"object","properties":{"bugs":{"type":"array"}}}' \
  "find bugs in this code and return as JSON"
```

### Stream JSON Processing với jq

```bash
# Filter text deltas, display streaming text
claude -p "Write a poem" --output-format stream-json --verbose --include-partial-messages | \
  jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'
```

> `-r` outputs raw strings (no quotes), `-j` joins without newlines — tokens stream continuously.

## 10. Workspace & Directory

| Flag | Mô tả | Example |
|------|-------|---------|
| `--add-dir` | Add additional working directories | `claude --add-dir ../apps ../lib` |
| `--setting-sources` | Comma-separated setting sources | `claude --setting-sources user,project` |
| `--settings` | Load settings từ file/JSON | `claude --settings ./settings.json` |
| `--plugin-dir` | Load plugins từ directory (repeatable) | `claude --plugin-dir ./my-plugin` |

```bash
# Work across multiple project directories
claude --add-dir ../frontend ../backend ../shared "find all API endpoints"

# Load custom settings
claude --settings '{"model":"opus","verbose":true}' "complex task"
```

## 11. MCP Configuration

| Flag | Mô tả | Example |
|------|-------|---------|
| `--mcp-config` | Load MCP servers từ JSON | `claude --mcp-config ./mcp.json` |
| `--strict-mcp-config` | Only specified MCP config | `claude --strict-mcp-config --mcp-config ./mcp.json` |
| `--channels` | Subscribe MCP channel plugins | `claude --channels discord,telegram` |

```bash
# Load GitHub MCP server
claude --mcp-config ./github-mcp.json "list open PRs"

# Strict mode — only specified servers
claude --strict-mcp-config --mcp-config ./production-mcp.json "deploy to staging"
```

## 12. Agents Configuration via `--agents`

`--agents` flag accept JSON object define custom subagents cho session.

### JSON Format

```json
{
  "agent-name": {
    "description": "Required: when to invoke this agent",
    "prompt": "Required: system prompt for the agent",
    "tools": ["Optional", "array", "of", "tools"],
    "model": "optional: sonnet|opus|haiku"
  }
}
```

### Complete Example

```json
{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "Debugging specialist for errors and test failures.",
    "prompt": "You are an expert debugger. Analyze errors, identify root causes, and provide fixes.",
    "tools": ["Read", "Edit", "Bash", "Grep"],
    "model": "opus"
  }
}
```

### Usage

```bash
# Define agents inline
claude --agents '{
  "security-auditor": {
    "description": "Security specialist for vulnerability analysis",
    "prompt": "You are a security expert. Find vulnerabilities and suggest fixes.",
    "tools": ["Read", "Grep", "Glob"],
    "model": "opus"
  }
}' "audit this codebase for security issues"

# Load agents từ file
claude --agents "$(cat ~/.claude/agents.json)" "review the auth module"
```

### Agent Priority

1. **CLI-defined** (`--agents` flag) — Session-specific
2. **User-level** (`~/.claude/agents/`) — All projects
3. **Project-level** (`.claude/agents/`) — Current project

CLI-defined override user + project agents cho session.

## 13. High-Value Use Cases

### Use Case 1: CI/CD Integration

#### GitHub Actions

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

      - name: Run Code Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p --output-format json \
            --max-turns 1 \
            "Review the changes in this PR for:
            - Security vulnerabilities
            - Performance issues
            - Code quality
            Output as JSON with 'issues' array" > review.json
```

#### Cron Job (autonomous scheduling)

```bash
# crontab -e
# Run every weekday at 2pm — analyze logs
0 14 * * 1-5 cd /var/log/app && \
  tail -1000 error.log | claude -p \
    --dangerously-skip-permissions \
    "Analyze errors, identify patterns, alert if critical" | \
    mail -s "Daily Log Report" devops@example.com
```

### Use Case 2: Script Piping

```bash
# Analyze error logs
tail -1000 /var/log/app/error.log | claude -p "summarize these errors and suggest fixes"

# Find patterns trong access logs
cat access.log | claude -p "identify suspicious access patterns"

# Review specific file
cat src/auth.ts | claude -p "review this authentication code for security issues"

# Generate documentation
cat src/api/*.ts | claude -p "generate API documentation in markdown"

# Find TODOs, prioritize
grep -r "TODO" src/ | claude -p "prioritize these TODOs by importance"
```

### Use Case 3: Multi-Session Workflows

```bash
# Start feature branch session
claude -r "feature-auth" "let's implement user authentication"

# Later, continue
claude -r "feature-auth" "add password reset functionality"

# Fork để thử alternative
claude --resume feature-auth --fork-session "try OAuth instead"

# Switch giữa feature sessions
claude -r "feature-payments" "continue with Stripe integration"
```

### Use Case 4: Batch Processing

```bash
# Process multiple files
for file in src/*.ts; do
  echo "Processing $file..."
  claude -p --model haiku "summarize this file: $(cat $file)" >> summaries.md
done

# Generate tests cho all modules
for module in $(ls src/modules/); do
  claude -p "generate unit tests for src/modules/$module" > "tests/$module.test.ts"
done
```

### Use Case 5: JSON API Integration với jq

```bash
# Get structured analysis
claude -p --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array"}}}' \
  "analyze main.py and return function list"

# Integrate với jq cho processing
claude -p --output-format json "list all API endpoints" | jq '.endpoints[]'

# Use trong scripts
RESULT=$(claude -p --output-format json "is this code secure? answer with {secure: boolean, issues: []}" < code.py)
if echo "$RESULT" | jq -e '.secure == false' > /dev/null; then
  echo "Security issues found!"
  echo "$RESULT" | jq '.issues[]'
fi
```

### jq Parsing Examples

```bash
# Extract specific fields
claude -p --output-format json "analyze this code" | jq '.result'

# Filter array elements
claude -p --output-format json "list issues" | jq -r '.issues[] | select(.severity=="high")'

# Convert tới CSV
claude -p --output-format json "list functions" | jq -r '.functions[] | [.name, .lineCount] | @csv'

# Conditional processing
claude -p --output-format json "check security" | jq 'if .vulnerabilities | length > 0 then "UNSAFE" else "SAFE" end'
```

## 14. Models

| Model | ID | Context Window | Notes |
|-------|-----|----------------|-------|
| **Opus 4.7** | `claude-opus-4-7` | 1M tokens | Most capable, adaptive effort levels (default xhigh) |
| **Sonnet 4.6** | `claude-sonnet-4-6` | 1M tokens | Balanced speed + capability |
| **Haiku 4.5** | `claude-haiku-4-5` | 1M tokens | Fastest, best cho quick tasks |

```bash
# Short names
claude --model opus "complex architectural review"
claude --model sonnet "implement this feature"
claude --model haiku -p "format this JSON"

# opusplan alias (Opus plans, Sonnet executes)
claude --model opusplan "design and implement the API"
```

## 15. Environment Variables

| Variable | Mô tả |
|----------|-------|
| `ANTHROPIC_API_KEY` | API key cho authentication |
| `ANTHROPIC_MODEL` | Override default model |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Override Opus model ID |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Override Sonnet model ID |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Override Haiku model ID |
| `MAX_THINKING_TOKENS` | Set extended thinking budget |
| `CLAUDE_CODE_EFFORT_LEVEL` | Set effort level |
| `CLAUDE_CODE_SIMPLE` | Minimal mode, set bởi `--bare` |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Disable automatic CLAUDE.md updates |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | Disable background tasks |
| `CLAUDE_CODE_DISABLE_CRON` | Disable scheduled tasks |
| `CLAUDE_CODE_ENABLE_TASKS` | Enable task list |
| `CLAUDE_CODE_TASK_LIST_ID` | Named task directory |
| `CLAUDE_CODE_SUBAGENT_MODEL` | Model cho subagent |
| `MAX_MCP_OUTPUT_TOKENS` | Max tokens MCP tool output |
| `ENABLE_TOOL_SEARCH` | Enable tool search |

## 16. Quick Reference

### Most Common Commands

```bash
# Interactive session
claude

# Quick question
claude -p "how do I..."

# Continue conversation
claude -c

# Process file
cat file.py | claude -p "review this"

# JSON output cho scripts
claude -p --output-format json "query"
```

### Flag Combinations

| Use Case | Command |
|----------|---------|
| **Quick code review** | `cat file \| claude -p "review"` |
| **Structured output** | `claude -p --output-format json "query"` |
| **Safe exploration** | `claude --permission-mode plan` |
| **Autonomous với safety** | `claude --enable-auto-mode --permission-mode auto` |
| **CI/CD integration** | `claude -p --max-turns 3 --output-format json` |
| **Resume work** | `claude -r "session-name"` |
| **Custom model** | `claude --model opus "complex task"` |
| **Minimal mode** | `claude --bare "quick query"` |
| **Budget-capped** | `claude -p --max-budget-usd 2.00 "analyze code"` |

## 17. Workflow ứng dụng cho Blog Project

Cho project blog Next.js cá nhân, đây là CLI patterns có thể dùng:

### Pattern 1: Quick analyze blog post từ command line

```bash
# Phân tích SEO của 1 post
cat blog/kafka-consumer-groups.md | claude -p \
  --model haiku \
  "Phân tích SEO: title length, description length, headings hierarchy, image alts. Output as JSON" \
  --output-format json | jq '.'

# Generate description từ existing content
cat blog/draft.md | claude -p \
  "Generate 150-160 char SEO description for this post. Vietnamese ok." > description.txt
```

### Pattern 2: Batch processing posts

```bash
# Generate summaries cho all posts
for file in blog/*.md; do
  slug=$(basename "$file" .md)
  claude -p --model haiku \
    "Summarize this post in 50 Vietnamese words: $(cat "$file")" \
    > "summaries/$slug.txt"
done

# Audit tất cả posts về frontmatter
for file in blog/*.md; do
  slug=$(basename "$file" .md)
  cat "$file" | claude -p --output-format json \
    --json-schema '{"type":"object","properties":{"valid":{"type":"boolean"},"issues":{"type":"array"}}}' \
    "Audit frontmatter. Check title 50-60 chars, description 150-160, slug, date, tags. Return JSON" \
    > "audits/$slug.json"
done

# Show posts với issues
for f in audits/*.json; do
  if [[ $(jq '.valid' "$f") == "false" ]]; then
    echo "❌ $(basename "$f" .json):"
    jq '.issues' "$f"
  fi
done
```

### Pattern 3: GitHub Actions tự động audit PR

```yaml
name: Blog Quality Audit

on:
  pull_request:
    paths:
      - 'blog/**.md'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Audit changed posts
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          FILES=$(git diff --name-only origin/main...HEAD | grep "blog/.*\.md$" || true)
          for file in $FILES; do
            cat "$file" | claude -p \
              --model sonnet \
              --output-format json \
              --max-turns 1 \
              --max-budget-usd 0.10 \
              "Audit blog post for SEO frontmatter, code blocks, image alts, links. Output as JSON." \
              > "audit-$(basename $file .md).json"
          done
```

### Pattern 4: Cron job phân tích traffic logs

```bash
# crontab -e
# Mỗi sáng 7h, summary traffic logs gửi email
0 7 * * * tail -1000 /var/log/nginx/blog-access.log | \
  claude --bare -p \
    --model haiku \
    --max-budget-usd 0.05 \
    "Summarize traffic patterns trong 24h qua. Top pages, suspicious requests, error rate." | \
    mail -s "Blog Daily Report" pin@example.com
```

### Pattern 5: Local helper scripts

`scripts/new-post.sh`:

```bash
#!/bin/bash
# Tạo blog post mới với Claude generate frontmatter

TITLE="$1"
SLUG=$(echo "$TITLE" | iconv -f utf-8 -t ascii//TRANSLIT | tr '[:upper:]' '[:lower:]' | tr -c '[:alnum:]' '-' | sed 's/-\+/-/g' | sed 's/^-\|-$//g')
DATE=$(date -u +%Y-%m-%d)

claude -p --output-format json \
  --json-schema '{"type":"object","properties":{"title":{"type":"string"},"description":{"type":"string"},"tags":{"type":"array"}}}' \
  "Generate blog post frontmatter for title: \"$TITLE\".
   - title: keep close to original, max 60 chars
   - description: 150-160 chars, Vietnamese
   - tags: 3-5 lowercase tags
   Return JSON only" > /tmp/frontmatter.json

cat > "blog/$DATE-$SLUG.md" << EOF
---
title: "$(jq -r '.title' /tmp/frontmatter.json)"
description: "$(jq -r '.description' /tmp/frontmatter.json)"
slug: "$SLUG"
date: "${DATE}T12:00:00Z"
tags: $(jq -c '.tags' /tmp/frontmatter.json)
---

# $(jq -r '.title' /tmp/frontmatter.json)

Start writing here...
EOF

echo "✅ Created blog/$DATE-$SLUG.md"
```

### Pattern 6: Pre-commit hook validate posts

`.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Chạy validation Claude trước khi commit posts

CHANGED_POSTS=$(git diff --cached --name-only | grep "blog/.*\.md$")

if [ -z "$CHANGED_POSTS" ]; then
  exit 0
fi

echo "🔍 Validating changed posts với Claude..."

for file in $CHANGED_POSTS; do
  RESULT=$(cat "$file" | claude --bare -p \
    --model haiku \
    --max-budget-usd 0.02 \
    --output-format json \
    --json-schema '{"type":"object","properties":{"valid":{"type":"boolean"},"errors":{"type":"array"}}}' \
    "Quick validate this MD: frontmatter complete (title, slug, date, tags), no broken markdown. Return JSON.")

  VALID=$(echo "$RESULT" | jq -r '.valid')
  if [ "$VALID" != "true" ]; then
    echo "❌ $file failed validation:"
    echo "$RESULT" | jq -r '.errors[]'
    exit 1
  fi
  echo "✅ $file"
done

echo "✅ All posts valid"
```

## 18. Câu hỏi thường gặp (FAQ)

### Q1: Print mode (`-p`) khác headless mode thế nào?

CLI trước đây gọi là **"headless mode"** — bây giờ đổi tên thành **"print mode"** với `-p` flag. Cùng functionality:

- Non-interactive single query
- Output ra stdout
- Pipeable với other commands
- Suitable cho automation, CI/CD

`-p` và `--print` flags là alias.

### Q2: Khi nào dùng `--bare` mode?

**Use cases tốt:**

- CI/CD scripts cần consistent results trên mọi machine
- Quick one-off queries không cần project context
- Performance-sensitive scripts (faster startup)
- Testing isolated functionality

**Bare mode SKIP:**

- Hooks, Skills, Plugins, MCP servers, Auto memory, CLAUDE.md files

→ Nếu cần bất cứ feature nào trên, **không dùng** `--bare`.

### Q3: `--dangerously-skip-permissions` có an toàn không?

**Tên đã rõ — DANGEROUS**. Skip mọi permission prompts → Claude execute mọi action không hỏi.

**Khi nào dùng:**

- ✅ CI/CD pipelines (controlled environment)
- ✅ Cron jobs (no user available)
- ✅ Sandboxed/disposable VMs

**KHÔNG dùng:**

- ❌ Production servers
- ❌ Development machines với important data
- ❌ Workflows xử lý user input chưa sanitize (prompt injection risk)

**Best practice:** Combine với:

- `--max-turns N` để limit autonomous actions
- `--allowedTools` whitelist tools cụ thể
- `--disallowedTools` blacklist dangerous commands
- `--max-budget-usd` để cap costs

### Q4: `-c` (continue) khác `-r <name>` (resume) thế nào?

| Flag | Behavior |
|------|----------|
| `-c, --continue` | Continue **most recent** conversation |
| `-r, --resume <name/ID>` | Resume **specific** session theo name/ID |

```bash
claude -c                         # Last conversation
claude -r "auth-refactor"         # Specific named session
claude -r "550e8400-..."          # Specific session UUID
claude --resume abc123 --fork-session  # Fork specific session
```

### Q5: `--max-turns` có ngăn được infinite loops không?

Có. `--max-turns N` giới hạn số autonomous turns Claude có thể làm:

- Mỗi `Bash`/`Edit`/`Read`/etc tool call = 1 turn
- Sau N turns, Claude dừng kể cả task chưa xong
- Default unlimited trong interactive, recommended set cho `-p` mode

```bash
# Conservative cho automation
claude -p --max-turns 3 "fix lint errors"

# Generous cho complex tasks
claude -p --max-turns 20 "refactor entire module"
```

### Q6: `--max-budget-usd` hoạt động chính xác thế nào?

Cap **maximum total cost** (input + output tokens + caching) cho 1 invocation. Khi reach limit, Claude **stop ngay lập tức** kể cả mid-response.

```bash
# Limit $0.50 per invocation
claude -p --max-budget-usd 0.50 "analyze this codebase"
```

**Best practices:**

- Set realistic budget dựa trên task complexity
- Combine với `--max-turns` để double safety
- Use `--model haiku` cho cost-efficient batch jobs
- Test budget với small queries trước

### Q7: `--json-schema` có guarantee output match schema không?

**Mostly yes** — Claude validate output match schema trước khi return. Nhưng:

- ✅ Strict structural validation (types, required fields)
- ✅ Reject malformed responses, retry internally
- ⚠️ Semantic validation depends on prompt clarity
- ⚠️ Schema phải valid JSON Schema (not loose example)

### Q8: `--allowedTools` với pattern matching hoạt động ra sao?

Pattern syntax với `Bash(<pattern>)`:

```bash
# Exact match
--allowedTools "Bash(git status)"          # Chỉ "git status"

# Prefix match (note SPACE trước *)
--allowedTools "Bash(git status:*)"        # "git status", "git status -s", etc.

# Compound prefix
--allowedTools "Bash(git push origin:*)"   # "git push origin main", etc.

# Wildcard tool
--allowedTools "Read(*)"                   # All Read calls
--allowedTools "Edit(*)"                   # All Edit calls
```

> **Quan trọng:** Space trước `*` quan trọng! Không có space, `Bash(git diff*)` sẽ match `git diff-index` (potentially dangerous).

### Q9: Multiple sessions cùng running có conflict không?

Không thường conflict. Mỗi `claude` process = independent session với:

- Riêng session ID
- Riêng context window
- Riêng background tasks
- Shared MCP servers (nếu cùng config)

**Watch out:**

- Nếu 2 sessions cùng modify same file → race condition
- Background tasks từ different sessions có thể compete cho resources
- MCP servers có thể có rate limits (per user, not per session)

### Q10: Session storage lớn theo thời gian, cleanup ra sao?

Sessions lưu tại `~/.claude/projects/{project}/{session-id}/`.

```bash
# Manual cleanup sessions cũ hơn 30 days
find ~/.claude/projects -name "transcript.jsonl" -mtime +30 -exec rm -rf {}/.. \;

# Disk usage check
du -sh ~/.claude/projects/

# Disable session persistence cho ephemeral runs
claude -p --no-session-persistence "one-off query"
```

### Q11: `--input-format stream-json` dùng làm gì?

Đối ngược của `--output-format stream-json`. Cho phép pipe streaming JSON input vào Claude:

```bash
# Use case: Real-time event processing
tail -f /var/log/events.jsonl | \
  claude -p --input-format stream-json \
    "Process each event và alert if anomaly detected"
```

Input format stream-json: mỗi dòng = JSON event Claude process incrementally.

### Q12: Beta features có flag riêng không?

Có, qua `--betas`:

```bash
# Enable specific beta
claude --betas interleaved-thinking "analyze with interleaved thinking"

# Multiple betas
claude --betas interleaved-thinking,prompt-caching "complex task"
```

Common betas:

- `interleaved-thinking` — Reasoning between tool calls
- `prompt-caching` — Cache prefixes cho lower cost
- `extended-context` — Larger context windows

> Beta features unstable, có thể change without notice. Production use carefully.

### Q13: Có cách nào benchmark/profile CLI commands không?

```bash
# Time với verbose output
time claude --debug --verbose -p "simple query"

# Cost tracking với JSON
RESULT=$(claude -p --output-format json "query")
COST=$(echo "$RESULT" | jq -r '.cost.total_cost')
TOKENS=$(echo "$RESULT" | jq -r '.usage.total_tokens')
DURATION=$(echo "$RESULT" | jq -r '.duration_ms')

echo "Cost: \$$COST"
echo "Tokens: $TOKENS"
echo "Duration: ${DURATION}ms"

# Compare models
for model in opus sonnet haiku; do
  start=$(date +%s%N)
  claude -p --model $model "explain X" > /dev/null
  end=$(date +%s%N)
  echo "$model: $(( (end - start) / 1000000 ))ms"
done
```

### Q14: Auto-completion shell có support không?

Có. Most shells:

```bash
# Bash
eval "$(claude completion bash)"

# Zsh
eval "$(claude completion zsh)"

# Fish
claude completion fish | source

# Add tới ~/.bashrc, ~/.zshrc, etc. để persistent
```

### Q15: Pipe với `set -e` (strict mode) ổn không?

Cẩn thận. `claude -p` có thể return non-zero exit code nếu:

- API error
- Authentication failure
- Permission denied
- Budget cap reached

```bash
# Safer scripting với fallback
set -e

result=$(claude -p "query" 2>error.log) || {
  echo "Claude failed: $(cat error.log)"
  result="<unable to analyze>"
}
```

### Q16: `claude update` có rollback được không?

Không direct rollback. Workaround:

```bash
# Install specific version
npm install -g @anthropic-ai/claude-code@2.1.117

# Check installed version
claude --version

# List available versions
npm view @anthropic-ai/claude-code versions

# Install previous
npm install -g @anthropic-ai/claude-code@<previous-version>
```

→ Best practice: Test new version trên non-critical project trước khi update production setup.

### Q17: Có way nào lock CLI tới specific Anthropic endpoint không (cho enterprise/proxy)?

Có:

```bash
# Custom endpoint
export ANTHROPIC_BASE_URL=https://my-proxy.example.com/v1

# Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-west-2

# Vertex AI
export CLAUDE_CODE_USE_VERTEX=1
export ANTHROPIC_VERTEX_PROJECT_ID=my-project
export CLOUD_ML_REGION=us-central1
```

Cho enterprise: Configure managed settings để enforce endpoint org-wide.

## 19. 🎉 Hoàn thành 10 modules!

Đây là module cuối trong series. Bạn đã có complete reference cho:

| Module | Topic |
|:------:|-------|
| 01 | Slash Commands |
| 02 | Memory & CLAUDE.md |
| 03 | Skills |
| 04 | Subagents |
| 05 | MCP Protocol |
| 06 | Hooks |
| 07 | Plugins |
| 08 | Checkpoints & Rewind |
| 09 | Advanced Features |
| **10** | **CLI Reference** ✓ |

### Khuyến nghị áp dụng cho blog project

1. **Setup baseline** — Module 02 (CLAUDE.md), Module 06 (validation hooks)
2. **Workflow daily** — Module 01 (custom commands), Module 04 (blog-editor agent)
3. **Integration** — Module 05 (GitHub MCP, Notion MCP), Module 10 (CI/CD)
4. **Distribution** — Module 07 (`blog-toolkit` plugin)
5. **Power user** — Module 09 (Plan mode cho features lớn, Auto mode cho daily work)
6. **Safety net** — Module 08 (checkpoints khi experiment)

### Lời cuối series

Hành trình 10 modules đã đi từ command line cơ bản đến advanced automation. Recap toàn bộ workflow Claude Code:

**Layer 1 - Interaction (Module 01, 10)**

Cách bạn nói với Claude — slash commands trong REPL, CLI flags cho automation.

**Layer 2 - Knowledge (Module 02, 03, 05)**

Cách Claude biết về project — Memory persistent context, Skills reusable instructions, MCP external integration.

**Layer 3 - Execution (Module 04, 09)**

Cách Claude làm việc — Subagents specialized workers, Plan mode structured planning, Background tasks parallel execution.

**Layer 4 - Control (Module 06, 08)**

Cách bạn kiểm soát Claude — Hooks event-driven automation, Checkpoints safety net với rewind.

**Layer 5 - Distribution (Module 07)**

Cách share workflow — Plugins bundle tất cả thành package shareable.

### Triết lý cuối cùng

> **Claude Code không phải framework cần master toàn bộ.** Nó là toolkit mỗi cơ chế giải quyết một vấn đề khác nhau. Pick what you need, ignore what you don't. Bắt đầu với simplest mechanism (slash commands, CLAUDE.md), từng bước scale up khi gặp pain point cụ thể. Sau 2-3 tháng practice, bạn sẽ có toolkit cá nhân hóa hoàn toàn cho cách làm việc của mình.

Cảm ơn bạn đã theo dõi series 10-part về Claude Code. Hy vọng bộ tài liệu này giúp bạn build được những workflows tuyệt vời cho project của riêng mình.

Hãy bắt đầu hành trình bằng cách gõ `claude --help` ngay bây giờ, hoặc `/help` trong REPL. Mỗi tuần làm quen với 1 cơ chế mới, sau 2 tháng bạn sẽ thấy mình hoàn toàn khác trong cách tương tác với AI assistant. Happy coding với Claude Code! 🚀
