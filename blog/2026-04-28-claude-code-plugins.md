---
slug: claude-code-plugins
title: Claude Code Plugins - Đóng gói toàn bộ workflow
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Claude, AI, DevTools, Plugins]
date: '2026-04-28T12:00:00Z'
image: https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=1200&auto=format&fit=crop&q=80
---

Plugins là bộ sưu tập đóng gói các customization của Claude Code (slash commands + subagents + MCP servers + hooks + skills) cài đặt chỉ với 1 lệnh duy nhất. Đây là extension mechanism cao nhất — combine 6 module trước thành package shareable. Bài viết này tổng hợp Plugin structure, marketplace, LSP support, và cách build plugin cho project blog cá nhân.

<!-- truncate -->

# Claude Code Plugins: Từ cơ bản đến nâng cao

## 1. Plugins là gì?

**Plugins** là **bộ sưu tập đóng gói** các customization của Claude Code (slash commands + subagents + MCP servers + hooks + skills) cài đặt **chỉ với 1 lệnh duy nhất**. Đây là extension mechanism cao nhất — combine nhiều features thành package shareable.

### Plugin = Bundle các module 01-06

```
            Plugin
              ↓
   ┌──────────┼──────────┬──────────┬──────────┐
   │          │          │          │          │
Slash      Subagents   MCP       Hooks      Skills
Commands               Servers
```

### Vì sao dùng Plugin?

**Manual Setup (2+ giờ):**

- Cài slash commands từng cái
- Tạo subagents từng cái
- Config MCPs riêng
- Setup hooks manually
- Document tất cả
- Share team (hy vọng họ config đúng)

**With Plugin (2 phút):**

```bash
/plugin install pr-review
# → Mọi thứ installed + configured
# → Sẵn sàng dùng ngay
# → Team reproduce setup giống hệt
```

## 2. Plugin Loading Process

```
User: /plugin install pr-review
   ↓
Claude Code → Plugin Marketplace
   ↓ Download manifest
Claude Code → Extract components
   ├── Slash Commands → Configure
   ├── Subagents → Configure
   ├── MCP Servers → Configure
   ├── Hooks → Configure
   └── Skills → Configure
   ↓
Plugin installed ✓
```

## 3. Plugin Types & Distribution

| Type | Scope | Share | Authority | Examples |
|------|-------|-------|-----------|----------|
| **Official** | Global | All users | Anthropic | PR Review, Security Guidance |
| **Community** | Public | All users | Community | DevOps, Data Science |
| **Organization** | Internal | Team members | Company | Internal standards |
| **Personal** | Individual | Single user | Developer | Custom workflows |

### Official Plugins (anthropics/claude-plugins-official)

Marketplace chính thức của Anthropic có 13+ plugins quality-curated:

- `code-review` — Automated PR review với multi-agent architecture
- `commit-commands` — Git commit workflows
- `pr-review-toolkit` — Comprehensive PR review agents
- `frontend-design` — Frontend-design skill
- `feature-dev` — Feature development workflow
- `claude-opus-4-5-migration` — Auto migration model strings
- `explanatory-output-style` — Educational insights
- `learning-output-style` — Interactive learning mode
- `hookify` — Custom hook creation via markdown
- `plugin-dev` — Plugin development toolkit
- `security-guidance` — Security best practices

## 4. Plugin Structure

### Manifest đơn giản

`.claude-plugin/plugin.json`:

```json
{
  "name": "my-first-plugin",
  "description": "A greeting plugin",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  },
  "homepage": "https://example.com",
  "repository": "https://github.com/user/repo",
  "license": "MIT"
}
```

