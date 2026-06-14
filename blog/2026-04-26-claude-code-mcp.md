---
slug: claude-code-mcp
title: Claude Code MCP - Kết nối Claude với external services
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Claude, AI, DevTools, MCP]
date: '2026-04-26T12:00:00Z'
image: https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80
---

MCP (Model Context Protocol) là chuẩn mở để Claude truy cập tools, APIs, và real-time data bên ngoài. Khác với Memory (lưu data tĩnh), MCP cung cấp live access tới data đang thay đổi — GitHub issues, database queries, Slack messages, Notion docs. Bài viết này tổng hợp transport protocols, OAuth, scopes, và áp dụng MCP cho project blog cá nhân.

<!-- truncate -->

# Claude Code MCP: Từ cơ bản đến nâng cao

## 1. MCP là gì?

**MCP (Model Context Protocol)** là **chuẩn mở** để Claude truy cập **tools, APIs, và real-time data** bên ngoài. Khác với Memory (lưu data tĩnh), MCP cung cấp **live access** tới data đang thay đổi.

**Đặc điểm chính:**

- Real-time access tới external services
- Live data synchronization
- Extensible architecture (ai cũng tự build server được)
- Secure authentication (OAuth, API keys, tokens)
- Tool-based interactions (Claude gọi tool, server thực thi)

### Vì sao cần MCP?

> Real projects không tồn tại trong vacuum. App nói với database. Team chat qua Slack. Infra chạy AWS/GCP. Issues ở Linear/Jira. Docs ở Notion. Không có MCP, từ Claude Code làm việc với những hệ thống này nghĩa là: hoặc shell out tới CLI tools (brittle, verbose), hoặc rời Claude Code đi mở app khác (context-switch). MCP giải quyết bằng cách cho Claude communicate với external system qua interface chuẩn.

Một ví dụ trực quan: thay vì nói *"chạy SQL query này và đưa kết quả cho tôi"*, bạn nói *"check xem tuần này có bao nhiêu user signup"* — Claude tự gọi database tool, parse kết quả, continue conversation.

## 2. Kiến trúc MCP

```
Claude  ↔↔  MCP Server  ↔↔  External Service
```

```
Claude     -- Request: list_issues -->  MCP Server
MCP Server -- Query                -->  External Service
External   -- Data                 -->  MCP Server
MCP Server -- Response             -->  Claude
```

### MCP Ecosystem

```
            Claude
               ↓ MCP
    ┌──────────┼──────────┬──────────┬──────────┐
    │          │          │          │          │
Filesystem  GitHub    Database    Slack    Google Docs
 MCP Server MCP Server MCP Server MCP Server MCP Server
    ↓          ↓          ↓          ↓          ↓
Local Files GitHub    PostgreSQL  Slack    Google Drive
            Repos     /MySQL      Workspace
```

## 3. Transport Protocols

Claude Code hỗ trợ **4 transport methods** để connect MCP server:

### a) HTTP Transport (recommended cho remote)

Cách phổ biến nhất cho cloud-based services.

```bash
# Basic HTTP connection
claude mcp add --transport http notion https://mcp.notion.com/mcp

# HTTP với authentication header
claude mcp add --transport http secure-api https://api.example.com/mcp \
  --header "Authorization: Bearer your-token"
```

### b) Stdio Transport (recommended cho local)

Cho MCP servers chạy local process trên máy bạn.

```bash
# Local Node.js server
claude mcp add --transport stdio myserver -- npx @myorg/mcp-server

# Với env variables
claude mcp add --transport stdio myserver --env KEY=value -- npx server
```

### c) WebSocket Transport

Cho persistent bidirectional connections.

```bash
claude mcp add --transport ws realtime-server wss://example.com/mcp
```

### d) SSE Transport (DEPRECATED)

Server-Sent Events — đã deprecated, nên dùng HTTP thay thế.

### Lưu ý cho Windows

Trên native Windows (không phải WSL), dùng `cmd /c` cho npx commands:

```bash
claude mcp add --transport stdio my-server -- cmd /c npx -y @some/package
```

## 4. OAuth 2.0 Authentication

Claude Code hỗ trợ OAuth 2.0 cho MCP servers cần auth:

