---
slug: claude-code-hooks
title: Claude Code Hooks - Tự động hoá lifecycle events
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Claude, AI, DevTools, Hooks]
date: '2026-04-27T12:00:00Z'
image: https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80
---

Hooks là automated scripts chạy tự động khi xảy ra event cụ thể trong Claude Code session — user submit prompt, trước/sau khi tool chạy, session start/end, config thay đổi. Hooks cho phép validation, auto-formatting, security scanning, logging, và custom workflows. Bài viết này tổng hợp 25 hook events, 4 hook types, và cách áp dụng cho project blog cá nhân.

<!-- truncate -->

# Claude Code Hooks: Từ cơ bản đến nâng cao

## 1. Hooks là gì?

**Hooks** là **automated scripts** chạy tự động khi xảy ra event cụ thể trong Claude Code session — như khi user submit prompt, trước/sau khi tool chạy, khi session bắt đầu/kết thúc, khi config thay đổi...

**4 loại hook actions:**

- **Shell commands** (`command`) — chạy bash script
- **HTTP webhooks** (`http`) — POST JSON tới remote endpoint
- **LLM prompts** (`prompt`) — Claude evaluate prompt và return decision
- **Subagent evaluations** (`agent`) — spawn subagent để verify/check

Hooks nhận **JSON input** qua stdin và communicate kết quả qua **exit codes + JSON output**.

### Use cases chính

- **Validation**: chặn dangerous commands, validate prompt
- **Auto-formatting**: tự format code sau khi Write/Edit
- **Security scanning**: detect secrets, hardcoded credentials
- **Logging & audit**: log mọi tool calls, bash commands
- **Permission management**: auto-approve safe operations
- **Notifications**: alert team qua Slack khi event xảy ra
- **Custom workflows**: integration với hệ thống bên ngoài

## 2. Configuration Files

Hooks config ở các settings files theo precedence:

| File | Scope |
|------|-------|
| `~/.claude/settings.json` | User settings (mọi projects) |
| `.claude/settings.json` | Project settings (commit git, share team) |
| `.claude/settings.local.json` | Local project (gitignored) |
| Managed policy | Org-wide enforcement |
| Plugin `hooks/hooks.json` | Plugin-scoped |
| Skill/Agent frontmatter | Component lifetime hooks |

### Cấu trúc cơ bản

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-command-here",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

### Key fields

| Field | Mô tả | Ví dụ |
|-------|-------|-------|
| `matcher` | Pattern match tool names (case-sensitive) | `"Write"`, `"Edit\|Write"`, `"*"` |
| `hooks` | Array hook definitions | `[{ "type": "command", ... }]` |
| `type` | `"command"` / `"prompt"` / `"http"` / `"agent"` | `"command"` |
| `command` | Shell command để execute | `"$CLAUDE_PROJECT_DIR/.claude/hooks/format.sh"` |
| `timeout` | Timeout giây (default 60) | `30` |
| `once` | Nếu `true`, chỉ chạy 1 lần per session | `true` |

### Matcher Patterns

| Pattern | Mô tả | Ví dụ |
|---------|-------|-------|
| Exact string | Match tool cụ thể | `"Write"` |
| Regex pattern | Match nhiều tools | `"Edit\|Write"` |
| Wildcard | Match tất cả tools | `"*"` hoặc `""` |
| MCP tools | Server và tool pattern | `"mcp__memory__.*"` |

## 3. 4 Hook Types

### a) Command Hooks (default)

Execute shell command, communicate qua JSON stdin/stdout + exit codes.

```json
{
  "type": "command",
  "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/validate.py\"",
  "timeout": 60
}
```

### b) HTTP Hooks (v2.1.63+)

Remote webhook endpoints. POST JSON tới URL, nhận JSON response.

```json
{
  "hooks": {
    "PostToolUse": [{
      "type": "http",
      "url": "https://my-webhook.example.com/hook",
      "matcher": "Write"
    }]
  }
}
```

**Properties:**

