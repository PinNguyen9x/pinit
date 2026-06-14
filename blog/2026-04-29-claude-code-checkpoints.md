---
slug: claude-code-checkpoints
title: Claude Code Checkpoints - Rewind và safety net cho session
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Claude, AI, DevTools, Checkpoints]
date: '2026-04-29T12:00:00Z'
image: https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1200&auto=format&fit=crop&q=80
---

Checkpoints cho phép bạn save conversation state và rewind về điểm trước đó trong session Claude Code — vô cùng hữu ích khi explore approaches, recover from mistakes, hoặc free context window. Đây là safety net built-in giúp bạn pursue ambitious tasks mà không sợ phá code. Bài viết này tổng hợp 5 rewind options, workflows điển hình, và limitations cần lưu ý.

<!-- truncate -->

# Claude Code Checkpoints: Safety net cho session

## 1. Checkpoints là gì?

**Checkpoints** cho phép bạn **save conversation state** và **rewind** về điểm trước đó trong session Claude Code. Vô cùng hữu ích khi:

- 🔬 **Explore different approaches** — thử nhiều cách implement
- ⏪ **Recover from mistakes** — quay lại trước khi Claude làm sai
- 🧪 **Safe experimentation** — thử nghiệm thoải mái, không sợ phá code
- ⚖️ **Compare alternative solutions** — so sánh nhiều approach
- 🔀 **A/B testing different designs** — test nhiều design

### Checkpoint = Snapshot

Mỗi checkpoint là **snapshot** của conversation state, bao gồm:

- **Conversation history** (messages user + Claude)
- **Code/file changes** (file edits Claude đã làm qua tools)
- **Session state** (working directory, etc.)

> 💡 Đây là **safety net** cho phép pursue ambitious tasks — bạn biết luôn có thể return về prior state.

### Built-in default - không cần config!

Checkpoints là **default behavior** của Claude Code. Không cần config, không cần enable. Tự động active từ khi bạn `claude` lên.

## 2. Cách Activate Rewind

### Cách 1: Phím tắt Esc + Esc

Bấm `Esc` **2 lần liên tiếp** (Esc + Esc) → mở rewind interface.

### Cách 2: Slash command

```
/rewind
```

Hoặc dùng alias:

```
/checkpoint
```

→ Mở scrollable list các prompts trong session, chọn point muốn rewind.

## 3. Auto-created Checkpoints

Claude Code **tự động tạo checkpoint**:

| Trigger | Khi nào tạo |
|---------|-------------|
| **Mỗi user prompt** | Mỗi lần bạn submit prompt mới → 1 checkpoint mới |
| **Trước file edits** | Trước Write/Edit/Multi-Edit → snapshot file state |
| **Auto-managed** | Bạn không cần manual save |

→ Tập trung làm việc, không lo lắng về việc save state.

## 4. 5 Rewind Options

Khi bạn rewind, hiện menu **5 lựa chọn**:

### Option 1: Restore code AND conversation

**Revert cả 2:** files + messages về checkpoint.

**Khi nào dùng:**

- Approach hiện tại sai hoàn toàn, muốn về clean state
- Thử cách mới từ đầu
- Bug accidentally introduced

```
[State A] → [State B] → [State C: rewind]
                                ↓
[State A: full restore — code + conversation]
```

### Option 2: Restore conversation ONLY

**Rewind messages, GIỮ code hiện tại.**

**Khi nào dùng:**

- Conversation đi lạc hướng nhưng code OK
- Muốn re-prompt nhưng không undo file changes
- Conversation history lộn xộn, muốn restart từ điểm trước

```
[Code: current — unchanged]
[Conversation: rolled back to earlier state]
```

### Option 3: Restore code ONLY

**Revert files, GIỮ conversation.**

**Khi nào dùng:**

- Code edit sai nhưng đã có discussion hữu ích trong conversation
- Muốn undo file changes nhưng giữ context hiểu biết Claude đã có
- Try same approach lại với code clean

```
[Code: rolled back]
[Conversation: full history preserved]
```

### Option 4: Summarize from here

**Compress conversation từ điểm chọn forward thành AI-generated summary**, free context window space.

**Đặc điểm:**