### Plugin Structure đầy đủ

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # Manifest (name, version, author...)
├── commands/                # Slash commands (Markdown files)
│   ├── task-1.md
│   └── task-2.md
├── agents/                  # Subagent definitions
│   ├── specialist-1.md
│   └── specialist-2.md
├── skills/                  # Skills với SKILL.md
│   ├── skill-1/
│   │   └── SKILL.md
│   └── skill-2/
│       └── SKILL.md
├── hooks/                   # Event handlers
│   └── hooks.json
├── .mcp.json                # MCP server configs
├── .lsp.json                # LSP server configs
├── bin/                     # Executables thêm vào PATH khi plugin enabled
├── settings.json            # Default settings
├── templates/               # Templates dùng được
├── scripts/                 # Helper scripts
├── docs/                    # Documentation
└── tests/                   # Plugin tests
```

> **Required:** `.claude-plugin/plugin.json` + (commands hoặc agents hoặc skills hoặc hooks). Phần khác optional.

## 5. LSP Server Configuration

Plugins có thể include **Language Server Protocol** support cho real-time code intelligence: diagnostics, code navigation, symbol info.

**Configuration locations:**

- `.lsp.json` ở plugin root
- Inline `lsp` key trong `plugin.json`

### Examples

**Go (gopls):**

```json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": {
      ".go": "go"
    }
  }
}
```

**Python (pyright):**

```json
{
  "python": {
    "command": "pyright-langserver",
    "args": ["--stdio"],
    "extensionToLanguage": {
      ".py": "python",
      ".pyi": "python"
    }
  }
}
```

**TypeScript:**

```json
{
  "typescript": {
    "command": "typescript-language-server",
    "args": ["--stdio"],
    "extensionToLanguage": {
      ".ts": "typescript",
      ".tsx": "typescriptreact",
      ".js": "javascript",
      ".jsx": "javascriptreact"
    }
  }
}
```

### LSP Capabilities

Khi config xong, LSP servers cung cấp:

- **Instant diagnostics** — errors/warnings hiển thị ngay sau edits
- **Code navigation** — go to definition, find references, implementations
- **Hover information** — type signatures và documentation
- **Symbol listing** — browse symbols trong file/workspace

## 6. Plugin Options & User Config

Plugins có thể declare **user-configurable options** trong manifest qua `userConfig`. Values với `sensitive: true` lưu trong **system keychain**:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "userConfig": {
    "apiKey": {
      "description": "API key for the service",
      "sensitive": true
    },
    "region": {
      "description": "Deployment region",
      "default": "us-east-1"
    }
  }
}
```

## 7. Persistent Plugin Data

Plugins có **persistent state directory** qua env variable `${CLAUDE_PLUGIN_DATA}`. Directory unique per plugin, **survive across sessions** — phù hợp cho caches, databases, persistent state:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "command": "node ${CLAUDE_PLUGIN_DATA}/track-usage.js"
      }
    ]
  }
}
```

Directory tự tạo khi plugin install, tồn tại tới khi uninstall.

## 8. Plugin Marketplace

### Marketplace Schema

`.claude-plugin/marketplace.json`:

```json
{
  "name": "my-team-plugins",
  "owner": "my-org",
  "plugins": [
    {
      "name": "code-standards",
      "source": "./plugins/code-standards",
      "description": "Enforce team coding standards",
      "version": "1.2.0",
      "author": "platform-team"
    },
    {
      "name": "deploy-helper",
      "source": {
        "source": "github",
        "repo": "my-org/deploy-helper",
        "ref": "v2.0.0"
      },
      "description": "Deployment automation"
    }
  ]
}
```

### Plugin Source Types

| Source | Syntax | Example |
|--------|--------|---------|
| **Relative path** | String | `"./plugins/my-plugin"` |
| **GitHub** | `{source, repo}` | `{ "source": "github", "repo": "acme/lint-plugin", "ref": "v1.0" }` |
| **Git URL** | `{source, url}` | `{ "source": "url", "url": "https://git.internal/plugin.git" }` |
| **Git subdirectory** | `{source, url, path}` | `{ "source": "git-subdir", "url": "...", "path": "packages/plugin" }` |
| **npm** | `{source, package}` | `{ "source": "npm", "package": "@acme/claude-plugin", "version": "^2.0" }` |
| **pip** | `{source, package}` | `{ "source": "pip", "package": "claude-data-plugin", "version": ">=1.0" }` |

### Distribution Methods

**GitHub (recommended):**

```bash
/plugin marketplace add owner/repo-name
```

**Other git services:**

```bash
/plugin marketplace add https://gitlab.com/org/marketplace-repo.git
```

**Private repositories:** Support qua git credential helpers hoặc env tokens.

### Strict Mode

Control xem marketplace definitions tương tác với local `plugin.json`:

| Setting | Behavior |
|---------|----------|
| `strict: true` (default) | Local `plugin.json` authoritative; marketplace entry supplement |
| `strict: false` | Marketplace entry là toàn bộ plugin definition |

### Organization Restrictions

```json
{
  "strictKnownMarketplaces": [
    "my-org/*",
    "github.com/trusted-vendor/*"
  ]
}
```

→ Trong strict mode, user chỉ install được plugins từ allowlisted marketplaces — hữu ích cho enterprise.

## 9. Plugin CLI Commands

```bash
# Install từ marketplace
claude plugin install <name>@<marketplace>