- `"type": "http"` — identifies HTTP hook
- `"url"` — webhook endpoint
- Routed qua sandbox khi sandbox enabled
- Cần explicit `allowedEnvVars` list cho env variable interpolation trong URL (security)

### c) Prompt Hooks

LLM-evaluated prompts. Hook content là prompt mà Claude đánh giá. Chủ yếu dùng với `Stop` và `SubagentStop` cho intelligent task completion checking.

```json
{
  "type": "prompt",
  "prompt": "Evaluate if Claude completed all requested tasks.",
  "timeout": 30
}
```

LLM trả về structured decision.

### d) Agent Hooks

Subagent-based verification hooks. Spawn dedicated agent để evaluate conditions hoặc perform complex checks. Khác `prompt` hook (single-turn LLM) — agent hook **dùng tools** và **multi-step reasoning**.

```json
{
  "type": "agent",
  "prompt": "Verify the code changes follow our architecture guidelines. Check the relevant design docs and compare.",
  "timeout": 120
}
```

## 4. 25 Hook Events đầy đủ

| Event | Khi nào fire | Matcher | Block? | Common use |
|-------|-------------|---------|:------:|------------|
| **SessionStart** | Session begin/resume/clear/compact | startup/resume/clear/compact | No | Environment setup |
| **InstructionsLoaded** | Sau khi CLAUDE.md/rules loaded | (none) | No | Modify/filter instructions |
| **UserPromptSubmit** | User submit prompt | (none) | ✅ Yes | Validate prompts |
| **PreToolUse** | Trước khi tool execute | Tool name | ✅ Allow/deny/ask | Validate, modify inputs |
| **PermissionRequest** | Permission dialog show | Tool name | ✅ Yes | Auto-approve/deny |
| **PostToolUse** | Sau khi tool succeed | Tool name | No | Add context, feedback |
| **PostToolUseFailure** | Tool execution fail | Tool name | No | Error handling, logging |
| **Notification** | Notification gửi đi | Notification type | No | Custom notifications |
| **SubagentStart** | Subagent spawn | Agent type | No | Subagent setup |
| **SubagentStop** | Subagent finish | Agent type | ✅ Yes | Subagent validation |
| **Stop** | Claude finish responding | (none) | ✅ Yes | Task completion check |
| **StopFailure** | API error end turn | (none) | No | Error recovery, logging |
| **TeammateIdle** | Teammate idle (Agent Teams) | (none) | ✅ Yes | Teammate coordination |
| **TaskCompleted** | Task mark complete | (none) | ✅ Yes | Post-task actions |
| **TaskCreated** | Task created via TaskCreate | (none) | No | Task tracking, logging |
| **ConfigChange** | Config file changes | (none) | ✅ (except policy) | React to config updates |
| **CwdChanged** | Working directory changes | (none) | No | Directory-specific setup |
| **FileChanged** | Watched file changes | (none) | No | File monitoring, rebuild |
| **PreCompact** | Trước context compaction | manual/auto | No | Pre-compact actions |
| **PostCompact** | Sau compaction xong | (none) | No | Post-compact actions |
| **WorktreeCreate** | Worktree tạo | (none) | ✅ (path return) | Worktree initialization |
| **WorktreeRemove** | Worktree remove | (none) | No | Worktree cleanup |
| **Elicitation** | MCP request user input | (none) | ✅ Yes | Input validation |
| **ElicitationResult** | User respond elicitation | (none) | ✅ Yes | Response processing |
| **SessionEnd** | Session terminate | (none) | No | Cleanup, final logging |

### Group theo mục đích

**Tool Lifecycle:** PreToolUse → PostToolUse / PostToolUseFailure / PermissionRequest

**Session Lifecycle:** SessionStart → InstructionsLoaded → ... → SessionEnd

**Agent/Task:** SubagentStart → SubagentStop, TaskCreated → TaskCompleted, TeammateIdle

**File/Config:** FileChanged, CwdChanged, ConfigChange

**Compaction:** PreCompact → PostCompact