- Messages **trước** điểm chọn → giữ nguyên (full detail)
- Messages **từ điểm chọn forward** → compress thành summary
- **Files KHÔNG bị thay đổi**
- Original messages **preserved** trong session transcript (Claude tham khảo được nếu cần)
- Có thể provide **optional instructions** để focus summary vào topics cụ thể

**Khi nào dùng:**

- Context window đầy
- Phần verbose debugging muốn compress, giữ initial instructions full
- Cần "free up space" để continue với task

```
[Initial context: FULL detail]
[Mid-session: summarized — compressed]
[Now: continue working]
```

### Option 5: Never mind

**Cancel** và return về current state. Không thay đổi gì.

> 💡 **Note:** Sau khi restore conversation hoặc summarize, **original prompt** từ message được restore vào input field — bạn có thể re-send hoặc edit.

## 5. Workflows điển hình

### Workflow A: Branch Point - Compare Approaches

So sánh 2 implementation approaches từ cùng starting point:

```
1. Start: initial implementation       — Checkpoint A
2. Try Approach 1 (e.g., Redux)        — Checkpoint B
3. Rewind to Checkpoint A
4. Try Approach 2 (e.g., Zustand)      — Checkpoint C
5. Compare results from B and C
6. Choose best approach và continue
```

### Workflow B: Refactor Safety

Refactor an toàn với automatic rollback nếu test fail:

```
1. Current state                       — Checkpoint (auto)
2. Start refactoring
3. Run tests
4. If tests pass → Continue working
5. If tests fail → Rewind to checkpoint, try different approach
```

### Workflow C: Free Context Space

Khi context window gần đầy:

```
1. Verbose debugging session... 80K tokens used
2. /rewind
3. Choose "Summarize from here" at midpoint
4. Initial instructions preserved (still valuable context)
5. Mid-session compressed (~5K tokens summary thay 40K)
6. Continue working với fresh space
```

### Workflow D: Advanced - Combined với Plan Mode + Subagents

```
1. Create checkpoint "Clean state"
2. /plan Implement user authentication system
3. Implement với subagent delegation
4. Run tests in background
5. If tests fail → rewind to "Clean state"
6. Try different design from plan
```

## 6. Limitations quan trọng

### ⚠️ Không track files modified by Bash commands

Checkpointing **CHỈ track changes** từ Claude's file editing tools (Write, Edit, Multi-Edit). **KHÔNG** track bash commands như:

```bash
rm file.txt              # NOT tracked
mv old.txt new.txt       # NOT tracked
cp source.txt dest.txt   # NOT tracked
git reset --hard         # NOT tracked
```

→ Thay đổi từ bash commands này **không undo được** qua rewind.

### Workaround

- Dùng git để track destructive bash operations
- Trước khi để Claude chạy `rm`/`mv`/`cp` lớn → manual checkpoint git: `git stash` hoặc commit
- Pre-tool hook block dangerous bash (xem module Hooks)

### Bash hooks vs File edits

| Operation | Tracked? |
|-----------|:--------:|
| `Write` tool tạo file mới | ✅ Yes |
| `Edit` tool sửa file | ✅ Yes |
| `Multi-Edit` tool | ✅ Yes |
| `Bash` chạy `rm file` | ❌ No |
| `Bash` chạy `mv old new` | ❌ No |
| `Bash` chạy `git reset --hard` | ❌ No |
| `Bash` chạy script tạo files | ❌ No |
| External tools (editor sửa file ngoài Claude) | ❌ No |

## 7. Checkpoints vs các features tương tự

### Checkpoints vs `/compact`

| Khía cạnh | Checkpoints (Summarize) | /compact |
|-----------|------------------------|----------|
| **Phạm vi** | Targeted — compress phần từ điểm chọn forward | Toàn bộ conversation |
| **Initial context** | Giữ nguyên full detail | Bị compress luôn |
| **Use case** | Free space nhưng giữ initial instructions | Compress all khi cần aggressive |
| **Reversible?** | Có (Esc+Esc rewind) | Không reverse được |

→ **Summarize từ checkpoint** = soft compaction. **`/compact`** = hard compaction.

### Checkpoints vs Fork (`claude --continue --fork-session`)

