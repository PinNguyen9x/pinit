---
slug: git-mode-120000-nam-thi-nghiem
title: "Git lưu symlink thế nào: năm thí nghiệm với mode 120000"
description: "Không giải thích, chỉ chứng minh. Năm thí nghiệm plumbing cho thấy git lưu symlink là một chuỗi path, và vì sao trên Windows nó lặng lẽ thành file text."
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Git, DevTools, Terminal, NodeJS, Claude, AI]
date: '2026-08-30T16:00:00Z'
image: /covers/blog/git-mode-120000-nam-thi-nghiem.png
---

Hai bài trước trong cụm này — [những cú gãy im lặng](/blog/symlink-multi-agent-worktree) và [công thức với kết quả](/blog/ai-devkit-symlink-cong-thuc-va-ket-qua) — đều dùng mode `120000` làm **nền** để kể chuyện khác. Cả hai đều nói lướt qua một câu: *"git lưu symlink thành blob chứa chuỗi đường dẫn"*.

Bài này lấy chính câu đó làm **chủ đề**, và không giải thích thêm một chữ nào. Chỉ có năm thí nghiệm, mỗi cái vài dòng lệnh, anh chạy lại được hết trong một `git init` trống.

Cái thứ năm là lý do tôi viết bài: nó cho thấy trên một số máy, symlink trong repo **lặng lẽ biến thành file text** — mà `git status` vẫn báo sạch.

<!-- truncate -->

---

## Mục lục