**Worktree:** WorktreeCreate → WorktreeRemove

**MCP:** Elicitation → ElicitationResult

**Termination:** Stop, StopFailure, SessionEnd

## 5. Chi tiết Events quan trọng

### PreToolUse - Validation/modification tool inputs

Chạy sau khi Claude tạo tool params, **trước** khi process.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/validate-bash.py"
          }
        ]
      }
    ]
  }
}
```

**Output control:**

- `permissionDecision`: `"allow"`, `"deny"`, `"ask"`
- `permissionDecisionReason`: explanation
- `updatedInput`: modified tool input

### PostToolUse - Verification/logging sau tool

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/security-scan.py"
          }
        ]
      }
    ]
  }
}
```

**Output control:**

- `"block"` decision prompts Claude với feedback
- `additionalContext`: context add cho Claude

### UserPromptSubmit - Validate prompt user

Chạy khi user submit prompt, **trước** khi Claude process.

**Output control:**

- `decision`: `"block"` để chặn
- `reason`: explanation nếu block
- `additionalContext`: context add vào prompt

### Stop / SubagentStop - Task completion check

Chạy khi Claude xong response (Stop) hoặc subagent xong (SubagentStop). Hỗ trợ **prompt-based evaluation** cho intelligent checking.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Evaluate if Claude completed all requested tasks.",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### SessionStart - Environment setup

**Special feature:** Dùng `CLAUDE_ENV_FILE` để persist env vars:

```bash
#!/bin/bash
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=development' >> "$CLAUDE_ENV_FILE"
fi
exit 0
```

## 6. Component-Scoped Hooks

Hooks có thể attach trực tiếp vào skills/agents/commands trong frontmatter:

```yaml
---
name: secure-operations
description: Perform operations with security checks
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/check.sh"
          once: true  # Chỉ chạy 1 lần/session
---
```

**Supported events:** `PreToolUse`, `PostToolUse`, `Stop`

→ Define hook trực tiếp trong component dùng nó, giữ code liên quan together.

### Hooks trong Subagent

Khi `Stop` hook định nghĩa trong subagent frontmatter, **tự động convert** thành `SubagentStop` hook scoped cho subagent đó. Đảm bảo stop hook chỉ fire khi subagent cụ thể xong, không phải main session stop.

## 7. Hook Input/Output

### JSON Input (qua stdin)

Mỗi hook nhận JSON input qua stdin:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.js",
    "content": "..."
  },
  "tool_use_id": "toolu_01ABC123...",
  "agent_id": "agent-abc123",
  "agent_type": "main",
  "worktree": "/path/to/worktree"
}
```

### Exit Codes

| Exit Code | Ý nghĩa | Behavior |
|-----------|---------|----------|
| **0** | Success | Continue, parse JSON stdout |
| **2** | Blocking error | Block operation, stderr show as error |
| **Other** | Non-blocking error | Continue, stderr show in verbose mode |

### JSON Output (stdout, exit 0)

```json
{
  "continue": true,
  "stopReason": "Optional message if stopping",
  "suppressOutput": false,
  "systemMessage": "Optional warning message",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "File is in allowed directory",
    "updatedInput": {
      "file_path": "/modified/path.js"
    }
  }
}
```

## 8. Environment Variables

| Variable | Available | Mô tả |
|----------|-----------|-------|
| `CLAUDE_PROJECT_DIR` | All hooks | Absolute path project root |
| `CLAUDE_ENV_FILE` | SessionStart, CwdChanged, FileChanged | File để persist env vars |
| `CLAUDE_CODE_REMOTE` | All hooks | `"true"` nếu chạy remote |
| `${CLAUDE_PLUGIN_ROOT}` | Plugin hooks | Path plugin directory |
| `${CLAUDE_PLUGIN_DATA}` | Plugin hooks | Path plugin data directory |

## 9. Examples thực tế

### Example 1: Bash Command Validator (PreToolUse)

`.claude/hooks/validate-bash.py`:

```python
#!/usr/bin/env python3
import json
import sys
import re