| Khía cạnh | Summarize | Fork |
|-----------|-----------|------|
| **Session** | Cùng session, compress context | Tạo session NEW từ checkpoint |
| **Original session** | Modified (compressed) | Preserved nguyên |
| **Branching** | Linear | Multi-branch (như git branches) |
| **Use case** | Continue same task, free space | Thử approach khác giữ original alive |

→ **Fork** khi muốn "what if" mà không phá session gốc. **Rewind/Summarize** khi commit vào 1 path.

### Checkpoints vs Git

| Khía cạnh | Checkpoints | Git |
|-----------|------------|-----|
| **Scope** | Conversation + Claude's edits | Mọi file changes (manual + tools) |
| **Auto** | Tự động mỗi prompt | Manual commits |
| **Granularity** | Per-prompt | Per-commit |
| **Rollback bash** | ❌ Không | ✅ Có (nếu commit) |
| **Persistence** | Trong session | Permanent |
| **Conversation** | Có history | Không |

→ **Bổ sung cho nhau.** Dùng Git cho version control thật, Checkpoints cho experimentation in-session.

## 8. Best Practices

### ✅ Do's

- **Hiểu rõ 5 rewind options** — chọn đúng tránh mất data
- **Dùng "Summarize from here"** khi context window gần đầy thay vì restart session
- **Combine với git** — checkpoint cho conversation, git cho code persistence
- **Trust auto-checkpoint** — focus công việc, không lo manual save
- **Experiment freely** — checkpoint là safety net, hãy thử táo bạo
- **Rewind early khi sai hướng** — không cố cứu approach hỏng

### ❌ Don'ts

- **Đừng rely cho destructive bash ops** — `rm -rf` không undo qua rewind
- **Đừng quên git commit** trước khi để Claude làm changes lớn
- **Đừng confuse fork và rewind** — fork tạo session mới, rewind modify session hiện tại
- **Đừng dùng Summarize bừa bãi** — mất chi tiết của conversation khúc đó

## 9. Tips cho từng tình huống

### Tình huống 1: Claude implement sai hoàn toàn

```
Esc + Esc → Restore code and conversation → chọn checkpoint trước khi implement
```

### Tình huống 2: Claude code OK nhưng conversation đi lạc

```
Esc + Esc → Restore conversation → chọn checkpoint conversation đúng hướng
```

### Tình huống 3: Conversation hữu ích nhưng code có bug

```
Esc + Esc → Restore code → giữ insights conversation, code clean
```

### Tình huống 4: Context đầy gần đến limit

```
/rewind → Summarize from here → chọn midpoint của verbose section
→ Optional instruction: "Focus summary on architectural decisions"
```

### Tình huống 5: Muốn so sánh 2 implementations

```
[Code state A]
1. Implement với React Server Components → save state B
2. Esc+Esc → Restore code → chọn state A
3. Implement với Client Components → save state C
4. Compare B vs C bằng cách so file diffs
5. Chọn approach tốt hơn
```

## 10. Workflow ứng dụng cho Blog Project

Cho project blog Next.js cá nhân, đây là tình huống dùng Checkpoints:

### Use case 1: Thử nhiều design layouts cho post listing

```
[Blog setup hiện tại]
                  ↓
"Implement post listing với grid 2 cột, hero image lớn"
Claude: [tạo BlogList.tsx với grid-2]
                  ↓
Xem preview → không thích
                  ↓
Esc + Esc → chọn checkpoint trước implement
                  ↓
"Implement với list layout, full-width cards"
Claude: [tạo BlogList.tsx với list]
                  ↓
Compare: grid vs list → chọn list
```

### Use case 2: Thử migration từ MDX sang remote CMS

```
[Có 50 MD files, tò mò không biết Notion CMS có hợp không]
                  ↓
Save state qua git: git stash
                  ↓
"Migrate từ MD local sang Notion CMS với MCP server"
Claude: [implement migration script + thay đổi data layer]
                  ↓
Test → quá phức tạp, prefer MD
                  ↓
Esc + Esc → Restore code and conversation → checkpoint trước migration
                  ↓
Continue với MD, ghi note "tried Notion, prefer MD vì <reasons>"
```

### Use case 3: Experiment với SEO tools mid-debug