```bash
# Interactive flow (browser-based)
claude mcp add --transport http my-service https://my-service.example.com/mcp

# Pre-configured credentials cho non-interactive
claude mcp add --transport http my-service https://my-service.example.com/mcp \
  --client-id "your-client-id" \
  --client-secret "your-client-secret" \
  --callback-port 8080
```

### Features OAuth

| Feature | Mô tả |
|---------|-------|
| Interactive OAuth | Dùng `/mcp` để trigger browser-based OAuth flow |
| Pre-configured OAuth clients | Built-in cho Notion, Stripe, etc. |
| Token storage | Tokens lưu an toàn trong system keychain |
| Step-up auth | Hỗ trợ step-up authentication cho privileged operations |
| Discovery caching | OAuth discovery metadata cache để reconnect nhanh |

### Override OAuth Metadata Discovery

Nếu MCP server lỗi ở standard endpoint nhưng có OIDC endpoint:

```json
{
  "mcpServers": {
    "my-server": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "oauth": {
        "authServerMetadataUrl": "https://auth.example.com/.well-known/openid-configuration"
      }
    }
  }
}
```

## 5. MCP Scopes

| Scope | Vị trí | Mô tả | Share | Cần approval |
|-------|--------|-------|-------|--------------|
| **Local** (default) | `~/.claude.json` (per project path) | Private user + project hiện tại | Chỉ bạn | Không |
| **Project** | `.mcp.json` | Commit git được | Team | Có (lần đầu) |
| **User** | `~/.claude.json` | Available mọi project | Chỉ bạn | Không |

### Project Scope (`.mcp.json`)

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.github.com/mcp"
    }
  }
}
```

Team members thấy approval prompt khi lần đầu dùng project MCPs.

### Server Deduplication

Cùng MCP server define ở nhiều scope → **local thắng**. Cho phép override project/user-level config.

## 6. CLI Commands

```bash
# Add HTTP server
claude mcp add --transport http github https://api.github.com/mcp

# Add local stdio server
claude mcp add --transport stdio database -- npx @company/db-server

# List tất cả MCP servers
claude mcp list

# Get details server cụ thể
claude mcp get github

# Remove server
claude mcp remove github

# Reset project-specific approval choices
claude mcp reset-project-choices

# Import từ Claude Desktop
claude mcp add-from-claude-desktop
```

## 7. MCP Tool Search

Khi MCP tool descriptions vượt **10% context window**, Claude Code tự enable tool search để chọn tools hiệu quả không overload context.

| Setting | Value | Mô tả |
|---------|-------|-------|
| `ENABLE_TOOL_SEARCH` | `auto` (default) | Auto enable khi >10% context |
| `ENABLE_TOOL_SEARCH` | `auto:<N>` | Threshold custom `N` tools |
| `ENABLE_TOOL_SEARCH` | `true` | Luôn enable |
| `ENABLE_TOOL_SEARCH` | `false` | Disable, send full descriptions |

> Tool search cần **Sonnet 4+ hoặc Opus 4+**. Haiku models không hỗ trợ.

## 8. MCP Prompts as Slash Commands

MCP servers expose prompts dưới dạng slash commands:

```
/mcp__<server>__<prompt>
```

Ví dụ: server `github` có prompt `review` → invoke bằng `/mcp__github__review`.

## 9. MCP Resources via `@` Mentions

Reference MCP resources trực tiếp trong prompt với `@`:

```
@server-name:protocol://resource/path
```

Ví dụ:

```
@database:postgres://mydb/users
```

→ Claude fetch và include resource content inline vào conversation context.

## 10. Subagent-Scoped MCP

MCP servers có thể define **inline trong agent frontmatter** với key `mcpServers:`, scope chỉ cho subagent đó:

```yaml
---
mcpServers:
  my-tool:
    type: http
    url: https://my-tool.example.com/mcp
---