BLOCKED_PATTERNS = [
    (r"\brm\s+-rf\s+/", "Blocking dangerous rm -rf / command"),
    (r"\bsudo\s+rm", "Blocking sudo rm command"),
]

def main():
    input_data = json.load(sys.stdin)

    tool_name = input_data.get("tool_name", "")
    if tool_name != "Bash":
        sys.exit(0)

    command = input_data.get("tool_input", {}).get("command", "")

    for pattern, message in BLOCKED_PATTERNS:
        if re.search(pattern, command):
            print(message, file=sys.stderr)
            sys.exit(2)  # Exit 2 = blocking error

    sys.exit(0)

if __name__ == "__main__":
    main()
```

Config:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/validate-bash.py\""
          }
        ]
      }
    ]
  }
}
```

### Example 2: Security Scanner (PostToolUse)

`.claude/hooks/security-scan.py`:

```python
#!/usr/bin/env python3
import json
import sys
import re

SECRET_PATTERNS = [
    (r"password\s*=\s*['\"][^'\"]+['\"]", "Potential hardcoded password"),
    (r"api[_-]?key\s*=\s*['\"][^'\"]+['\"]", "Potential hardcoded API key"),
]

def main():
    input_data = json.load(sys.stdin)

    tool_name = input_data.get("tool_name", "")
    if tool_name not in ["Write", "Edit"]:
        sys.exit(0)

    tool_input = input_data.get("tool_input", {})
    content = tool_input.get("content", "") or tool_input.get("new_string", "")
    file_path = tool_input.get("file_path", "")

    warnings = []
    for pattern, message in SECRET_PATTERNS:
        if re.search(pattern, content, re.IGNORECASE):
            warnings.append(message)

    if warnings:
        output = {
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": f"Security warnings for {file_path}: " + "; ".join(warnings)
            }
        }
        print(json.dumps(output))

    sys.exit(0)

if __name__ == "__main__":
    main()
```

### Example 3: Auto-Format Code (PostToolUse)

`.claude/hooks/format-code.sh`:

```bash
#!/bin/bash

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('tool_name', ''))")
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('tool_input', {}).get('file_path', ''))")

if [ "$TOOL_NAME" != "Write" ] && [ "$TOOL_NAME" != "Edit" ]; then
    exit 0
fi

case "$FILE_PATH" in
    *.js|*.jsx|*.ts|*.tsx|*.json)
        command -v prettier &>/dev/null && prettier --write "$FILE_PATH" 2>/dev/null
        ;;
    *.py)
        command -v black &>/dev/null && black "$FILE_PATH" 2>/dev/null
        ;;
    *.go)
        command -v gofmt &>/dev/null && gofmt -w "$FILE_PATH" 2>/dev/null
        ;;
esac

exit 0
```

### Example 4: Intelligent Stop Hook (Prompt-Based)

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Review if Claude completed all requested tasks. Check: 1) Were all files created/modified? 2) Were there unresolved errors? If incomplete, explain what's missing.",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

## 10. Plugin Hooks

Plugins có thể include hooks trong `hooks/hooks.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
          }
        ]
      }
    ]
  }
}
```

## 11. Security Considerations

### ⚠️ Disclaimer

**USE AT YOUR OWN RISK:** Hooks execute arbitrary shell commands. Bạn solely responsible cho:

- Commands bạn config
- File access/modification permissions
- Potential data loss hoặc system damage
- Test hooks trong safe environments trước production

### Best Practices

| ✅ Do | ❌ Don't |
|-------|----------|
| Validate và sanitize all inputs | Trust input data blindly |
| Quote shell variables: `"$VAR"` | Use unquoted: `$VAR` |
| Block path traversal (`..`) | Allow arbitrary paths |
| Use absolute paths với `$CLAUDE_PROJECT_DIR` | Hardcode paths |
| Skip sensitive files (`.env`, `.git/`, keys) | Process all files |
| Test hooks trong isolation trước | Deploy untested hooks |
| Use explicit `allowedEnvVars` cho HTTP hooks | Expose all env vars to webhooks |