# Uninstall
claude plugin uninstall <name>

# List installed
claude plugin list

# Enable/disable
claude plugin enable <name>
claude plugin disable <name>

# Validate plugin structure
claude plugin validate
```

### Slash Commands tương đương

```
/plugin install plugin-name
/plugin uninstall plugin-name
/plugin list
/plugin enable plugin-name
/plugin disable plugin-name
/plugin update plugin-name
/plugin info plugin-name
```

## 10. Installation Methods

### From Marketplace

```
/plugin install plugin-name
```

### From GitHub

```
/plugin install github:username/repo
```

### Local (cho development)

```bash
# CLI flag (repeatable cho nhiều plugins)
claude --plugin-dir ./path/to/plugin
claude --plugin-dir ./plugin-a --plugin-dir ./plugin-b
```

### Hot-Reload trong Development

Plugins support hot-reload. Modify plugin files, Claude Code detect changes automatically. Force reload:

```
/reload-plugins
```

→ Re-read all plugin manifests, commands, agents, skills, hooks, MCP/LSP configs **không cần restart session**.

## 11. Examples thực tế

### Example 1: PR Review Plugin

`.claude-plugin/plugin.json`:

```json
{
  "name": "pr-review",
  "version": "1.0.0",
  "description": "Complete PR review workflow with security, testing, and docs",
  "author": {
    "name": "Anthropic"
  },
  "repository": "https://github.com/your-org/pr-review",
  "license": "MIT"
}
```

`commands/review-pr.md`:

```markdown
---
name: Review PR
description: Start comprehensive PR review with security and testing checks
---

# PR Review

Initiates complete pull request review:
1. Security analysis
2. Test coverage verification
3. Documentation updates
4. Code quality checks
5. Performance impact assessment
```

`agents/security-reviewer.md`:

```markdown
---
name: security-reviewer
description: Security-focused code review
tools: read, grep, diff
---

# Security Reviewer

Specializes in:
- Authentication/authorization issues
- Data exposure
- Injection attacks
- Secure configuration
```

**Installation result:**

```
/plugin install pr-review

✓ 3 slash commands installed
✓ 3 subagents configured
✓ 2 MCP servers connected
✓ 4 hooks registered
✓ Ready to use!
```

### Example 2: DevOps Plugin

```
devops-automation/
├── commands/
│   ├── deploy.md
│   ├── rollback.md
│   ├── status.md
│   └── incident.md
├── agents/
│   ├── deployment-specialist.md
│   ├── incident-commander.md
│   └── alert-analyzer.md
├── mcp/
│   ├── github-config.json
│   ├── kubernetes-config.json
│   └── prometheus-config.json
├── hooks/
│   ├── pre-deploy.js
│   ├── post-deploy.js
│   └── on-error.js
└── scripts/
    ├── deploy.sh
    ├── rollback.sh
    └── health-check.sh