You are an agent with access to my-tool for specialized operations.
```

Subagent-scoped MCP **chỉ available trong execution context của agent đó**, không share với parent/sibling agents.

## 11. Available MCP Servers - Bảng phổ biến

| MCP Server | Mục đích | Common Tools | Auth |
|-----------|----------|--------------|------|
| **Filesystem** | File operations | read, write, delete | OS permissions |
| **GitHub** | Repository management | list_prs, create_issue, push | OAuth |
| **Slack** | Team communication | send_message, list_channels | Token |
| **Database** | SQL queries | query, insert, update | Credentials |
| **Google Docs** | Document access | read, write, share | OAuth |
| **Asana** | Project management | create_task, update_status | API Key |
| **Stripe** | Payment data | list_charges, create_invoice | API Key |
| **Notion** | Workspace integration | search, query DB, update pages | OAuth |
| **Memory** | Persistent memory | store, retrieve, delete | Local |

Xem thêm hàng trăm MCP servers tại [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers).

> ⚠️ **Cảnh báo security:** Anthropic chưa verify correctness/security của tất cả MCP servers third-party. Chỉ install MCP servers bạn tin tưởng. Đặc biệt cẩn thận với MCPs có thể fetch untrusted content (prompt injection risk).

## 12. Examples thực tế

### Example 1: GitHub MCP

**File `.mcp.json` (project root):**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**Tools có sẵn:**

- **Pull Request:** `list_prs`, `get_pr`, `create_pr`, `update_pr`, `merge_pr`, `review_pr`
- **Issue:** `list_issues`, `get_issue`, `create_issue`, `close_issue`, `add_comment`
- **Repository:** `get_repo_info`, `list_files`, `get_file_content`, `search_code`
- **Commit:** `list_commits`, `get_commit`, `create_commit`

**Ví dụ request:**

```
/mcp__github__get_pr 456

Title: Add dark mode support
Author: @alice
Description: Implements dark theme using CSS variables
Status: OPEN
Reviewers: @bob, @charlie
```

**Setup:**

```bash
export GITHUB_TOKEN="your_github_token"
claude mcp add --transport stdio github -- npx @modelcontextprotocol/server-github
```

### Example 2: Database MCP

```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-database"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost/mydb"
      }
    }
  }
}
```

**Usage:**

```
User: Fetch all users with more than 10 orders

Claude: [Uses database MCP]
SELECT u.*, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id
HAVING COUNT(o.id) > 10
ORDER BY order_count DESC;

Results:
- Alice: 15 orders
- Bob: 12 orders
- Charlie: 11 orders
```

### Example 3: Multi-MCP Workflow - Daily Report

```
Setup:
1. GitHub MCP - fetch PR metrics
2. Database MCP - query sales data
3. Slack MCP - post report
4. Filesystem MCP - save report

Workflow:

Step 1: Fetch GitHub Data
  /mcp__github__list_prs completed:true last:7days
  → 42 PRs, 2.3h avg merge time

Step 2: Query Database
  SELECT COUNT(*) as sales, SUM(amount) as revenue
  FROM orders WHERE created_at > NOW() - INTERVAL '1 day'
  → 247 sales, $12,450 revenue

Step 3: Generate report.html

Step 4: Save to /reports/

Step 5: Post to #daily-reports channel

✓ Done
```

## 13. Environment Variable Expansion

MCP configs hỗ trợ env variable expansion với fallback defaults:

```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}",
        "X-Custom-Header": "${CUSTOM_HEADER:-default-value}"
      }
    },
    "local-server": {
      "command": "${MCP_BIN_PATH:-npx}",
      "args": ["${MCP_PACKAGE:-@company/mcp-server}"],
      "env": {
        "DB_URL": "${DATABASE_URL:-postgresql://localhost/dev}"
      }
    }
  }
}
```

Syntax:

- `${VAR}` → dùng env variable, **error nếu không set**
- `${VAR:-default}` → dùng env variable, fallback `default` nếu không set

Lưu credentials trong env vars:

```bash
# ~/.bashrc hoặc ~/.zshrc
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"
export DATABASE_URL="postgresql://user:pass@localhost/mydb"
export SLACK_TOKEN="xoxb-xxxxxxxxxxxxx"
```

## 14. MCP vs Memory - Decision Matrix

```
Need external data?
├─ No  → Use Memory
└─ Yes → Does it change frequently?
         ├─ No/Rarely → Use Memory
         └─ Yes/Often → Use MCP