## 12. Debugging

### Enable Debug Mode

```bash
claude --debug
```

### Verbose Mode

`Ctrl+O` trong Claude Code để enable verbose mode, xem hook execution progress.

### Test Hooks Independently

```bash
# Test với sample JSON input
echo '{"tool_name": "Bash", "tool_input": {"command": "ls -la"}}' | python3 .claude/hooks/validate-bash.py

# Check exit code
echo $?
```

## 13. Hook Execution Details

| Aspect | Behavior |
|--------|----------|
| **Timeout** | 60s default, configurable per command |
| **Parallelization** | All matching hooks chạy parallel |
| **Deduplication** | Identical hook commands deduplicated |
| **Environment** | Run trong cwd với Claude Code's environment |

## 14. Workflow ứng dụng cho Blog Project

Cho project blog Next.js cá nhân, đây là 6 hooks hữu ích:

### Hook 1: Auto-format files khi write/edit (PostToolUse)

`.claude/hooks/format-blog-files.sh`:

```bash
#!/bin/bash

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('tool_name', ''))")
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('tool_input', {}).get('file_path', ''))")

if [ "$TOOL_NAME" != "Write" ] && [ "$TOOL_NAME" != "Edit" ]; then
    exit 0
fi

# Skip nếu không phải file của project
case "$FILE_PATH" in
    *.tsx|*.ts|*.md|*.json|*.css)
        cd "$CLAUDE_PROJECT_DIR" && npx prettier --write "$FILE_PATH" 2>/dev/null
        ;;
esac

exit 0
```

### Hook 2: Validate frontmatter blog post (PostToolUse)

`.claude/hooks/validate-frontmatter.py`:

```python
#!/usr/bin/env python3
"""Validate frontmatter của blog files mới tạo trong blog/"""
import json
import sys
import re
from pathlib import Path

REQUIRED_FIELDS = ["title", "slug", "date", "tags"]

def main():
    data = json.load(sys.stdin)
    tool_name = data.get("tool_name", "")
    file_path = data.get("tool_input", {}).get("file_path", "")

    if tool_name not in ["Write", "Edit"]:
        sys.exit(0)
    if "blog/" not in file_path or not file_path.endswith(".md"):
        sys.exit(0)

    if not Path(file_path).exists():
        sys.exit(0)

    content = Path(file_path).read_text()
    fm_match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)

    if not fm_match:
        output = {
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": f"⚠️ {file_path}: Missing frontmatter. Add YAML frontmatter at top with title, slug, date, tags."
            }
        }
        print(json.dumps(output))
        sys.exit(0)

    fm = fm_match.group(1)
    missing = [f for f in REQUIRED_FIELDS if f"{f}:" not in fm]

    warnings = []
    if missing:
        warnings.append(f"Missing fields: {', '.join(missing)}")

    # Check title length
    title_match = re.search(r"title:\s*['\"]?(.+?)['\"]?$", fm, re.MULTILINE)
    if title_match:
        title = title_match.group(1)
        if len(title) > 60:
            warnings.append(f"Title {len(title)} chars > 60 (SEO): rút xuống ≤60")

    if warnings:
        output = {
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": f"📝 Blog frontmatter check for {file_path}:\n" + "\n".join(f"  - {w}" for w in warnings)
            }
        }
        print(json.dumps(output))

    sys.exit(0)

if __name__ == "__main__":
    main()
```

### Hook 3: Block dangerous commands (PreToolUse)

`.claude/hooks/block-dangerous.py`:

```python
#!/usr/bin/env python3
import json
import sys
import re

BLOCKED = [
    (r"rm\s+-rf\s+/", "Block rm -rf /"),
    (r"git\s+push\s+--force(?!-with-lease)", "Force push không được phép - dùng --force-with-lease"),
    (r"git\s+reset\s+--hard\s+HEAD~\d{2,}", "Reset --hard quá nhiều commits"),
    (r"DROP\s+(DATABASE|TABLE)", "Block SQL destructive operations"),
    (r"vercel\s+remove", "Không xoá Vercel project tự động"),
]

def main():
    data = json.load(sys.stdin)
    if data.get("tool_name") != "Bash":
        sys.exit(0)

    cmd = data.get("tool_input", {}).get("command", "")
    for pattern, msg in BLOCKED:
        if re.search(pattern, cmd, re.IGNORECASE):
            print(f"BLOCKED: {msg}\nCommand: {cmd}", file=sys.stderr)
            sys.exit(2)

    sys.exit(0)

if __name__ == "__main__":
    main()
```

### Hook 4: Slack notification khi commit (PostToolUse)

`.claude/hooks/notify-slack.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('tool_name', ''))")
COMMAND=$(echo "$INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('tool_input', {}).get('command', ''))")

# Chỉ notify nếu là git commit thành công
if [[ "$TOOL_NAME" == "Bash" && "$COMMAND" == *"git commit"* ]]; then
    BRANCH=$(git -C "$CLAUDE_PROJECT_DIR" branch --show-current 2>/dev/null)
    LATEST=$(git -C "$CLAUDE_PROJECT_DIR" log -1 --pretty=format:"%h %s" 2>/dev/null)

    curl -s -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"📝 Blog commit on \`$BRANCH\`: $LATEST\"}" \
        "$SLACK_WEBHOOK_URL" 2>/dev/null
fi

exit 0
```

### Hook 5: Stop hook - verify post hoàn chỉnh (Prompt-based)

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Nếu Claude vừa tạo/sửa blog post, kiểm tra: 1) Frontmatter đầy đủ (title, slug, date, tags)? 2) Có code blocks language tag không? 3) Image alt texts? 4) Internal links tới related posts? Nếu thiếu, suggest specific fixes. Nếu OK, return 'Done'.",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### Hook 6: Session init - load env vars (SessionStart)

`.claude/hooks/session-init.sh`:

```bash
#!/bin/bash
# Load env vars cho blog project
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NEXT_TELEMETRY_DISABLED=1' >> "$CLAUDE_ENV_FILE"
  echo 'export NODE_ENV=development' >> "$CLAUDE_ENV_FILE"
fi
exit 0
```

### Settings file đầy đủ cho blog