1. [Dựng phòng thí nghiệm](#s1)
2. [TN1 — Blob chính là chuỗi path](#s2)
3. [TN2 — Cùng một blob, hai mode](#s3)
4. [TN3 — Git không bao giờ kiểm đích](#s4)
5. [TN4 — `git diff` coi symlink là text một dòng](#s5)
6. [TN5 — Khi filesystem không hỗ trợ symlink](#s6)
7. [Bộ đồ nghề](#s7)

---

## 1. Dựng phòng thí nghiệm {#s1}

```bash
mkdir /tmp/lab120000 && cd /tmp/lab120000
git init -q
git config user.email t@t && git config user.name t
```

Toàn bộ bài chạy trong thư mục này. Không đụng gì tới repo thật.

---

## 2. TN1 — Blob chính là chuỗi path {#s2}

Lấy một symlink có thật trong repo pinit:

```bash
git ls-files -s .claude/skills/archify
#  120000 d1b7c8e570f4560b3083a79b6ed24e0bc597ecee 0	.claude/skills/archify

git cat-file -s d1b7c8e5    # kích thước
#  28
git cat-file -p d1b7c8e5    # nội dung
#  ../../.agents/skills/archify
```

28 byte, đúng bằng số ký tự của chuỗi. Nhưng đó mới là quan sát, chưa phải chứng minh — biết đâu git lưu gì khác rồi in ra chuỗi này.

Chứng minh thật: **tự băm chuỗi đó** rồi so hash.

```bash
printf '../../.agents/skills/archify' | git hash-object --stdin
#  d1b7c8e570f4560b3083a79b6ed24e0bc597ecee
```

Trùng khít. Git không lưu gì khác ngoài chính chuỗi ký tự đó.

Để thấy khoảng cách, đây là thứ ở đầu kia của con trỏ:

```bash
du -sh .agents/skills/archify
#  6.7M
```

**6.7MB ở đích, 28 byte trong git.** Git chưa từng nhìn tới đó.

> Chú ý `printf` chứ không phải `echo` — `echo` thêm ký tự xuống dòng và hash sẽ khác. Blob của symlink **không có** newline ở cuối; chi tiết này quay lại ở TN4.

---

## 3. TN2 — Cùng một blob, hai mode {#s3}

Nếu blob chỉ là một mớ byte, vậy cái gì quyết định nó là file hay symlink? Câu trả lời là **mode**, và ta ép được git chứng minh điều đó.

Tạo đúng **một** blob, rồi đăng ký nó vào index **hai lần** với hai mode khác nhau:

```bash
blob=$(printf 'hello.txt' | git hash-object -w --stdin)
echo $blob
#  a5162f80d4a6782b7cb2a0a197f834e683cb9eb1

git update-index --add --cacheinfo 100644,$blob,as-file
git update-index --add --cacheinfo 120000,$blob,as-link
git checkout-index -a -f
```

Chú ý: tôi **chưa hề tạo file nào** trên đĩa. Blob đi thẳng vào index bằng plumbing. Kết quả sau khi checkout:

```bash
file -b as-file
#  ASCII text, with no line terminators

file -b as-link
#  broken symbolic link to hello.txt

readlink as-link
#  hello.txt
```

Cùng một blob `a5162f80`. Mode `100644` cho ra **file text** chứa chữ `hello.txt`. Mode `120000` cho ra **symlink** trỏ tới `hello.txt`.

| mode | Git hiểu blob là | Checkout ra |
|---|---|---|
| `100644` | nội dung file | file thường, ghi byte đó vào |
| `100755` | nội dung file | như trên, thêm cờ thực thi |
| `120000` | **chuỗi đường dẫn** | gọi `symlink(nội_dung_blob, tên)` |

Mode không phải thuộc tính của dữ liệu. Nó là **chỉ dẫn cách diễn giải** dữ liệu.

---

## 4. TN3 — Git không bao giờ kiểm đích {#s4}

Nếu blob chỉ là chuỗi, thì commit một symlink trỏ vào hư không phải được. Thử:

```bash
ln -sfn /khong/he/co/thu/muc/nay ghost
git add ghost && git commit -q -m t
```

Không cảnh báo, không lỗi:

```bash
git ls-files -s ghost
#  120000 0eace693b15b3eb80c77833da75c53c52e4c6127 0	ghost

test -e ghost && echo sống || echo DANGLING
#  DANGLING
```

Git commit thành công một con trỏ trỏ vào đường dẫn **chưa bao giờ tồn tại trên máy này**.

Đây không phải lỗi của git — nó đang làm đúng việc: chép chuỗi. Nhưng đó cũng là toàn bộ cơ chế của cú gãy im lặng mà bài đầu tiên kể: trên máy khác, git chép lại nguyên văn `/Users/pinnguyen/...`, tạo symlink **thành công**, `readlink` trả lời bình thường. Chỉ là chuỗi ấy vô nghĩa ở đó.

---

## 5. TN4 — `git diff` coi symlink là text một dòng {#s5}

Đổi đích của symlink rồi xem diff:

```bash
ln -sfn /doi/dich/khac ghost
git diff ghost
```

```diff
--- a/ghost
+++ b/ghost
@@ -1 +1 @@
-/khong/he/co/thu/muc/nay
\ No newline at end of file
+/doi/dich/khac
\ No newline at end of file
```

Đúng như một file text một dòng. Và dòng `\ No newline at end of file` xác nhận điều đã nói ở TN1: **blob của symlink không có newline cuối**.

Hệ quả thực dụng: khi review PR, một symlink đổi đích trông y hệt một thay đổi text bình thường. Nếu không để ý dòng `mode 120000` ở đầu diff, rất dễ lướt qua — kể cả khi đích mới là một đường dẫn tuyệt đối chỉ đúng trên máy người gửi.

Còn TN4 phụ, cho câu hỏi hay gặp: symlink trỏ tới **thư mục** và tới **file** có được lưu khác nhau không?

```bash
mkdir realdir && echo x > realfile
ln -sfn realdir to-dir && ln -sfn realfile to-file
git add to-dir to-file && git ls-files -s to-dir to-file
```

```
120000 e63e225ee4653b30cf4780cd95fe01e41e3f1574 0	to-dir
120000 f725399f99f9f922d38b3a9282e050df114e6227 0	to-file
```

Cùng mode `120000`. Hash khác nhau **chỉ vì chuỗi khác nhau** (`realdir` với `realfile`), không phải vì đích khác loại. Git không biết và không quan tâm đầu kia là gì.

---

## 6. TN5 — Khi filesystem không hỗ trợ symlink {#s6}

Đây là thí nghiệm đáng giá nhất, vì nó là ca thật chứ không phải chuyện lý thuyết: Windows không bật Developer Mode, một số filesystem mạng, vài container CI.

Git có công tắc `core.symlinks`. Clone với nó tắt để mô phỏng:

```bash
git clone -c core.symlinks=false /tmp/lab120000 /tmp/lab-nosym
cd /tmp/lab-nosym
```

Trong index, mọi thứ y nguyên:

```bash
git ls-files -s to-dir | awk '{print $1}'
#  120000
```

Nhưng trên đĩa thì không:

```bash
file -b to-dir
#  ASCII text, with no line terminators

test -L to-dir && echo "symlink" || echo "file thường"
#  file thường

cat to-dir
#  realdir
```

**Symlink đã thành một file text chứa chuỗi path.**

Và đây là phần khiến nó nguy hiểm:

```bash
git status --porcelain
#  (rỗng)
```

Git coi cây làm việc **hoàn toàn sạch**. Nó biết mode là `120000`, biết filesystem không làm được symlink, nên chấp nhận file text như một biểu diễn hợp lệ. Không có gì để báo.

### Nó nghĩa là gì với một repo có agent

Áp vào trường hợp thật của pinit: `.claude/skills/archify` là symlink được commit. Trên một máy như vậy, sau khi clone nó sẽ là một **file text 28 byte** chứa dòng chữ `../../.agents/skills/archify`.

Claude Code đi tìm thư mục skill, gặp một file text. Skill không nạp được. Còn `git status` thì bảo mọi thứ ổn, `git diff` trống trơn, không có gì để debug.

Đây là lớp thứ ba của cùng một bài học, sau *dangling* ở bài một và *đường dẫn của máy khác* ở bài hai: **symlink trong git có ba cách hỏng, và cả ba đều không làm bẩn `git status`**.

Kiểm nhanh xem máy mình có ở tình trạng này không:

```bash
git config --get core.symlinks     # rỗng hoặc true là ổn
test -L .claude/skills/archify && echo "symlink thật" || echo "⚠️ KHÔNG phải symlink"
```

---

## 7. Bộ đồ nghề {#s7}

Bốn lệnh dùng suốt bài, đủ để tự soát bất kỳ repo nào:

```bash
# 1. Mode + hash của một đường dẫn trong index
git ls-files -s <path>

# 2. Nội dung và kích thước của blob
git cat-file -p <blob>
git cat-file -s <blob>

# 3. Băm một chuỗi để đối chiếu (KHÔNG dùng echo — nó thêm newline)
printf '<chuỗi>' | git hash-object --stdin

# 4. Nhét blob vào index với mode tuỳ ý, không cần file trên đĩa
git update-index --add --cacheinfo <mode>,<blob>,<path>
```

Và một lệnh soát cả repo — liệt kê mọi symlink đang được commit, phân loại bằng ký tự đầu của chuỗi:

```bash
git ls-files -s | awk '$1 == 120000 {print $2}' \
  | while read h; do git cat-file -p "$h"; echo; done \
  | grep '^/' && echo "^ những cái này neo vào một máy cụ thể"
```

---

## Điều đáng nhớ

**Mode là cách diễn giải, không phải thuộc tính của dữ liệu.** TN2 cho thấy cùng một blob ra file hay ra symlink chỉ tuỳ con số đứng trước nó. Hiểu điều này thì mọi hành vi còn lại đều suy ra được.

**Git chép chuỗi, không đi theo chuỗi.** Nó không kiểm đích lúc commit (TN3), không phân biệt đích là file hay thư mục (TN4), và không cần đích tồn tại lúc checkout. Toàn bộ trách nhiệm "chuỗi này có nghĩa gì trên máy này" thuộc về bạn.

**Và cả ba kiểu hỏng đều im lặng.** Dangling, đường dẫn của máy khác, hay bị hạ cấp thành file text — không cái nào làm `git status` bẩn lên. Cách duy nhất là hỏi thẳng bằng `test -L` và `test -e`, hai câu hỏi khác nhau mà một symlink hỏng trả lời khác nhau.