Memory stores:        MCP accesses:
- Preferences         - Live APIs
- Context             - Databases
- History             - Real-time services
```

**Khi nào dùng Memory:** user preferences, conversation history, learned context (data tĩnh, slow-change)

**Khi nào dùng MCP:** current GitHub issues, live database queries, real-time data (data động, fast-change)

## 15. Solving Context Bloat - Code Execution với MCP

Khi MCP scale lên (hàng chục servers, hàng nghìn tools), gặp vấn đề **context bloat**. Anthropic engineering team đề xuất giải pháp: **dùng code execution thay vì direct tool calls**.

### Vấn đề: 2 nguồn waste tokens

**1. Tool definitions overload context window**

Phần lớn MCP clients load TẤT CẢ tool definitions upfront. Connect 1000+ tools → model phải process hàng trăm nghìn tokens trước khi đọc user request.

**2. Intermediate results consume tokens**

Mỗi intermediate result đi qua context của model. Ví dụ: transfer transcript 50K tokens từ Google Drive sang Salesforce → transcript flow qua context **2 lần** (đọc + viết).

→ **150,000+ tokens consumed** chỉ cho 1 task đơn giản.

### Giải pháp: MCP Tools as Code APIs

Thay vì pass tool definitions/results qua context, agent **viết code** gọi MCP tools như APIs. Code chạy trong sandboxed execution environment, **chỉ final result return về model**.

```
Model -- Writes code      --> Code Execution Environment
Code  -- Calls tools      --> MCP Servers
Tools -- Data stays in env -↓ (intermediate data NOT in model context)
Code  -- Only final result --> Model (minimal tokens)
```

### Ví dụ

```typescript
import * as gdrive from './servers/google-drive';
import * as salesforce from './servers/salesforce';

// Data flows directly between tools — never through model
const transcript = (
  await gdrive.getDocument({ documentId: 'abc123' })
).content;

await salesforce.updateRecord({
  objectType: 'SalesMeeting',
  recordId: '00Q5f000001abcXYZ',
  data: { Notes: transcript }
});
```

**Result: token usage giảm từ ~150,000 xuống ~2,000 → giảm 98.7%.**

### Benefits

| Benefit | Mô tả |
|---------|-------|
| **Progressive Disclosure** | Agent browse filesystem load chỉ tools cần |
| **Context-Efficient Results** | Filter/transform data trong execution env trước khi return model |
| **Powerful Control Flow** | Loops, conditionals, error handling chạy trong code không round-trip |
| **Privacy Preservation** | Intermediate data (PII, sensitive) ở lại execution env |
| **State Persistence** | Save intermediate results, build reusable skill functions |

### Trade-offs

Code execution có complexity riêng:

- Cần **secure sandboxed execution environment** với resource limits
- **Monitoring + logging** code đã execute
- Infrastructure overhead so với direct tool calls

→ Agents có vài MCP servers → direct tool calls đơn giản hơn. Agents scale lớn (dozens servers, hundreds tools) → code execution là improvement đáng kể.

## 16. Best Practices

### Security

#### ✅ Do's

- Dùng env variables cho mọi credentials
- Rotate tokens và API keys định kỳ (1 tháng/lần)
- Dùng read-only tokens khi có thể
- Limit MCP server access scope tới minimum
- Monitor MCP server usage và access logs
- Dùng OAuth cho external services khi available
- Test connections trước production
- Document active MCP connections
- Keep MCP server packages updated

#### ❌ Don'ts

- Hard-code credentials trong config files
- Commit tokens/secrets vào git
- Share tokens trong team chat/email
- Dùng personal tokens cho team projects
- Cấp permissions không cần thiết
- Expose MCP endpoints publicly
- Run MCP servers với root/admin privileges
- Cache sensitive data trong logs

### Configuration

1. **Version Control:** Commit `.mcp.json` vào git, dùng env vars cho secrets
2. **Least Privilege:** Cấp minimum permissions cho từng server
3. **Isolation:** Run MCP servers ở separate processes khi có thể
4. **Monitoring:** Log mọi MCP requests + errors cho audit trail
5. **Testing:** Test config trước khi deploy production

### Performance Tips

- Cache frequently accessed data ở application level
- MCP queries cụ thể để giảm data transfer
- Monitor response times
- Rate limit cho external APIs
- Batching khi perform nhiều operations

## 17. Cài đặt

### Prerequisites

- Node.js + npm installed
- Claude Code CLI installed
- API tokens/credentials cho services

### Step-by-Step

**1. Add MCP server (ví dụ GitHub):**

```bash
claude mcp add --transport stdio github -- npx @modelcontextprotocol/server-github
```

Hoặc tạo `.mcp.json` ở project root:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**2. Set env variables:**

```bash
export GITHUB_TOKEN="your_github_personal_access_token"
```

**3. Test connection:**

```bash
claude /mcp
```

**4. Use MCP tools:**

```
/mcp__github__list_prs
/mcp__github__create_issue "Title" "Description"
```

## 18. Troubleshooting

### MCP Server Not Found

```bash
# Verify installed
npm list -g @modelcontextprotocol/server-github

