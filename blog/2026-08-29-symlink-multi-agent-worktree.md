---
slug: symlink-multi-agent-worktree
title: "Symlink trong dự án multi-agent: những cú gãy im lặng và cách vá"
description: "Năm sự cố symlink có thật khi dựng hệ multi-agent cho pinit — từ một MCP server exit 0 không nói gì, tới cái symlink 28 byte phải commit vào git."
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Git, Claude, AI, Agents, DevTools, Terminal]
date: '2026-08-29T09:00:00Z'
image: /covers/blog/symlink-multi-agent-worktree.png
---

Một MCP server chết mà không để lại gì. Exit code 0. stdout rỗng. stderr rỗng. Thứ duy nhất tôi có là một dòng của phía client: `Failed to reconnect to memory: -32000`.

Tôi đã đổ lỗi cho mạng, cho registry npm, cho cache của `npx`. Mất khá lâu mới nhìn ra thủ phạm là một **symlink** — cái symlink mà `npx` vẫn luôn tạo ra, ở đúng chỗ nó vẫn luôn nằm, không hỏng gì cả. Chỉ là Node 26 bắt đầu nghĩ khác về nó.

Bài này gom năm sự cố cùng họ đã gặp khi dựng hệ multi-agent cho [pinit](/blog/multi-agent-claude-code-worktree-tmux): mỗi cái đều có chung một hình dạng — **con trỏ còn nguyên, cái được trỏ tới thì không**, và không có thứ gì trong chuỗi công cụ chịu la lên.

<!-- truncate -->

---

## Mục lục