`.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR/.claude/hooks/session-init.sh\""
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/block-dangerous.py\"",
            "timeout": 5
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR/.claude/hooks/format-blog-files.sh\"",
            "timeout": 30
          },
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/validate-frontmatter.py\"",
            "timeout": 10
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR/.claude/hooks/notify-slack.sh\"",
            "timeout": 5
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Verify blog post completeness: frontmatter, code blocks language tags, alt texts, internal links.",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

## 15. Câu hỏi thường gặp (FAQ)

### Q1: Hooks vs Subagents khác gì?

| Khía cạnh | Hooks | Subagents |
|-----------|-------|-----------|
| **Trigger** | Event-driven (tự động khi event xảy ra) | Delegate-driven (main agent gọi) |
| **Output** | Exit code + JSON, có thể block flow | Conversation result |
| **Use case** | Validation, automation, logging | Specialized AI work |
| **Reasoning** | Static script (trừ prompt/agent type) | Full LLM reasoning |
| **Speed** | Rất nhanh (script) | Chậm (gọi LLM) |
| **Tools available** | Bash, file ops trong script | Configurable, full Claude tools |

→ Dùng Hooks cho **automation rules** (deterministic). Dùng Subagents cho **specialized tasks** cần reasoning.

### Q2: Khi nào dùng `command` vs `prompt` vs `agent` hook?

| Type | Khi dùng |
|------|----------|
| **command** | Validation đơn giản, format code, log, notify — kết quả deterministic |
| **prompt** | Single-turn LLM evaluation — "đã xong chưa?" "có lỗi gì không?" |
| **agent** | Complex multi-step verification cần Read files, Grep, run commands |
| **http** | Notify external services, integrate với CI/CD, webhook cho team |

Performance: command < http < prompt < agent (chậm dần)

### Q3: Hook có thể block Claude làm gì không?

Có, **một số events** có thể block:

✅ **Block được:** PreToolUse, PermissionRequest, UserPromptSubmit, Stop, SubagentStop, ConfigChange, TeammateIdle, TaskCompleted, Elicitation, ElicitationResult, WorktreeCreate

❌ **Không block:** PostToolUse, PostToolUseFailure, Notification, SessionStart, SessionEnd, FileChanged, CwdChanged, Task tracking events, Compaction events...

**Cách block:**

- `command` hook: exit code 2
- `prompt` hook: return `"decision": "block"`
- `agent` hook: return decision tương tự prompt

### Q4: Hook chậm quá làm Claude lag, fix sao?

1. **Set timeout thấp** cho hooks không critical (5-10s thay vì 60s default)
2. **Specific matcher** thay vì `"*"` — không trigger không cần
3. **Dùng `once: true`** cho hooks chỉ cần chạy 1 lần/session
4. **Async pattern** với `command` hook: fire-and-forget bằng `&` ở cuối:

```bash
#!/bin/bash
(slow_task &) >/dev/null 2>&1
exit 0
```

5. **HTTP hook** thay vì command nếu có server xử lý nặng (server async)
6. **Avoid `prompt`/`agent` hook** cho events high-frequency

### Q5: Multiple hooks cùng event chạy thế nào?

**Parallel** — tất cả matching hooks cùng event chạy đồng thời. Identical hook commands được deduplicated.

Hệ quả:

- Nhanh hơn sequential
- Nhưng không guarantee order — nếu hook A cần output của B, dùng 1 hook duy nhất chứ đừng tách
- Race conditions có thể xảy ra với shared resources (file, DB) → lock cẩn thận

### Q6: Hook fail làm sao recover?

Tuỳ event:

- **Blocking events** (PreToolUse...) hook fail (exit !=0, !=2) → log warning, **continue normally**
- **Non-blocking events** (PostToolUse...) → log warning, continue
- **Timeout** → continue, log timeout

Hooks **không** stop session khi fail (trừ khi explicit block với exit 2). Verbose mode (`Ctrl+O`) để xem errors.

### Q7: Hook có thấy data nhạy cảm trong tool inputs không?

**Có**. Ví dụ:

- Write tool input có `content` (full file content)
- Bash tool input có `command` (full command line)
- Edit tool input có `old_string`, `new_string`

→ Nếu file/command chứa secrets, hook nhìn thấy. **Đừng log toàn bộ input** vào file public hoặc gửi qua HTTP không secure.

### Q8: Disable tất cả hooks cho 1 session làm sao?

```bash
# Per-session
CLAUDE_DISABLE_HOOKS=1 claude