```

## 12. Khi nào tạo Plugin?

```
Should I create a plugin?
   ↓
   ├─ Multiple commands/subagents/MCPs? → ✓ Create Plugin
   │
   ├─ Share với team?                  → ✓ Create Plugin
   │
   ├─ Cần auto-configuration?          → ✓ Create Plugin
   │
   ├─ Single domain expertise          → ✗ Use Skill
   ├─ Quick task                        → ✗ Use Command
   └─ Live data access                  → ✗ Use MCP
```

### Plugin Use Cases

| Use Case | Recommendation | Lý do |
|----------|----------------|-------|
| Team Onboarding | ✓ Plugin | Instant setup, all configs |
| Framework Setup | ✓ Plugin | Bundle framework-specific commands |
| Enterprise Standards | ✓ Plugin | Central distribution, version control |
| Quick Task Automation | ✗ Command | Overkill |
| Single Domain Expertise | ✗ Skill | Quá heavy |
| Specialized Analysis | ✗ Subagent | Tạo manually |
| Live Data Access | ✗ MCP | Standalone, không bundle |

## 13. Plugin Features Comparison

| Feature | Slash Command | Skill | Subagent | Plugin |
|---------|:-------------:|:-----:|:--------:|:------:|
| **Installation** | Manual copy | Manual copy | Manual config | 1 command |
| **Setup time** | 5 phút | 10 phút | 15 phút | 2 phút |
| **Bundling** | Single file | Single file | Single file | Multiple |
| **Versioning** | Manual | Manual | Manual | Automatic |
| **Team sharing** | Copy file | Copy file | Copy file | Install ID |
| **Updates** | Manual | Manual | Manual | Auto-available |
| **Dependencies** | None | None | None | Có thể có |
| **Marketplace** | ✗ | ✗ | ✗ | ✓ |

## 14. Plugin Security

### Plugin Subagents Sandbox

Plugin subagents chạy trong **restricted sandbox**. Frontmatter keys **không cho phép**:

- `hooks` — Subagents không register event handlers
- `mcpServers` — Subagents không config MCP servers
- `permissionMode` — Subagents không override permission model

→ Đảm bảo plugins không escalate privileges hoặc modify host environment ngoài declared scope.

### Managed Settings cho Plugins

Admins control plugin behavior org-wide:

| Setting | Mô tả |
|---------|-------|
| `enabledPlugins` | Allowlist plugins enabled by default |
| `deniedPlugins` | Blocklist plugins không cho install |
| `extraKnownMarketplaces` | Add marketplace sources beyond defaults |
| `strictKnownMarketplaces` | Restrict marketplaces user được add |
| `allowedChannelPlugins` | Control plugins per release channel |

Settings áp dụng ở org level, **takes precedence** trên user-level.

## 15. Publishing Plugin

**Steps:**

1. Tạo plugin structure với all components
2. Viết `.claude-plugin/plugin.json` manifest
3. Tạo `README.md` documentation
4. Test local: `claude --plugin-dir ./my-plugin`
5. Submit tới plugin marketplace
6. Get reviewed + approved
7. Published trên marketplace
8. Users install với 1 command

### Plugin README Template

```markdown
# PR Review Plugin

## Description
Complete PR review workflow with security, testing, and documentation checks.

## What's Included
- 3 slash commands for different review types
- 3 specialized subagents
- GitHub and CodeQL MCP integration
- Automated security scanning hooks

## Installation
\`\`\`bash
/plugin install pr-review
\`\`\`

## Features
✓ Security analysis
✓ Test coverage checking
✓ Documentation verification
✓ Code quality assessment
✓ Performance impact analysis

## Usage
\`\`\`
/review-pr
/check-security
/check-tests
\`\`\`

## Requirements
* Claude Code 1.0+
* GitHub access
* CodeQL (optional)
```