# Install nếu missing
npm install -g @modelcontextprotocol/server-github
```

### Authentication Failed

```bash
# Verify env variable
echo $GITHUB_TOKEN

# Re-export
export GITHUB_TOKEN="your_token"

# Check token scopes ở https://github.com/settings/tokens
```

### Connection Timeout

- `ping api.github.com` → check network
- Verify endpoint accessible
- Check rate limits
- Tăng timeout trong config
- Check firewall/proxy

### MCP Server Crashes

- Check logs: `~/.claude/logs/`
- Verify env variables set
- File permissions đúng chưa
- Reinstall MCP server package

## 19. Workflow ứng dụng cho Blog Project

Cho project blog Next.js cá nhân, đây là MCPs hữu ích:

### Setup MCPs cho blog workflow

`.mcp.json` ở root project:

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
        "${CLAUDE_PROJECT_DIR}/blog",
        "${CLAUDE_PROJECT_DIR}/public/images"
      ]
    },
    "notion": {
      "type": "http",
      "url": "https://mcp.notion.com/mcp",
      "oauth": {}
    }
  }
}
```

`~/.zshrc`:

```bash
export GITHUB_TOKEN="ghp_..."
```

### Use cases cho blog

#### 1. Lấy ideas từ Notion

```
User: List ideas trong Notion database "Blog Ideas" mà status=Ready

Claude: [Uses Notion MCP via @notion:notion://databases/...]
Returns:
1. "Kafka consumer groups explained"
2. "Next.js Server Actions vs Route Handlers"
3. "BigQuery cost optimization tips"
```

#### 2. Convert PR thành blog post

```
User: Đọc PR #45 và tạo draft blog post explaining the changes

Claude:
[Uses GitHub MCP]
- /mcp__github__get_pr 45
- Reads diff and description
- [Uses Filesystem MCP]
- Creates blog/<slug>.md with:
  * Frontmatter from PR title/date
  * Intro: problem PR solves
  * Body: technical changes with code snippets from diff
  * Conclusion: impact + lessons
```

#### 3. Sync drafts giữa Notion và blog

```
User: Sync draft "Kafka post" từ Notion sang blog/

Claude:
[Notion MCP] Read page content as markdown
[Filesystem MCP] Save to blog/kafka-consumer-groups.md
[GitHub MCP] Create branch post/kafka-consumer-groups, commit, push
```

#### 4. Auto-link related posts

```
User: Trong post mới về Server Actions, tự động link tới các post Next.js cũ

Claude:
[Filesystem MCP] grep posts với tag "nextjs"
[Filesystem MCP] Read top 3 most relevant posts
[Filesystem MCP] Update current post với "Related posts" section
```

#### 5. Create issue khi typo phát hiện

```
User: Tôi thấy bài "kafka-consumer-groups" có typo dòng 45

Claude:
[GitHub MCP] /mcp__github__create_issue
  Title: "Typo in kafka-consumer-groups post line 45"
  Body: <details>
  Labels: ["typo", "blog-content"]
```

## 20. Câu hỏi thường gặp (FAQ)

### Q1: MCP khác Skills/Subagents/Hooks thế nào?

| Feature | Vai trò |
|---------|---------|
| **MCP** | Cho Claude **truy cập external services** (GitHub, DB, Slack...) |
| **Skills** | Cho Claude **kiến thức/instructions** để làm task cụ thể |
| **Subagents** | Cho Claude **delegate task** sang AI assistant chuyên biệt |
| **Hooks** | Cho Claude **tự động thực thi command** khi event xảy ra |