# Hoặc setting
{
  "disableAllHooks": true
}
```

> Setting `disableAllHooks` respect managed settings hierarchy → org level có thể enforce, user override không được.

### Q9: Hook output có vào context của Claude không?

Có, **một số fields** vào context:

- `additionalContext` (PostToolUse, UserPromptSubmit) → append vào Claude's context
- `systemMessage` → show as warning to user
- `permissionDecisionReason` → show with permission decisions

Còn lại (stderr, regular stdout không phải JSON) chỉ log/display, không vào context.

### Q10: Hook trên Windows có khác Linux/Mac không?

Có:

- Path separator: `\` thay vì `/` trong một số cases
- Bash hooks cần Git Bash, WSL, hoặc PowerShell-compatible
- Use `.ps1` cho PowerShell hooks
- `$CLAUDE_PROJECT_DIR` hoạt động bình thường

Best practice: write hooks bằng Python (cross-platform) thay vì bash để tránh OS-specific issues.

### Q11: Test hook trước khi deploy bằng cách nào?

1. **Standalone test:**

```bash
echo '{"tool_name": "Bash", "tool_input": {"command": "ls"}}' | python3 ./hook.py
echo $?
```

2. **Trong Claude Code với debug:**

```bash
claude --debug
```

Trigger event để xem hook log.

3. **Verbose mode:** `Ctrl+O` trong session để xem hook execution real-time.

4. **Sandbox project:** Test trên project test trước khi commit hook vào project quan trọng.

### Q12: Hook vs Skills auto-invocation khác gì?

| Khía cạnh | Hook | Skill auto-invocation |
|-----------|------|----------------------|
| Trigger | Event Claude Code (tool, session...) | Description match + Claude judgment |
| Cơ chế | Deterministic (event always fires) | Probabilistic (Claude chọn) |
| Có block flow | Có (một số events) | Không, chỉ load context |
| Phù hợp | Validation rules, automation | Provide capability, instructions |

Hook = "phải chạy theo rule". Skill = "có thể tham khảo nếu phù hợp".

### Q13: Storing state giữa hooks (e.g. context-tracker), best practice?

Dùng **temp files** với **session_id** isolate:

```python
import tempfile, os
state_file = os.path.join(tempfile.gettempdir(), f"claude-{session_id}-{event}.json")
```

Hoặc env vars persisted qua `CLAUDE_ENV_FILE`:

```bash
echo 'export MY_STATE=value' >> "$CLAUDE_ENV_FILE"
```

**Tránh:** global state (file ở fixed path) → race conditions giữa parallel sessions.

### Q14: Component-scoped hooks (trong frontmatter skill/agent) khác global hooks ra sao?

| Khía cạnh | Global hooks (settings.json) | Component-scoped (frontmatter) |
|-----------|------------------------------|--------------------------------|
| Scope | Mọi events trong session | Chỉ khi component đó active |
| Define | `~/.claude/settings.json` hoặc project | Trong SKILL.md/agent.md frontmatter |
| Lifetime | Session lifetime | Component lifetime |
| Events | All 25 events | Chỉ PreToolUse, PostToolUse, Stop |
| Use case | Cross-cutting concerns (security, logging) | Component-specific behavior |

Component-scoped hooks hữu ích để skill/agent có "side effects" của riêng nó mà không pollute global config.

### Q15: Hook có thể modify tool input không?

Có, qua `updatedInput` trong PreToolUse output:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "updatedInput": {
      "file_path": "/sanitized/path.js"
    }
  }
}
```

→ Sanitize paths, redact secrets, normalize input trước khi tool execute.

## 16. Kết luận

Hooks là cơ chế automation mạnh nhất trong Claude Code — biến Claude từ "AI helper" thành "AI tích hợp sâu vào workflow". Khuyến nghị:

1. **Bắt đầu với 1-2 hooks đơn giản** — `block-dangerous.py` (PreToolUse) và `format-code.sh` (PostToolUse) là 2 hooks hữu ích nhất
2. **Test kỹ trước khi enable** — hook chạy mọi tool call, lỗi sẽ ảnh hưởng workflow
3. **Set timeout thấp** — hooks không critical chỉ nên 5-10s
4. **Dùng exit code 2 để block** — pattern chuẩn cho dangerous operations
5. **Component-scoped hooks** — gắn hook vào skill/agent nó phục vụ thay vì global
6. **Prompt/agent hooks cho complex evaluation** — Stop hook với prompt để verify task completeness
7. **Security trên hết** — sanitize inputs, quote variables, skip sensitive files

Kết hợp với 5 module trước (Slash Commands, Memory, Skills, Subagents, MCP), Hooks là mảnh ghép cuối cùng cho automation workflow toàn diện. Mỗi cơ chế giải quyết một khía cạnh khác nhau:

- **Slash Commands** — shortcuts gõ tay
- **Memory** — context persistence
- **Skills** — reusable instructions
- **Subagents** — specialized AI workers
- **MCP** — external integration
- **Hooks** — event-driven automation

Hãy bắt đầu bằng cách thêm 1 hook validation đơn giản vào `~/.claude/settings.json`, test trên project nhỏ, rồi mở rộng dần khi quen!