## 16. Best Practices

### ✅ Do's

- Tên plugin rõ ràng, descriptive
- README đầy đủ
- Version đúng semver (`1.0.0`)
- Test all components together
- Document requirements rõ ràng
- Provide usage examples
- Error handling
- Tag appropriately for discovery
- Maintain backward compatibility
- Plugin focused và cohesive
- Comprehensive tests
- Document dependencies

### ❌ Don'ts

- Bundle unrelated features
- Hardcode credentials
- Skip testing
- Quên documentation
- Tạo redundant plugins
- Ignore versioning
- Overcomplicate component dependencies
- Quên error handling

## 17. Workflow ứng dụng cho Blog Project

Cho project blog Next.js cá nhân, đây là plugin mẫu **`blog-toolkit`** có thể tạo và share lên GitHub:

### Cấu trúc plugin

```
blog-toolkit/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── new-post.md
│   ├── publish.md
│   └── seo-audit.md
├── agents/
│   ├── blog-editor.md
│   ├── seo-auditor.md
│   └── code-snippet-tester.md
├── skills/
│   └── blog-post-writer/
│       └── SKILL.md
├── hooks/
│   └── hooks.json
├── .mcp.json
├── .lsp.json
├── templates/
│   ├── post-skeleton.md
│   └── frontmatter.yml
├── scripts/
│   └── optimize-images.sh
└── README.md
```

### `.claude-plugin/plugin.json`

```json
{
  "name": "blog-toolkit",
  "version": "1.0.0",
  "description": "Complete toolkit for personal Next.js blog: post writing, SEO, image optimization, publishing workflow",
  "author": {
    "name": "Pin Nguyen",
    "url": "https://github.com/PinNguyen9x"
  },
  "repository": "https://github.com/PinNguyen9x/blog-toolkit",
  "license": "MIT",
  "userConfig": {
    "vercelToken": {
      "description": "Vercel API token for deploy notifications",
      "sensitive": true
    },
    "blogContentPath": {
      "description": "Path to blog content directory",
      "default": "blog"
    },
    "imageQuality": {
      "description": "WebP compression quality (1-100)",
      "default": "85"
    }
  }
}
```

### `.lsp.json` (cho TypeScript intelligence)

```json
{
  "typescript": {
    "command": "typescript-language-server",
    "args": ["--stdio"],
    "extensionToLanguage": {
      ".ts": "typescript",
      ".tsx": "typescriptreact",
      ".md": "markdown"
    }
  }
}
```

### `.mcp.json` (bundle GitHub + filesystem)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-filesystem",
        "${CLAUDE_PROJECT_DIR}/blog"
      ]
    }
  }
}
```

### `hooks/hooks.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format-and-validate.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Nếu Claude vừa tạo/sửa blog post, kiểm tra: 1) Frontmatter đầy đủ? 2) Code blocks có language tag? 3) Image alt texts? Báo cáo issues nếu có."
          }
        ]
      }
    ]
  }
}
```

### `commands/new-post.md`

```markdown
---
name: new-post
description: Create new blog post skeleton with proper frontmatter
argument-hint: [post-title]
---

Create a new blog post at blog/<date>-<slug>.md using template ${CLAUDE_PLUGIN_ROOT}/templates/post-skeleton.md.

Steps:
1. Generate slug from "$ARGUMENTS" (kebab-case, không dấu tiếng Việt)
2. Copy template tới blog/<date>-<slug>.md
3. Replace placeholders với:
   - title: "$ARGUMENTS"
   - date: today's ISO date
   - slug: <slug>
   - tags: <suggest 3-5 tags based on title>
