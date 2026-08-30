---
slug: ai-devkit-symlink-cong-thuc-va-ket-qua
title: "Git nên giữ công thức, không giữ kết quả: đọc mã nguồn ai-devkit để trả một món nợ symlink"
description: "Bài trước tôi để lại 19 symlink trỏ vào /Users/pinnguyen trong một repo public. Bài này đọc mã nguồn ai-devkit xem chuỗi đó sinh ra từ đâu, rồi trả nợ."
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Git, Claude, AI, Agents, DevTools, NodeJS]
date: '2026-08-30T14:00:00Z'
image: /covers/blog/ai-devkit-symlink-cong-thuc-va-ket-qua.png
---

Bài [Symlink trong dự án multi-agent](/blog/symlink-multi-agent-worktree) kết lại bằng một món nợ tôi không giấu: repo pinit — **public** — đang commit 19 symlink trỏ thẳng vào `/Users/pinnguyen/.ai-devkit/...`. Chúng chỉ chạy trên máy tôi. Ai clone về là mất sạch skill `dev-*`, `task`, `tdd`, `verify`, mà không có một dòng lỗi nào.

Lúc đó tôi viết là "chưa trả được, cần một task riêng". Bài này là task đó.

Và hoá ra thứ đáng viết không phải cách sửa — sửa chỉ mất mười phút. Đáng viết là **vì sao chuỗi `/Users/pinnguyen` lại chui vào đó**, mà muốn biết thì phải mở mã nguồn của ai-devkit ra đọc.

<!-- truncate -->

---

## Mục lục