```
[Đang debug bug ở getStaticProps]
                  ↓
Conversation 30 messages về debug
                  ↓
Nghĩ ra: muốn thử SEO scoring trên posts
                  ↓
"Pause bug. Thử score SEO cho 5 posts mới nhất"
Claude: [chạy SEO checks, output scores]
                  ↓
"OK rồi, quay lại bug trước"
                  ↓
Esc + Esc → Restore conversation → checkpoint trước SEO tangent
                  ↓
Continue debug từ điểm cũ
```

### Use case 4: Free context khi viết long-form post

```
[Viết post 4000 từ về Kafka, conversation 60K tokens]
                  ↓
[Đầu conversation: outline + research notes — quan trọng]
[Giữa: 40K tokens debug code snippets, format chỉnh sửa]
[Sắp đầy context]
                  ↓
/rewind → Summarize from here → chọn điểm sau outline xong
                  ↓
"Focus summary on code snippets that worked, skip dead-ends"
                  ↓
[Giờ context: outline (full) + summary (5K) + working space]
Viết tiếp conclusion với fresh space
```

### Use case 5: Refactor blog template safely

```
1. Trước refactor → checkpoint auto
2. "Refactor BlogPost component, tách thành smaller components"
3. Claude làm refactor → 8 file changes
4. Run preview → broken (forgot to update import)
5. "Fix the import error"
6. Claude fix → still broken in unrelated way
7. "Hmm, just rewind"
8. Esc + Esc → Restore code and conversation → chọn checkpoint trước refactor
9. "Refactor smaller this time, just extract Hero component first"
10. Iterate incrementally
```

## 11. Câu hỏi thường gặp (FAQ)

### Q1: Checkpoints có persistent qua sessions không?

**Không persistent** qua sessions. Khi đóng Claude Code và mở lại session mới, checkpoints session cũ không truy cập được.

Workaround:

- Dùng `--continue` để resume session với checkpoints intact
- Hoặc commit git ở các milestone quan trọng cho persistence thật sự

### Q2: Checkpoints chiếm storage bao nhiêu?

Implementation-specific, nhưng:

- Mỗi checkpoint là **delta** (diff từ previous state), không full copy
- Conversation messages compact (text)
- File snapshots dùng diff-based storage
- Không phải lo về storage trong session

Sau khi session end, checkpoint data thường được cleanup tự động.

### Q3: Có thể disable Checkpoints không?

Documentation hiện tại không nêu cách disable. Vì là built-in safety feature, Anthropic recommend giữ enable.

Nếu cần performance: Checkpoints nhẹ, không impact đáng kể.

### Q4: Rewind có affect git history không?

**Không.** Rewind chỉ ảnh hưởng:

- Files trong working directory (Claude's edits)
- Conversation state

Git history (commits, branches) **không bị thay đổi** bởi rewind. Nếu Claude `git commit` qua bash, commit đó vẫn còn (vì bash ops không tracked).

### Q5: Esc + Esc có conflict với phím tắt khác không?

Trong Claude Code:

- `Esc` (1 lần) — interrupt current operation
- `Esc + Esc` (2 lần liên tiếp nhanh) — open rewind interface

Một số terminals có Esc behavior riêng, nhưng Claude Code handle Esc+Esc shortcut.

Alternative: dùng `/rewind` command nếu Esc+Esc không work.

### Q6: Summarize có thể custom không?

Có, dùng **optional instructions** khi chọn Summarize:

```
/rewind → Summarize from here

[Optional instruction prompt]:
"Focus on architectural decisions and skip implementation details"
"Preserve all error messages and stack traces"
"Compress only the failed attempts, keep successful approaches"
```

→ Summary sẽ focus theo instructions của bạn.

### Q7: Checkpoint có thể "share" với teammate không?

**Không trực tiếp.** Checkpoints là local session state, không export/import được.

Workaround share:

1. **Git commits** cho code state
2. **Session transcript** (`~/.claude/projects/{project}/{session}/transcript.jsonl`) cho conversation history
3. **Branch off** với fork để share session approach

### Q8: Khi nào nên dùng Rewind vs Fork?

| Tình huống | Use |
|------------|-----|
| Sai hướng, muốn quay lại và đi đường khác | **Rewind** |
| Muốn thử "what if" parallel với approach hiện tại | **Fork** |
| Chỉ context đầy, cần free space | **Summarize** |
| Muốn 2+ branches từ checkpoint cùng lúc | **Fork** (multiple times) |

### Q9: Bash tools nào CÓ track? Khác gì với file editing tools?

- ✅ **Tracked:** Write, Edit, Multi-Edit, Create (Claude's file editing tools)
- ❌ **NOT tracked:** Bash (kể cả khi Bash sửa file qua `echo > file`, `sed`, scripts)

Lý do: Bash là "black box" — Claude không introspect được full effect của bash command. File editing tools có structured API — trackable.

### Q10: Tôi đã rewind nhưng nhận ra nhầm, có "redo" được không?

**Không có redo built-in** trong Claude Code (theo docs hiện tại).

Workaround:

- Trước khi rewind, **note xuống** state hiện tại quan trọng
- Hoặc git commit / stash trước rewind
- Sau rewind nếu sai → re-prompt Claude với context: "Trở về approach trước, code làm như sau: [paste]"

### Q11: Multiple users session có gây xung đột checkpoint không?

Mỗi session Claude Code là independent. Không có multi-user sessions cùng checkpoint pool.

Trong Agent Teams, mỗi teammate có context riêng → checkpoints riêng (nếu support).

### Q12: Có "undo last action" thay vì full rewind không?

Không có "undo last action" granular. Rewind level là **per-prompt** (mỗi user prompt = 1 checkpoint).

Workaround granular:

- Sau khi Claude làm action sai → bấm Esc+Esc → chọn checkpoint của prompt vừa rồi → restore
- Equivalent với "undo last prompt"

### Q13: Checkpoint trên Windows/Linux/Mac có khác nhau không?

Behavior giống nhau cross-platform. Phím tắt Esc+Esc và `/rewind` work identical trên Windows, Linux, Mac.

### Q14: Summarize có miss thông tin quan trọng không?

Có rủi ro. Summary là AI-generated — có thể omit details. Best practices:

- **Provide instructions** focus summary
- **Đọc summary** sau khi tạo, verify thấy quan trọng được giữ
- **Original messages preserved** trong transcript — Claude tham khảo được nếu cần
- Khi không chắc, prefer **Restore conversation** thay vì Summarize

### Q15: Subagent activity có vào checkpoint không?

Có. Subagent's file edits qua Write/Edit tools **đều tracked** giống main agent. Conversation với subagent (qua Task/Agent tool) có trong main session transcript.

→ Rewind sẽ undo cả subagent's file changes nếu chọn "Restore code".

## 12. Kết luận

Checkpoints là **safety net invisible** của Claude Code — bạn không cần thiết lập gì, không cần lo lắng gì, nhưng nó luôn ở đó khi cần. Khuyến nghị workflow:

1. **Trust auto-checkpoint** — Claude Code tự save trước mỗi prompt và mỗi file edit, không cần manual
2. **Hiểu rõ 5 options** — quan trọng nhất là phân biệt "restore code" vs "restore conversation" vs "restore both"
3. **Dùng "Summarize from here"** thay vì `/compact` khi muốn giữ initial context full
4. **Combine với git** — checkpoint cho experimentation in-session, git cho persistence thật sự
5. **Rewind early** khi nhận ra Claude đi sai hướng — đừng cố cứu approach hỏng
6. **Watch out for bash ops** — `rm`, `mv`, `git reset --hard` không undo được qua rewind, dùng git stash/commit trước
7. **Experiment freely** — đây là toolkit cho ambitious tasks, hãy thử nghiệm tự do

Kết hợp với 7 module trước trong series Claude Code, Checkpoints là "đảm bảo cuối cùng" — kể cả khi automation phức tạp (hooks, plugins, subagents) làm gì đó sai, bạn luôn có Esc+Esc để quay lại điểm an toàn.

Hãy thử ngay: lần tiếp theo gặp tình huống "Claude làm sai mà không biết khôi phục thế nào", bấm `Esc + Esc` và explore 5 options. Trong vòng 1 tuần, checkpoints sẽ trở thành phản xạ tự nhiên trong workflow của bạn — và bạn sẽ thấy mình dám thử nhiều ý tưởng táo bạo hơn vì biết luôn có đường lùi an toàn!