4. Open file ready for writing
```

### Use case khi share lên GitHub

Push plugin lên `github.com/PinNguyen9x/blog-toolkit`, anyone có thể install:

```bash
/plugin marketplace add PinNguyen9x/blog-toolkit
/plugin install blog-toolkit@pin-blog-tools
```

→ Họ có ngay:

- 3 slash commands (new-post, publish, seo-audit)
- 3 subagents (editor, SEO auditor, code tester)
- 1 skill (blog-post-writer với template)
- Pre-configured GitHub + Filesystem MCP
- Hooks tự format + validate
- TypeScript LSP cho code intelligence

Update plugin: bump version `1.0.0` → `1.0.1` trong `plugin.json`, push commit. Users chạy `/plugin update blog-toolkit` để có version mới.

## 18. Câu hỏi thường gặp (FAQ)

### Q1: Plugin vs Skill vs Subagent - khi nào chọn cái nào?

| Khía cạnh | Skill | Subagent | Plugin |
|-----------|-------|----------|--------|
| Số components | 1 (skill) | 1 (agent) | Nhiều (commands + agents + MCP + hooks + skills) |
| Distribution | Repo / copy | Repo / copy | Marketplace / 1 lệnh install |
| Versioning | Manual | Manual | Tự động qua `version` field |
| Use case | Single capability | Single specialized assistant | Bundled solution / team workflow |

**Quy tắc đơn giản:**

- 1 capability rõ ràng → Skill
- 1 specialized AI → Subagent
- Workflow phức tạp cần nhiều thứ → Plugin

### Q2: Sự khác biệt giữa Plugin và Marketplace?

- **Plugin** — package chứa các components (1 đơn vị)
- **Marketplace** — catalog/registry chứa **nhiều plugins**

Có thể có:

- 1 plugin `blog-toolkit` ở repo `PinNguyen9x/blog-toolkit`
- 1 marketplace `pin-tools` ở repo `PinNguyen9x/marketplace` chứa 5 plugins khác nhau

User add marketplace 1 lần → install nhiều plugins từ đó.

### Q3: Tôi có thể cài plugin từ GitHub mà không qua marketplace không?

Có, 2 cách:

```bash
# Direct GitHub install
/plugin install github:username/repo