Có thể combine: Subagent có `mcpServers:` để dùng MCP, Hooks có thể trigger MCP via type `mcp_tool`, Skills có thể recommend dùng MCP.

### Q2: Khi nào dùng HTTP transport vs Stdio?

- **HTTP** (recommended cho remote): server cloud-based, multi-user, persistent. Hỗ trợ OAuth, API keys, headers.
- **Stdio** (recommended cho local): server chạy local process, system access trực tiếp, custom scripts, không cần network. Tốc độ nhanh hơn HTTP cho local.

Rule of thumb: cloud service → HTTP. Local CLI tool → Stdio.

### Q3: SSE transport tại sao deprecated?

SSE (Server-Sent Events) là chuẩn cũ, có hạn chế:

- One-way từ server tới client
- Không hỗ trợ tốt cho bidirectional flow
- HTTP transport mới hỗ trợ đầy đủ hơn (request/response + notifications)

→ Anthropic recommend migrate sang HTTP. SSE vẫn work nhưng không khuyên dùng cho project mới.

### Q4: MCP servers thứ ba có an toàn không?

**Không tự động an toàn.** Anthropic chưa verify correctness/security của tất cả MCP servers third-party.

**Risks:**

- **Prompt injection:** MCP fetch untrusted content → có thể inject malicious instructions vào Claude
- **Credential theft:** MCP server có quyền access tokens/credentials bạn pass
- **Code execution:** Stdio MCP chạy như process trên máy bạn, có quyền filesystem
- **Data exfiltration:** MCP gửi data nhạy cảm tới server bên ngoài

**Best practice:**

1. Chỉ install MCPs từ source tin tưởng
2. Đọc source code MCP trước khi cài
3. Dùng read-only tokens nếu MCP chỉ cần read
4. Run trong isolated environment cho MCPs untrusted (Docker, VM)
5. Monitor MCP logs để phát hiện hành vi bất thường

### Q5: Dùng MCP có cost gì không?

Có 2 loại cost:

**1. API cost của service:**

- GitHub MCP free trong rate limit
- Database MCP free (tự host)
- OpenAI/Notion/Stripe MCP có thể có cost tuỳ usage

**2. Token cost (Claude side):**

- Tool definitions ăn input tokens (cap 2KB/server từ v2.1.84)
- Tool outputs ăn input tokens (cap 25K/call default)
- Lots of MCPs + verbose outputs → cost tăng đáng kể

→ Khi scale lớn, cân nhắc code execution pattern (giảm 90%+ token).

### Q6: Tôi sửa `.mcp.json` xong, sao không apply?

Sau khi sửa:

1. Save file
2. Restart Claude Code (hoặc reload trong IDE)
3. Run `/mcp` để verify
4. Run `claude mcp list` để xem servers active

Project-level MCP có approval prompt lần đầu use sau sửa → confirm để activate.

### Q7: Conflict khi cùng tool name từ nhiều MCPs?

Tools được prefix với server name:

- `mcp__github__get_pr` (từ github MCP)
- `mcp__gitlab__get_pr` (từ gitlab MCP)

Không conflict ở tool level. Còn server name conflict (cùng `name: "github"` ở 2 scope) → **local thắng project, project thắng user**.

### Q8: Subagent-scoped MCP khác toàn project MCP thế nào?

| Khía cạnh | Toàn project MCP | Subagent-scoped MCP |
|-----------|------------------|---------------------|
| Define ở | `.mcp.json` | Inline `mcpServers:` trong agent frontmatter |
| Available cho | Mọi agent + main session | Chỉ subagent đó |
| Khi nào dùng | MCPs phổ biến (github, fs) | MCPs niche cho specialized agent |

### Q9: MCP Output Limits thì sao khi data lớn hơn 25K tokens?

Default behavior:

- ≤10K tokens: bình thường
- 10-25K tokens: warning hiển thị nhưng vẫn pass full
- >25K tokens: **truncate**, chỉ phần đầu vào context
- >50K characters: persist ra disk, Claude đọc file thay vì inline

Workaround:

1. Tăng `MAX_MCP_OUTPUT_TOKENS=50000`
2. Filter data ở MCP server side (return chỉ field cần)
3. Dùng pagination ở MCP tool
4. Code execution pattern (filter trong sandbox)