1. [Node 26, `npx` và một server không nói gì](#s1)
2. [Vá xong lại sinh ra chỗ mù: `skip-worktree`](#s2)
3. [Git lưu symlink thế nào — mode `120000`](#s3)
4. [Tương đối sống, tuyệt đối chết](#s4)
5. [Installer bỏ sót Claude Code](#s5)
6. [Dangling theo thiết kế](#s6)
7. [Toàn cảnh](#s7)
8. [Checklist cho repo có agent](#s8)

---

## 1. Node 26, `npx` và một server không nói gì {#s1}

### Hiện tượng

`.mcp.json` khai server `memory` theo đúng cách tài liệu hướng dẫn:

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@ai-devkit/memory"]
    }
  }
}
```

Claude Code báo `Failed to reconnect to memory: -32000`. Chạy tay thì còn khó chịu hơn — lệnh trả về ngay lập tức, sạch sẽ, như thể đã làm xong việc:

```bash
npx -y @ai-devkit/memory
echo $?   # 0
```

Không một byte nào ra stdout. MCP server dùng stdio để nói chuyện, mà nó không nói gì, nên client chờ rồi bỏ cuộc.

### Nguyên nhân

`dist/index.js` của package chỉ khởi động server khi nó tin rằng mình là entrypoint:

```js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runServer()
}
```

Đây là guard quen thuộc, phiên bản ESM của `if __name__ == "__main__"`. Vấn đề nằm ở hai vế:

- `npx` chạy binary qua symlink `node_modules/.bin/ai-devkit-memory`, nên **`process.argv[1]` là đường dẫn symlink**.
- `import.meta.url` thì luôn là **realpath** — đường dẫn thật sau khi đã resolve.

Trên Node 26, hai vế không còn khớp nhau. Guard trả về `false`, `runServer()` không bao giờ chạy, file load xong rồi thoát êm ru với exit code 0.

Điều đáng nhớ: guard này có từ phiên bản 0.14.0, tức là **package không hề regression**. Thứ đổi là hành vi của Node. Một dòng code đứng yên nhiều tháng bỗng sai đi vì tầng dưới nó đổi cách nhìn symlink.

### Cách phát hiện

Bước cứu tôi là bỏ hẳn `npx` ra khỏi phương trình và chạy đúng cái file mà `npx` sẽ chạy:

```bash
# qua npx: im lặng, exit 0
npx -y @ai-devkit/memory

# gọi thẳng file thật: server lên, giữ stdio, không thoát
node /opt/homebrew/lib/node_modules/ai-devkit/node_modules/@ai-devkit/memory/dist/index.js
```

Cùng một file, hai kết quả. Khác biệt duy nhất giữa hai lần chạy là một bên đi qua symlink. Xác nhận bằng chính hai vế của guard:

```bash
node -e 'console.log("realpath:", require("fs").realpathSync(process.argv[1]))' \
     node_modules/.bin/ai-devkit-memory
```

`process.argv[1]` giữ nguyên đường dẫn `.bin/...` bạn gõ vào, còn realpath thì trỏ sang `dist/index.js`. Đó đúng là hai vế mà guard đem ra so.

### Cách vá

Trỏ thẳng vào file thật, không đi qua `.bin/`:

```json
{
  "mcpServers": {
    "memory": {
      "command": "node",
      "args": [
        "/opt/homebrew/lib/node_modules/ai-devkit/node_modules/@ai-devkit/memory/dist/index.js"
      ]
    }
  }
}
```

> ⚠️ Ngõ cụt đã thử, đừng thử lại: `NODE_OPTIONS=--preserve-symlinks-main` **có** làm hai vế khớp lại, nhưng phá tiếp `import './server.js'` bên trong (module được resolve theo `.bin/` thay vì `dist/`). Và nếu đặt biến đó ở cấp shell thì nó phá luôn chính `npx`, vì `/opt/homebrew/bin/npx` cũng là một symlink.

### Bài học

Symlink không chỉ là chuyện của filesystem. Nó là chuyện của **mọi runtime tự hỏi "tôi là ai"**. Bất cứ chỗ nào code so sánh hai đường dẫn mà một vế đã resolve còn vế kia thì chưa, chỗ đó là một quả mìn chờ ngày đổi runtime.

---

## 2. Vá xong lại sinh ra chỗ mù: `skip-worktree` {#s2}

Bản vá ở trên đúng, nhưng nó nhét một đường dẫn tuyệt đối của **máy tôi** vào một file **tracked**. `/opt/homebrew/...` là chuyện riêng của macOS + Homebrew; máy khác clone về là gãy.

Repo có 5–6 worktree, sửa cái nào thì cái đó dirty. Cách tôi chọn là bảo git lờ file đó đi:

```bash
git update-index --skip-worktree .mcp.json
```

Kiểm tra cờ:

```bash
git ls-files -v .mcp.json
# S .mcp.json      ← chữ S hoa là skip-worktree
```

Từ đây, bản trong git giữ `npx` (đúng cho người khác clone về), bản trên đĩa giữ đường dẫn `node` thật.

### Con dao hai lưỡi

`skip-worktree` giải quyết đúng vấn đề nó sinh ra để giải quyết, và tạo ra một vấn đề mới: **file đó biến mất khỏi radar**.

Sửa `.mcp.json` — thêm server, xoá server, làm hỏng JSON — `git status` vẫn xanh mướt. Với một repo mà nhiều agent cùng chạy, đây là loại chỗ mù nguy hiểm: một script đi ngang qua ghi đè cả file, không ai biết.

Chuyện đó đã xảy ra. Hàm `setup_mcp` trong `~/bin/pinit-agents.sh` ban đầu dùng `cat >` ghi đè toàn bộ `.mcp.json` bằng một template chỉ có mỗi entry `memory`. Ngày repo commit thêm server `agentic-mermaid`, mỗi lần chạy `agents mcp-fix` là xoá sạch entry đó ở mọi worktree — mà vì file đang `skip-worktree`, git im lặng tuyệt đối.

Bản vá là chỉ đụng đúng một key thay vì viết đè cả file:

```bash
jq '.mcpServers.memory = {command: "node", args: [$p]}' \
   --arg p "$mem_path" .mcp.json > .mcp.json.tmp && mv .mcp.json.tmp .mcp.json
```

### Và cách commit thêm entry mà không làm lộ đường dẫn máy

Khi cần commit một server mới vào bản git, đừng gỡ cờ rồi `git add` — làm thế là đẩy `/opt/homebrew/...` lên remote. Stage thẳng một blob khác với file trên đĩa:

```bash
H=$(git hash-object -w /tmp/mcp-committed.json)    # nội dung = bản HEAD + entry mới
git update-index --cacheinfo 100644,$H,.mcp.json   # cờ S bị xoá ở bước này
git commit -m "chore(mcp): thêm server agentic-mermaid"
git update-index --skip-worktree .mcp.json         # BẮT BUỘC set lại
```

Bước cuối không phải tuỳ chọn. Quên nó thì lần rebase sau, file local của bạn sẽ bị coi là thay đổi thật.

### Bài học

Config **máy-cụ-thể** không được commit — nhưng "không commit" có nhiều mức, và mỗi mức phải trả một cái giá:

| Cách | Được | Mất |
|---|---|---|
| `.gitignore` | git thật sự quên nó | file phải là untracked ngay từ đầu |
| `skip-worktree` | file tracked vẫn giữ bản riêng | **mất khả năng thấy thay đổi**, rebase phải gỡ cờ thủ công |
| Config ở scope user | nằm ngoài repo, không đụng git | rule `deny` của project không còn phủ tới |

Với MCP server có secret, tôi chọn cách thứ ba: khai ở `~/.claude.json` qua `claude mcp add --scope user`, để token đọc từ biến môi trường chứ không phải từ file trong repo.

---

## 3. Git lưu symlink thế nào — mode `120000` {#s3}

Bốn sự cố còn lại đều dựa trên một chi tiết mà nếu không biết thì mọi thứ phía sau đều khó hiểu, nên tách ra ở đây.

Git không lưu symlink như một thuộc tính của file. Nó lưu symlink thành **một blob bình thường, nội dung là chuỗi đường dẫn**, và đánh dấu bằng file mode `120000` trong tree.

Tự kiểm chứng trên repo này:

```bash
git ls-files -s .claude/skills/archify
# 120000 d1b7c8e570f4560b3083a79b6ed24e0bc597ecee 0	.claude/skills/archify
```

Cột đầu là mode. Ba giá trị hay gặp: `100644` file thường, `100755` file có cờ thực thi, `120000` symlink. Đọc thẳng nội dung blob:

```bash
git cat-file -p d1b7c8e570f4560b3083a79b6ed24e0bc597ecee
# ../../.agents/skills/archify

git cat-file -s d1b7c8e570f4560b3083a79b6ed24e0bc597ecee
# 28
```

28 byte. Đúng bằng độ dài chuỗi `../../.agents/skills/archify`. Không có gì khác trong đó.

Hệ quả cần nhớ, và là gốc của mọi thứ còn lại trong bài:

> **Git commit con trỏ, không commit cái được trỏ tới.** Hai đầu là hai thứ độc lập hoàn toàn. Commit một đầu thì đầu kia không tự theo.

Kịch bản gãy im lặng khi chỉ commit một đầu:

- **Chỉ commit symlink, không commit đích** → clone mới có mũi tên trỏ vào khoảng không. `ls -la` vẫn thấy dòng symlink đẹp đẽ; mở ra mới báo `No such file or directory`.
- **Chỉ commit đích, không commit symlink** → file thật có đủ, nhưng công cụ nào tìm nó qua đường dẫn symlink sẽ báo "không có". Đây chính là ca ở [mục 5](#s5).

Cả hai ca đều không làm hỏng `git status`, không làm fail `npm run lint`, không làm fail `npm run build`. Chúng chỉ làm hỏng lúc chạy.

---

## 4. Tương đối sống, tuyệt đối chết {#s4}

Skill `archify` (renderer sinh diagram HTML) được cài ở `.agents/skills/archify`, còn Claude Code thì chỉ quét `.claude/skills/`. Nối hai chỗ bằng một symlink:

```bash
ls -la .claude/skills/archify
# lrwxr-xr-x  1 pinnguyen  staff  28 Aug 29 19:53 .claude/skills/archify -> ../../.agents/skills/archify
```

Chữ `l` đầu dòng `lrwxr-xr-x` là symlink. `28` là kích thước — lại đúng con số đó, vì kích thước của một symlink chính là độ dài chuỗi nó chứa.

### Vì sao tách làm hai chỗ

Không phải để cho đẹp. Cùng một skill cần được nhiều CLI agent khác nhau đọc — Claude Code, Codex, Cline, Amp, Antigravity — và mỗi CLI có quy ước thư mục riêng. Nếu copy bản thật vào từng chỗ thì có 5 bản, sửa một chỗ là lệch bốn chỗ còn lại. Một nguồn sự thật ở `.agents/`, các chỗ khác là con trỏ.

### Vì sao phải tương đối

Đây là chỗ dễ sai nhất, và repo này đang có sẵn cả hai kiểu để so sánh trực tiếp. Đếm thử:

```bash
git ls-files -s .claude/skills | awk '$1 == 120000' | wc -l
#       20
```

20 symlink được commit. Đọc byte đầu của từng cái để phân loại:

```bash
git ls-files -s .claude/skills | awk '$1 == 120000 {print $2}' \
  | while read h; do git cat-file -p "$h" | head -c 1; echo; done \
  | sort | uniq -c
#    1 .
#   19 /
```

**19 cái tuyệt đối, 1 cái tương đối.** Cái tương đối là `archify`. 19 cái kia trông thế này:

```bash
git cat-file -p 0203eea8bd330a99c65f9f06f1d10998462fda66
# /Users/pinnguyen/.ai-devkit/skills/codeaholicguy/ai-devkit/skills/dev-commit
```

76 byte, và trong đó có tên tài khoản của tôi.

Khác biệt hiện ra ngay khi đường dẫn gốc đổi:

| | Symlink tương đối | Symlink tuyệt đối |
|---|---|---|
| Clone về `~/code/pinit` | sống | **chết** |
| `git worktree add` ra thư mục khác | sống | **chết** |
| Máy đồng nghiệp (user khác) | sống | **chết** |
| CI runner | sống | **chết** |
| Đích nằm ngoài repo | không biểu diễn được | dùng được |

`../../.agents/skills/archify` là quan hệ **giữa hai vị trí trong cùng cây thư mục**. Cây đó di chuyển đi đâu thì quan hệ vẫn đúng. `/Users/pinnguyen/...` thì neo vào một máy cụ thể, và neo cả vào một cái tên người cụ thể.

Đây vẫn là món nợ đang nằm đó trong repo: 19 symlink kia trỏ ra `~/.ai-devkit/` — một thư mục **ngoài** repo, nên không có cách nào viết chúng bằng đường dẫn tương đối. Chúng chỉ chạy được trên máy tôi. Cách đúng là đừng commit chúng, để mỗi máy tự sinh lúc cài — nhưng đó là việc chưa làm, và tôi để nguyên ở đây thay vì im lặng, vì nó minh hoạ đúng cái luật: **symlink tuyệt đối thì đừng commit; muốn commit thì phải viết được bằng đường dẫn tương đối.**

---

## 5. Installer bỏ sót Claude Code {#s5}

### Hiện tượng

Renderer `archify` nặng 6.7MB. Không có lý do gì để nhét binary đó vào git, nên `.agents/` bị gitignore, và repo chỉ commit `skills-lock.json` — file khoá ghi nguồn và hash:

```json
{
  "version": 1,
  "skills": {
    "archify": {
      "source": "tt-a1i/archify",
      "sourceType": "github",
      "skillPath": "archify/SKILL.md",
      "computedHash": "c70030802b37b476e00eadb1748e919243592d2d24021e174c8b3a43d6b3cc94"
    }
  }
}
```

Lệnh khôi phục là `npx skills experimental_install`. Chạy xong, mọi thứ báo thành công:

```bash
npx -y skills experimental_install
node .agents/skills/archify/bin/archify.mjs doctor
# 15/15 ok
```

Renderer chạy. `doctor` xanh hết. Nhưng skill `archify` **không xuất hiện** trong danh sách skill của Claude Code.

### Nguyên nhân

`experimental_install` dựng lại `.agents/skills/archify` rồi wire symlink cho các CLI mà nó biết — Codex, Cline, Amp, Antigravity — và **bỏ sót `.claude/skills/`**.

Tôi đã đo hai lần để chắc không phải lỗi trạng thái sẵn có: chạy restore trong một thư mục trống, và chạy trong thư mục đã có sẵn `.claude/skills/`. Cả hai lần `.claude/skills/` vẫn không có `archify`.

Điểm cần phân biệt: lệnh `skills add` lúc cài lần đầu **có** in ra `symlinked: Claude Code`. Khác biệt nằm ở `experimental_install`, không nằm ở `add`. Nếu chỉ thử lệnh `add` thì sẽ không bao giờ thấy bug này.

### Cách vá

Vì thứ thiếu là một con trỏ 28 byte chứ không phải 6.7MB dữ liệu, cách rẻ nhất là **commit chính cái symlink**:

```bash
git add .claude/skills/archify
git ls-files -s .claude/skills/archify
# 120000 d1b7c8e5... 0	.claude/skills/archify
```

Và ghi rõ ý định ngay tại `.gitignore`, cạnh dòng gây ra nó — vì người đọc dòng `.agents/` sáu tháng nữa sẽ là người cần biết:

```gitignore
# archify skill (6.7MB renderer) — không commit binary, khôi phục từ skills-lock.json:
#   npx skills experimental_install
# Symlink .claude/skills/archify thì CÓ commit (28 byte): experimental_install chỉ
# dựng lại .agents/ và wire cho Codex/Cline/Amp..., bỏ sót Claude Code — clone mới
# mà thiếu symlink thì Claude Code không thấy skill dù renderer đã có.
.agents/
```

### Bài học

Khi công cụ bên thứ ba lo giúp bạn một phần của việc, **hãy kiểm phần nó lo cho bạn cụ thể**, đừng kiểm phần chung. `archify doctor` xanh 15/15 chứng minh renderer khoẻ, và nói đúng **không** một chữ nào về việc agent có thấy skill hay không. Hai câu hỏi khác nhau, dễ nhầm là một.

Kiểm chứng đúng là kiểm chứng ở đầu ra mà bạn thật sự cần:

```bash
test -L .claude/skills/archify && echo "có symlink" || echo "THIẾU symlink"
test -e .claude/skills/archify && echo "đích sống" || echo "DANGLING"
```

Hai lệnh, hai câu hỏi khác nhau. `-L` hỏi "có phải symlink không", `-e` hỏi "đi theo nó có tới đâu không". Một symlink dangling trả lời **có** cho câu đầu và **không** cho câu sau — đó chính là chữ ký của loại lỗi này.

---

## 6. Dangling theo thiết kế {#s6}

Ghép hai quyết định ở trên lại — gitignore `.agents/`, commit symlink — sẽ ra một hệ quả nghe như bug nhưng là cố ý:

**Mọi clone và mọi worktree mới đều bắt đầu bằng một symlink dangling.**

Con trỏ tới từ git. Cái được trỏ tới thì không, vì nó bị ignore. Khoảng thời gian giữa `git clone` và `npx skills experimental_install` là khoảng thời gian symlink trỏ vào khoảng không, và đó là trạng thái bình thường.

Quét thử toàn bộ worktree đang có:

```bash
git worktree list | awk '{print $1}' | while read p; do
  printf '%-30s ' "$(basename "$p")"
  if [ -L "$p/.claude/skills/archify" ]; then
    [ -e "$p/.claude/skills/archify" ] && echo "OK" || echo "DANGLING (thiếu .agents/)"
  else
    echo "không có symlink"
  fi
done
```

Kết quả trên máy tôi lúc viết bài:

```
pinit                          OK
pinit-create-new-blog          OK
pinit-fix-script-agents-sh     OK
pinit-glossary                 không có symlink
pinit-research-archify         OK
```

`pinit-glossary` rơi vào ca thứ ba, và đó là ca thú vị nhất: nó không dangling, nó **không có gì cả**. Lý do là branch của nó tách ra trước khi symlink được commit:

```bash
git merge-base --is-ancestor bb5a55b feat/glossary && echo "có" || echo "chưa có"
# chưa có
```

Branch `feat/glossary` dừng ở `699bbf4` (25/08), còn commit `bb5a55b` thêm symlink là ngày 29/08. Agent nào đang chạy trong worktree đó sẽ không thấy skill `archify` — và nó sẽ không thấy vì một lý do hoàn toàn khác với "chưa chạy bootstrap". Chẩn sai một cái là mất một buổi.

Nên khi debug, phân biệt ba trạng thái, đừng gộp:

| `test -L` | `test -e` | Nghĩa | Cách chữa |
|:---:|:---:|---|---|
| ✅ | ✅ | bình thường | không cần gì |
| ✅ | ❌ | dangling — thiếu đích | `npx skills experimental_install` |
| ❌ | ❌ | **thiếu cả con trỏ** | rebase lên `main` để lấy commit symlink |

### Cách vá: đặt bootstrap vào chỗ không thể quên

Một bước thủ công mà người ta phải nhớ thì sớm muộn cũng bị quên. Nên nó được ghim ở hai nơi:

**Một** — trong `CLAUDE.md`, để agent tự đọc được luật thay vì phải hỏi:

```markdown
## Bootstrap worktree mới

`.agents/` bị gitignore (renderer archify 6.7MB), nên worktree mới clone về là
thiếu skill. Dựng lại bằng:

    npx skills experimental_install    # đọc skills-lock.json, khôi phục đúng hash
```

**Hai** — trong `~/bin/pinit-agents.sh`, để `agents create` tự chạy sau `npm install`:

```bash
skills_install_at() {
  local p="$1"
  [ -f "$p/skills-lock.json" ] || return 0
  ( set +u; cd "$p" || exit 1; npx -y skills experimental_install )
}
```

Hai chi tiết trong hàm mười dòng này đều là kết quả của việc đã vấp:

- **Nó không tự tạo symlink.** Symlink đến từ git. Nếu script cũng tạo symlink thì hai nguồn cùng ghi vào một chỗ, và ngày chúng lệch nhau sẽ rất khó tìm.
- **Lỗi thì cảnh báo, không chặn.** Lệnh còn mang nhãn `experimental_` nên phải coi là best-effort. Một agent không vẽ được diagram vẫn làm được mọi việc khác; chặn `agents create` vì nó thì đắt hơn nhiều so với cái mất.

`agents sync` cũng gọi lại hàm này khi hash của `skills-lock.json` đổi, hoặc khi `.agents/skills` trống — nên worktree cũ tự bắt kịp mà không cần ai nhớ.

Còn nếu một ngày CLI bên thứ ba chết hẳn — package bị gỡ, GitHub source biến mất — thì đường thoát là copy từ một worktree đang sống. Renderer là thư mục thường, không có gì đặc biệt:

```bash
cp -R ~/Desktop/pinit/pinit/.agents/skills/archify \
      ~/Desktop/pinit/pinit-moi/.agents/skills/archify
```

Symlink đã có sẵn từ git, nên chép xong là đích có người ở và mũi tên hết trỏ vào khoảng không.

---

## 7. Toàn cảnh {#s7}

Sơ đồ dưới đây gom mục 3 tới mục 6 vào một hình: thứ gì nằm trong git, thứ gì phải dựng lại trên đĩa, và chỗ nào là chỗ gãy.

<style>
/* embed=1 ẩn toolbar/header/cards và đặt overflow:hidden — thiếu chiều cao là cắt
   mất hình chứ không cuộn được. Đo thật ở 380/600/700/800/900px: tỉ lệ cao/rộng
   đứng yên ở ~0.716, nên một aspect-ratio là đủ, không cần media query. */
.archify-embed {
  display: block;
  width: 100%;
  aspect-ratio: 1080 / 780;
  border: 1px solid rgba(127, 127, 127, 0.28);
  border-radius: 12px;
}
</style>

<figure style="margin: 2em 0;">
  <iframe
    class="archify-embed"
    src="/diagrams/symlink-skill.html?embed=1"
    title="Sơ đồ: symlink skill archify từ git object tới worktree mới"
    loading="lazy"
  ></iframe>
  <figcaption style="margin-top: 0.9em; font-size: 0.9em; line-height: 1.6; opacity: 0.78;">
    Đường xanh đậm là dòng chính: blob <code>120000</code> → symlink → renderer thật → agent thấy skill.
    Nhánh đỏ là chỗ gãy. Trên màn hình hẹp chữ sẽ nhỏ —
    <a href="/diagrams/symlink-skill.html" target="_blank" rel="noopener">mở riêng ↗</a>
    để dùng zoom, search node và trace quan hệ.
  </figcaption>
</figure>

Đọc hình theo hai chiều:

- **Ngang** là dòng chính đang chạy tốt. Git giữ đúng hai thứ nhẹ — blob 28 byte và `skills-lock.json`. Checkout dựng lại symlink, bootstrap dựng lại renderer, symlink resolve qua `../../` tới renderer, Claude Code quét `.claude/skills/` và thấy skill.
- **Dọc** là hai chỗ gãy. Nhánh `.gitignore → thiếu .agents/` là dangling theo thiết kế, chữa bằng bootstrap. Nhánh `experimental_install → Codex · Cline · Amp` là chỗ installer lo giúp — và Claude Code không nằm trong danh sách đó, nên đầu vào của nó phải đến từ git.

---

## 8. Checklist cho repo có agent {#s8}

Năm sự cố trên rút lại thành sáu câu hỏi. Chúng ngắn vì mỗi câu đã tốn ít nhất một buổi để học.

**1. Symlink trong repo phải là đường dẫn tương đối.**
Tuyệt đối thì chỉ chạy trên máy đã tạo ra nó. Kiểm cả repo bằng một lệnh:

```bash
git ls-files -s | awk '$1 == 120000 {print $2}' \
  | while read h; do git cat-file -p "$h"; echo; done \
  | grep '^/' && echo "^ những cái này neo vào một máy cụ thể"
```

**2. Commit cả hai đầu, hoặc commit một đầu kèm bước bootstrap.**
Git commit con trỏ và cái được trỏ tới như hai thứ rời nhau. Chọn commit một đầu là hợp lệ — nhưng lúc đó bước dựng lại đầu kia phải là một lệnh có thật, chạy tự động, không phải một câu trong đầu ai đó.

**3. Luật viết vào `CLAUDE.md`, không để trong trí nhớ.**
Agent đọc file, không đọc được ký ức của bạn. Một quyết định kiểu "cái này cố ý gitignore, dựng lại bằng lệnh kia" mà không viết ra thì agent sau sẽ tự suy diễn — và suy diễn hợp lý nhất thường là "chắc hỏng, để mình sửa".

**4. Comment ý định ngay tại dòng gây ra hệ quả.**
Dòng `.agents/` trong `.gitignore` trông vô hại. Sáu dòng comment phía trên nó là thứ ngăn người tiếp theo gỡ nó ra.

**5. Kiểm ở đầu ra bạn cần, không kiểm ở health check gần đó.**
`archify doctor` 15/15 không trả lời câu hỏi "agent có thấy skill không". `claude mcp list` báo ✔ Connected không trả lời câu hỏi "token có hợp lệ không". Health check trả lời câu hỏi của nó, không phải câu hỏi của bạn.

**6. Mọi cơ chế giấu file khỏi git đều phải trả giá bằng một chỗ mù.**
`skip-worktree` cho bạn giữ bản riêng của một file tracked, đổi lại `git status` không còn nói thật về file đó nữa. Dùng thì phải nhớ mình đang mù ở đâu — và tốt nhất là ghi luôn danh sách đó ra:

```bash
git ls-files -v | grep '^S'
```

---

Điều đáng nhớ nhất sau cả năm sự cố: chúng **không hỏng ở chỗ chúng sai**. MCP server exit 0. `archify doctor` xanh. `git status` sạch. `npm run lint` và `npm run build` đều pass. Mọi tín hiệu bạn quen nhìn đều nói ổn, trong khi thứ bạn cần thì không có ở đó.

Symlink là một con trỏ, và con trỏ thì không biết tự la lên khi cái nó trỏ tới biến mất — nó chỉ im lặng trỏ tiếp. Trong một repo mà nhiều agent cùng đọc cùng ghi, sự im lặng đó nhân lên: mỗi worktree là một cơ hội để một đầu của symlink có mặt còn đầu kia thì không.

Nên phần lớn công việc không nằm ở chỗ hiểu symlink. Nó nằm ở chỗ **dựng sẵn cái lệnh cho phép mình hỏi thẳng**, thay vì suy đoán từ những tín hiệu xanh ở gần đó.