# Hoặc add repo as marketplace rồi install
/plugin marketplace add username/repo
/plugin install plugin-name
```

Cách 2 tiện hơn nếu repo có nhiều plugins.

### Q4: Plugin có override built-in commands không?

Plugin commands có **prefix**: `/plugin-name:command-name`. Ví dụ: plugin `pr-review` có command `review` → invoke là `/pr-review:review`.

Tuy nhiên, nếu không có conflict tên, có thể gọi `/review` ngắn gọn.

→ Plugin **không override** built-in commands như `/help`, `/clear`, etc.

### Q5: Update plugin có break setup hiện tại không?

Tùy plugin author:

- **Semver compliant** plugins: bump major version (`1.x.x` → `2.x.x`) khi có breaking changes
- **Backward compatible** updates: minor (`1.0.x` → `1.1.x`) hoặc patch (`1.0.0` → `1.0.1`)

Best practice: Đọc CHANGELOG/release notes trước khi update. Pin plugin tới specific version qua marketplace entry nếu cần stability.

### Q6: Plugins có thấy data nhạy cảm trong project không?

Phụ thuộc components:

- **Plugin commands/skills** — chạy với main agent permissions, có thể đọc files
- **Plugin subagents** — chạy với restricted sandbox (không có hooks, mcpServers, permissionMode)
- **Plugin hooks** — chạy với system permissions, **CÓ** thấy file content qua `tool_input`
- **Plugin MCP** — connect tới external service với credentials pass vào

→ **Đọc plugin code trước khi install**, đặc biệt với plugins từ source không trusted.

### Q7: Tôi có thể có private plugin không?

Có, vài cách:

1. **Local plugin:** `claude --plugin-dir ./my-private-plugin` (chỉ bạn dùng)
2. **Private GitHub repo:** Plugin trong private repo, bạn có read access. Users (team) cần git credential helper hoặc env tokens
3. **Inline plugin:** Define trong `settings.json` với `source: 'settings'` (không cần repo)
4. **Enterprise managed marketplace:** Cho team/org, restrict qua `strictKnownMarketplaces`

### Q8: Hot-reload có thực sự work cho mọi components không?

Mostly yes, nhưng có exceptions:

- ✅ **Hot-reload OK:** slash commands, skills, agents, hooks config, MCP/LSP configs
- ⚠️ **Cần restart:** một số env variable changes, native binary updates trong `bin/`, schema breaking changes

`/reload-plugins` re-read manifests + configs. Restart safer khi có doubt.

### Q9: Plugin có chạy được trên cả claude.ai (web) và Claude Code không?

**Hiện tại chỉ Claude Code.** Plugins là Claude Code feature.

Tuy nhiên, các components bên trong plugin có thể độc lập:

- **Skills** trong plugin có thể export riêng và dùng trên claude.ai (upload qua Settings)
- **MCP servers** dùng được trên claude.ai nếu config trong account
- **Subagents** chỉ cho Claude Code

### Q10: Plugin có cost gì không (token, API)?

Cost phụ thuộc components:

- **Slash commands/skills:** Token cost cho prompts (như normal usage)
- **Subagents:** Token cost cho subagent context (mỗi subagent = thêm context window)
- **MCP servers:** API cost của external service (GitHub, Notion, etc.) + token cho tool descriptions
- **Hooks:** Compute cost trên máy bạn (không phải Claude API)
- **LSP servers:** Compute cost (chạy local, không API)

Plugin có nhiều components → cost tích lũy.

### Q11: Tôi có thể fork official plugin và customize không?

Có (theo license):

1. Fork repo trên GitHub
2. Modify `plugin.json` (đổi name, version, author)
3. Customize components
4. Push lên fork của bạn
5. Install từ fork: `/plugin install github:your-username/forked-repo`

> Respect license của plugin gốc. Phần lớn Anthropic plugins là MIT/Apache.

### Q12: Plugin update có notification không?

Hiện tại:

- Manual check: `/plugin update plugin-name` → Claude Code check version
- Marketplace update: khi marketplace có plugins mới hoặc version bumps
- **Auto-notification:** chưa có built-in. Phải proactive check.

Workaround: Subscribe to plugin GitHub repo (Watch → Releases only) để nhận notification khi có new version.

### Q13: Khi nào nên publish lên Anthropic official marketplace?

Submit tới [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit) khi:

- Plugin đã mature, tested kỹ
- Có user base / community feedback
- Tuân thủ quality + security standards
- Maintain plan rõ ràng

Submit process:

1. Submit form
2. Anthropic review (quality + security)
3. Approved → published trên official marketplace
4. Users discover qua `/plugin browse`

### Q14: Plugin có debug được không?

Có:

```bash
# Verbose mode
claude --debug

# Trong session, Ctrl+O để verbose

# Plugin-specific debug
/plugin debug plugin-name