1. [Hai thư mục, một con trỏ](#s1)
2. [Đọc mã nguồn: chuỗi đó từ đâu ra](#s2)
3. [Tuyệt đối là đúng — commit nó mới sai](#s3)
4. [Công thức và kết quả](#s4)
5. [Bước kiểm quyết định](#s5)
6. [Trả nợ](#s6)
7. [Lần đầu cơ chế chạy thật](#s7)

---

## 1. Hai thư mục, một con trỏ {#s1}

`ai-devkit init` dựng ra một cấu trúc hai tầng. Tầng dưới là kho chung, nằm ngoài mọi repo:

```bash
du -sh ~/.ai-devkit/skills
#  24M

ls ~/.ai-devkit/skills/codeaholicguy/ai-devkit/skills/ | wc -l
#  27
```

27 skill, 24MB, dùng chung cho **mọi project** trên máy. Đây là bản thật — thư mục thường, không phải symlink:

```bash
test -L ~/.ai-devkit/skills/codeaholicguy/ai-devkit/skills/dev-commit \
  && echo "symlink" || echo "thư mục thật"
#  thư mục thật
```

Tầng trên là con trỏ trong từng repo, để Claude Code nhìn thấy skill:

```bash
readlink .claude/skills/dev-commit
#  /Users/pinnguyen/.ai-devkit/skills/codeaholicguy/ai-devkit/skills/dev-commit
```

Thiết kế này hợp lý: 27 skill × N project mà chỉ lưu một bản. Vấn đề nằm ở chuỗi vừa in ra.

---

## 2. Đọc mã nguồn: chuỗi đó từ đâu ra {#s2}

Không ai gõ `/Users/pinnguyen` vào đâu cả. Nó rơi ra từ hai biến lúc chạy. Mở gói đã cài toàn cục:

```bash
find "$(npm root -g)/ai-devkit/dist" -name 'SkillManager.js' -not -path '*__tests__*'
```

Trong `dist/lib/SkillManager.js`, hàm dựng ngữ cảnh cài đặt:

```js
buildInstallContext(selectedEnvironments, options) {
    const { targets, capableEnvironments } =
        this.resolveInstallationTargets(selectedEnvironments, options.global);
    return {
        baseDir: options.global ? os.homedir() : process.cwd(),
        capableEnvironments,
        installMode: options.global ? 'global' : 'project',
        targets
    };
}
```

`os.homedir()` của Node trên macOS trả về `/Users/pinnguyen` — nó đọc từ biến môi trường `HOME` của máy đang chạy. Registry `codeaholicguy/ai-devkit` được clone về dưới đó, rồi đường dẫn skill được ghép:

```js
const skillPath = path.join(repoPath, 'skills', resolvedSkillName);
```

Cho ra chuỗi đầy đủ. Sau đó hai đầu được nối:

```js
const targetPath = path.join(installContext.baseDir, targetDir, resolvedSkillName);
...
await fs.symlink(skillPath, targetPath, 'dir');
ui.text(`  → ${targetDir}/${resolvedSkillName} (symlinked)`);
```

Ở chế độ project, `baseDir` là `process.cwd()` (thư mục repo) và `targetDir` là `.claude/skills`. Dòng `(symlinked)` in ra chính là thứ ta thấy trong terminal khi chạy `ai-devkit install`.

Hai chi tiết nữa trong cùng hàm đó, đọc được thì đỡ ngạc nhiên về sau:

**Có đường lui khi symlink thất bại.**

```js
try {
    await fs.symlink(skillPath, targetPath, 'dir');
    ui.text(`  → ${targetDir}/${resolvedSkillName} (symlinked)`);
} catch (error) {
    await fs.copy(skillPath, targetPath);
    ui.text(`  → ${targetDir}/${resolvedSkillName} (copied)`);
}
```

Filesystem không hỗ trợ symlink, hoặc Windows thiếu quyền, thì nó **chép hẳn thư mục**. Lúc đó bạn có bản sao thật chứ không phải con trỏ — nặng hơn nhiều nhưng vẫn chạy. Nếu thấy `(copied)` thay vì `(symlinked)` thì đó là lý do.

**Chạy lại nhiều lần là an toàn.**

```js
if (await fs.pathExists(targetPath)) {
    ui.text(`  → ${targetDir}/${resolvedSkillName} (already exists, skipped)`);
    continue;
}
```

Không ghi đè cái đang có. Điều này quan trọng với việc đưa nó vào script tự động ở mục 6.

---

## 3. Tuyệt đối là đúng — commit nó mới sai {#s3}

Câu hỏi tự nhiên: sao ai-devkit không dùng đường dẫn tương đối cho đỡ rắc rối?

Vì nó **không thể**. Đích nằm ở `$HOME`, ngoài cây thư mục repo. Muốn tương đối thì phải tính:

```js
path.relative(path.dirname(targetPath), skillPath)
```

Kết quả sẽ là thứ như `../../../../../../.ai-devkit/skills/...` — số tầng `../` phụ thuộc repo nằm sâu bao nhiêu. Repo ở `~/Desktop/pinit/pinit` khác với repo ở `~/work/a/b/c/d`. Với một công cụ chạy trên mọi project ở mọi vị trí, **tuyệt đối là lựa chọn đúng**.

Nên đây không phải lỗi của ai-devkit. Công cụ làm đúng việc của nó.

Lỗi là **đem kết quả đó commit vào git**.

Và git thì không cản. Nó lưu symlink thành một blob chứa chuỗi đường dẫn, nguyên văn từng byte:

```bash
git cat-file -p <blob>
#  /Users/pinnguyen/.ai-devkit/skills/codeaholicguy/ai-devkit/skills/dev-commit
```

Máy khác clone về, git chép lại **đúng chuỗi đó**. Symlink vẫn "tồn tại", `readlink` vẫn trả lời được, `ls -la` vẫn thấy mũi tên đẹp đẽ. Nhưng `/Users/pinnguyen` không có ở đó.

> Con trỏ sống, cái được trỏ tới thì chết. Và không có tín hiệu lỗi nào.

---

## 4. Công thức và kết quả {#s4}

Chỗ này mới là bài học, và nó không chỉ về symlink.

`ai-devkit init` sinh ra **hai** thứ, và chúng khác nhau về bản chất:

```bash
python3 -c "import json; d=json.load(open('.ai-devkit.json')); \
  print({k: (len(v) if isinstance(v,(list,dict)) else v) for k,v in d.items()})"
```

```
version: 0.47.0 · environments: 1 · phases: 7 · mcpServers: 1 · skills: 19
```

Trong đó, entry cho `dev-commit` là:

```json
{ "registry": "codeaholicguy/ai-devkit", "name": "dev-commit" }
```

Đặt hai chuỗi cạnh nhau:

```
CÔNG THỨC  {"registry": "codeaholicguy/ai-devkit", "name": "dev-commit"}
KẾT QUẢ    "/Users/pinnguyen/.ai-devkit/skills/codeaholicguy/ai-devkit/skills/dev-commit"
```

Công thức nói *"lấy skill tên này, từ registry này"* — đúng trên mọi máy.
Kết quả nói *"nó nằm ở đúng chỗ này trên ổ cứng"* — chỉ đúng trên một máy.

Điều thú vị: **ai-devkit đã tự tách sẵn hai thứ đó**. Ngay sau khi tạo symlink, nó ghi công thức lại:

```js
if (!options.global) {
    await this.configManager.addSkill({
        registry: registryId,
        name: resolvedSkillName
    });
}
```

Công cụ làm đúng. Chỉ là git của tôi không tôn trọng ranh giới đó.

### Repo nào cũng đã áp dụng nguyên tắc này rồi

```bash
git ls-files --error-unmatch package-lock.json .ai-devkit.json skills-lock.json
git check-ignore node_modules .agents
```

| Công thức — **commit** | Kết quả — **gitignore** |
|---|---|
| `package-lock.json` | `node_modules/` |
| `skills-lock.json` | `.agents/` |
| `.ai-devkit.json` | `.claude/skills/dev-*` |

Không ai nghĩ đến chuyện commit `node_modules`. Nhưng symlink chỉ **76 byte** nên trông vô hại — đó là lý do nó lọt vào git mà không ai để ý.

**Kích thước nhỏ che mất bản chất.** Nó vẫn là kết quả, không phải công thức.

### Nhưng archify thì được commit — vì sao?

```bash
readlink .claude/skills/archify
#  ../../.agents/skills/archify        (28 byte)
```

Chuỗi này **không chứa gì riêng của máy nào**. Nó mô tả quan hệ giữa hai vị trí trong cùng một cây thư mục — cây đó nằm ở đâu thì quan hệ vẫn đúng.

Nên luật không phải *"đừng commit symlink"*. Luật là:

> **Chỉ commit thứ giống hệt nhau trên mọi máy.**

Symlink tương đối thoả điều kiện. Tuyệt đối thì không.

Cách phân loại nhanh nhất là nhìn ký tự đầu tiên — `/` là tuyệt đối, `.` là tương đối:

```bash
git ls-files -s .claude/skills | awk '$1 == 120000 {print $2}' \
  | while read h; do git cat-file -p "$h" | head -c 1; echo; done | sort | uniq -c
#     1 .      <- archify, giữ
#    19 /      <- cần xử lý
```

---

## 5. Bước kiểm quyết định {#s5}

Trước khi gỡ bất cứ thứ gì, phải trả lời đúng một câu:

> Lệnh cài của ai-devkit có tự tạo lại symlink cho **Claude Code** không?

Câu này quan trọng vì nếu **không**, thì gỡ track ra là mất skill **ngay trên máy tôi**, chứ không chỉ máy người khác.

Và nó không phải câu hỏi thừa. Bài trước đã ghi lại đúng một ca như vậy: `npx skills experimental_install` — lệnh khôi phục của archify — dựng lại `.agents/` rồi wire cho Codex, Cline, Amp, Antigravity và **bỏ sót Claude Code**. Đó chính là lý do symlink của archify buộc phải commit.

Nên tôi thử trong một thư mục tạm chỉ có mỗi `.ai-devkit.json`:

```
→ .claude/skills/tdd (symlinked)
Install Summary:
  ✓ 19 skill(s) installed
```

**Có.** Khác hẳn `experimental_install`.

Đây là toàn bộ lý do hai thứ được đối xử ngược nhau, gói trong một bảng:

| | ai-devkit (19 skill) | archify |
|---|---|---|
| Lockfile trong git | `.ai-devkit.json` | `skills-lock.json` |
| Bản thật nằm ở | `~/.ai-devkit/` — **ngoài** repo | `.agents/` — **trong** repo |
| Symlink | tuyệt đối, 76 byte | tương đối, 28 byte |
| Lệnh dựng lại | `npx ai-devkit install` | `npx skills experimental_install` |
| Có tự wire Claude Code? | **có** | **không** |
| → Commit symlink? | **không** | **có, bắt buộc** |

Hai dòng cuối liên quan nhân quả với nhau. Đọc bảng này mà bỏ qua dòng "có tự wire không" thì phần kết luận trông như tuỳ tiện.

---

## 6. Trả nợ {#s6}

Bốn bước, không có bước nào phức tạp:

**Một** — gỡ track đúng 19 cái tuyệt đối, lọc bằng byte đầu của blob nên `archify` không bị đụng:

```bash
git ls-files -s .claude/skills | awk '$1 == 120000 {print $2, $4}' \
  | while read h f; do
      case "$(git cat-file -p "$h")" in
        /*) git rm --cached -q "$f" ;;
      esac
    done
```

Lưu ý `--cached`: gỡ khỏi index, **không xoá trên đĩa**. Máy đang làm việc không bị ảnh hưởng gì.

**Hai** — `.gitignore`, chừa lại hai ngoại lệ:

```gitignore
.claude/skills/*
!.claude/skills/archify
!.claude/skills/agentic-mermaid-diagram-workflow
```

**Ba** — không cần thêm lockfile nào. `.ai-devkit.json` **vốn đã được commit** từ trước.

**Bốn** — ghi bước bootstrap vào `CLAUDE.md` và cho `agents create` tự chạy. Đây là chỗ cái guard `already exists, skipped` ở mục 2 phát huy: chạy lại bao nhiêu lần cũng không hỏng gì.

Kiểm chứng bằng clone sạch:

```bash
git clone --branch <branch> <repo> /tmp/thu
cd /tmp/thu
ls .claude/skills/
#  agentic-mermaid-diagram-workflow  archify      <- chỉ còn 2, đúng thiết kế

npx ai-devkit install && npx skills experimental_install

for s in .claude/skills/*; do
  [ -L "$s" ] && { [ -e "$s" ] || echo "DANGLING $s"; }
done
#  (không in gì — 21/21 sống)
```

Và `git status` phần `.claude/skills` sạch tuyệt đối: symlink mới sinh ra không làm bẩn cây làm việc.

---

## 7. Lần đầu cơ chế chạy thật {#s7}

Phần này không nằm trong kế hoạch, nhưng nó là bằng chứng tốt nhất nên tôi giữ lại.

Sau khi PR merge, tôi `git pull` ở worktree `main`. Trong output có:

```
delete mode 120000 .claude/skills/task
delete mode 120000 .claude/skills/tdd
delete mode 120000 .claude/skills/verify
```

Git vừa **xoá 19 symlink khỏi đĩa** — đúng như phải thế: chúng không còn được track, nên pull sẽ dọn chúng đi. Kiểm ngay:

```bash
ls ~/Desktop/pinit/pinit/.claude/skills/
#  agentic-mermaid-diagram-workflow  archify
```

Worktree chính vừa mất 19 skill. Đây không phải sự cố — đây là **trạng thái mà bước bootstrap sinh ra để xử lý**. Chạy một lệnh:

```
✓ 19 skill(s) installed
```

Về lại 21/21, `git status` không bẩn thêm dòng nào.

Nếu chưa từng kiểm bước khôi phục, đúng khoảnh khắc đó sẽ rất giống một cú hỏng. Đó là lý do trong task tôi đặt điều kiện "xong" là **clone sạch dựng lại được**, chứ không phải "lệnh chạy không báo lỗi".

---

## Điều đáng nhớ

**Một — trước khi gỡ một thứ khỏi git, hãy chứng minh có thứ khác dựng lại được nó.** Không phải suy luận, mà chạy thử trong thư mục trống. Hai công cụ trông giống nhau ở đây lại khác nhau đúng ở điểm quyết định: một cái wire cho Claude Code, một cái không.

**Hai — phân biệt công thức với kết quả, rồi chỉ commit công thức.** Nguyên tắc này ai cũng áp dụng đúng với `node_modules`, nhưng dễ quên khi kết quả chỉ nặng 76 byte. Câu hỏi để tự kiểm: *chuỗi này trên máy đồng nghiệp có giống hệt không?* Không giống thì đừng commit.

**Ba — đọc mã nguồn của công cụ rẻ hơn ta tưởng.** Toàn bộ mục 2 đến từ một hàm bốn mươi dòng trong `dist/`. Nó trả lời dứt điểm câu "chuỗi này từ đâu ra", và tiện thể cho biết hai hành vi tôi sẽ không đoán được: fallback sang `fs.copy`, và guard `already exists, skipped`. Với công cụ cài qua `npm -g`, mã nguồn nằm sẵn trên máy — chỉ cần `find` một lần.