### Q10: Tôi có thể tự build MCP server không?

Có. Dùng [MCP SDK](https://modelcontextprotocol.io/sdk):

- TypeScript SDK: `@modelcontextprotocol/sdk`
- Python SDK: `mcp-server`
- Định nghĩa tools, resources, prompts
- Implement transport (stdio/HTTP)
- Test với `claude mcp add --transport stdio my-server -- node ./dist/index.js`

### Q11: Token cho MCP có expose ra Claude không?

**Không trực tiếp.** Token chỉ ở env variable hoặc config, **không vào prompt context của Claude**.

Tuy nhiên:

- MCP server **có** thấy token (để authenticate với external service)
- Nếu MCP server lưu/log token kém → risk
- Token rotation định kỳ là best practice

### Q12: Project MCP cần approval lần đầu - bypass được không?

Không bypass. Đây là **security feature**: ngăn malicious `.mcp.json` commit vào repo bạn clone.

Workaround:

- Dùng `claude mcp reset-project-choices` để reset approval
- Approve 1 lần, từ đó dùng được tự do
- Trong CI/CD, dùng env variable hoặc CLI flag để skip approval

### Q13: MCP kết nối chậm, làm sao optimize?

1. **Dùng HTTP với HTTP/2** thay vì legacy SSE
2. **Cache OAuth metadata** (auto bởi Claude Code, v2.1.64+)
3. **Local caching** ở app layer cho data ít thay đổi
4. **Specific queries** thay vì broad fetches (`SELECT id, name` thay vì `SELECT *`)
5. **Code execution pattern** cho workflow phức tạp (giảm round-trip)
6. **Run MCP server gần Claude Code** (cùng máy nếu stdio, cùng region nếu HTTP)

### Q14: Có cách nào liệt kê tools available của 1 MCP server?

Có:

```bash
# Get details server cụ thể
claude mcp get github

# Hoặc trong Claude Code
/mcp
# → list servers + tools
```

### Q15: Plugin MCP có giới hạn gì so với manual MCP?

Plugin MCPs run trong sandbox plugin với:

- Path resolution qua `${CLAUDE_PLUGIN_ROOT}` thay vì absolute path
- Auto installed/uninstalled với plugin
- Phải declare trong `plugin.json` hoặc `.mcp.json` của plugin
- Được Anthropic verify (ít nhất với marketplace plugins)

Khác với manual `.mcp.json`:

- Không cần env vars phức tạp
- Lifecycle managed by plugin
- Dễ share team

## 21. Kết luận

MCP là cầu nối giữa Claude Code và thế giới bên ngoài — biến Claude từ "AI biết viết code" thành "AI biết tương tác với toàn bộ stack development của bạn". Khuyến nghị workflow:

1. **Bắt đầu với 1-2 MCPs cốt lõi** — GitHub và Filesystem là 2 MCPs hữu ích nhất cho dev workflow
2. **OAuth khi available** — an toàn hơn API keys, không phải lo rotate token
3. **Project MCP cho team** — `.mcp.json` commit git, mọi dev clone là có
4. **User MCP cho personal** — Notion, Linear, calendar... ở `~/.claude.json`
5. **Subagent-scoped MCP cho specialized agent** — data-scientist agent chỉ cần BigQuery MCP, không cần share toàn project
6. **Monitor token usage** — MCPs verbose có thể đốt context nhanh; cân nhắc code execution pattern khi scale lớn
7. **Security trên hết** — đọc source code MCP trước khi cài, đặc biệt nếu MCP có quyền filesystem hoặc fetch untrusted content

Kết hợp với 4 module trước (Slash Commands, Memory, Skills, Subagents), MCP hoàn thiện bộ công cụ Claude Code: Slash Commands cho shortcuts, Memory cho context persistence, Skills cho reusable instructions, Subagents cho task delegation, và MCP cho external integration. Mỗi cơ chế giải quyết một loại vấn đề khác nhau, kết hợp đúng cách sẽ scale developer workflow lên 10x.

Hãy bắt đầu bằng cách chạy `claude mcp list` để xem MCPs đang active, rồi add GitHub MCP đầu tiên với `claude mcp add --transport stdio github -- npx @modelcontextprotocol/server-github` ngay hôm nay!