# Validate structure
claude plugin validate
```

Logs ở `~/.claude/logs/`. MCP errors trong plugin show qua `claude mcp list` status.

### Q15: Plugin có versioning channel (stable/beta/latest) không?

Có, qua **multiple marketplaces** point khác `ref`/`sha` của cùng repo:

- Stable channel: marketplace point tới tag `v1.0.0`
- Beta channel: marketplace point tới `develop` branch
- Latest: marketplace point tới `main` HEAD

Admins có thể assign channels cho user groups qua managed settings (`allowedChannelPlugins`).

### Q16: Bundle size có giới hạn không?

Không có hard limit document, nhưng:

- Plugin càng lớn → install càng chậm
- Git timeout default 120s (đủ cho large repos)
- Skills có 500-line guideline cho SKILL.md
- Practical: keep plugin <50MB

Best practice: Move large data ra ngoài (download trên-demand qua scripts), keep plugin manifest gọn.

### Q17: Plugin có self-update được không?

Plugin **không tự update**. User cần explicit:

```
/plugin update plugin-name
```

Vì security: plugin không thể auto-pull code mới mà user không approve.

Workaround cho team: Org managed settings có thể auto-install/update specific plugins (`enabledPlugins` setting).

## 19. Kết luận - Hành trình Claude Code 7 modules

Plugin là mảnh ghép cuối cùng — không phải vì nó là feature mạnh nhất, mà vì nó là cơ chế đóng gói tất cả 6 module trước thành package có thể share, version, và distribute.

**Recap toàn bộ series:**

| Module | Mục đích | Khi dùng |
|--------|----------|----------|
| **01. Slash Commands** | Shortcuts gõ tay | Quick repeatable tasks |
| **02. Memory** | Context persistence | Project conventions, personal preferences |
| **03. Skills** | Reusable instructions với progressive disclosure | Domain-specific capabilities |
| **04. Subagents** | Specialized AI workers với context riêng | Long-running specialized tasks |
| **05. MCP** | External integration (GitHub, DB, Slack...) | Live data access |
| **06. Hooks** | Event-driven automation | Validation, formatting, security scanning |
| **07. Plugins** | Bundle tất cả components | Team workflow, distribution |

### Roadmap khuyến nghị cho người mới

**Tuần 1-2: Cơ bản**

- Học `/help`, `/clear`, `/init`, `/memory`
- Tạo `CLAUDE.md` đầu tiên cho project
- Thử 2-3 built-in slash commands

**Tuần 3-4: Tự động hoá nhẹ**

- Tạo 2-3 custom slash commands cho task lặp lại
- Setup user-level preferences ở `~/.claude/CLAUDE.md`
- Thêm 1 hook đơn giản (e.g., format on save)

**Tháng 2: Specialized agents**

- Tạo 2-3 subagents cho specialized work (code-reviewer, test-engineer)
- Convert vài commands phức tạp thành skills
- Setup GitHub MCP

**Tháng 3+: Plugin development**

- Bundle workflow cá nhân thành plugin local
- Test với `--plugin-dir`
- Push lên GitHub, share với team
- Submit lên Anthropic marketplace nếu mature

### Triết lý sử dụng

> **Đừng over-engineer.** Bắt đầu với cơ chế đơn giản nhất giải quyết được vấn đề. Slash command đủ thì không cần skill. Skill đủ thì không cần subagent. Manual MCP đủ thì không cần plugin. Chỉ scale up khi cảm nhận rõ pain point cần giải quyết.

Claude Code không phải là "framework" cần master toàn bộ — nó là toolkit, mỗi cơ chế giải quyết một vấn đề khác nhau. Pick what you need, ignore what you don't.

### Lời cuối

Hành trình 7 module này tổng hợp gần như toàn bộ những gì bạn cần biết về extensibility của Claude Code (tính tới April 2026). Tuy nhiên, Claude Code đang phát triển rất nhanh — features mới ra liên tục, best practices đang định hình. Hãy thường xuyên check:

- [Official Documentation](https://code.claude.com/docs)
- [Release Notes](https://github.com/anthropics/claude-code/releases) — `/release-notes` trong session
- [GitHub Issues](https://github.com/anthropics/claude-code/issues) — community discussions
- [Anthropic Engineering Blog](https://www.anthropic.com/engineering) — deep dives

Hy vọng series này đã giúp bạn hiểu rõ hơn về Claude Code và áp dụng được vào workflow hàng ngày. Chúc bạn build được những plugin/skill/agent tuyệt vời cho project của riêng mình!

Hãy bắt đầu hành trình bằng cách gõ `/help` ngay trong Claude Code, rồi từng bước explore từ Slash Commands tới Plugins. Mỗi tuần làm quen với 1 cơ chế mới, sau 2 tháng bạn sẽ có toolkit cá nhân hóa hoàn toàn cho cách làm việc của mình.
