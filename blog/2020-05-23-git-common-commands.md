---
slug: git-used-in-real-world-projects
title: "Git trong dự án thực tế: Lệnh thường dùng, amend/rebase/cherry-pick & Trunk-Based Development 🎉"
description: "Tổng hợp các lệnh Git hay dùng từ lúc nhận task đến khi tạo PR, khi nào nên dùng git commit --amend, rebase, squash, cherry-pick (kèm ví dụ thực tế), và giải thích flow Trunk-Based Development so với Git Flow."
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Git, Workflow, Productivity, Version Control]
date: '2024-07-29T12:00:00Z'
image: https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&auto=format&fit=crop&q=80
---

Git có rất nhiều lệnh, nhưng những lệnh nào mới thực sự hay dùng trong dự án thực tế? 🤔 Là công cụ version control không thể thiếu, Git giúp bạn theo dõi thay đổi, làm việc nhóm và giữ codebase ổn định. Nắm vững các lệnh quan trọng sẽ tăng năng suất, giảm conflict và giữ code sạch sẽ. Cùng đi qua các lệnh thường dùng nhất nhé! 😉

<!-- truncate -->

# Git trong dự án thực tế: Từ nhận task đến tạo PR và xa hơn

> Bài này dành cho dev muốn dùng Git "thật" trong dự án, không chỉ dừng ở `add`/`commit`/`push`. Mình chia làm 3 phần: (1) flow & lệnh hằng ngày, (2) nhóm lệnh "viết lại lịch sử" amend/rebase/cherry-pick kèm ví dụ thực tế, (3) chọn workflow phù hợp (Trunk-Based vs Git Flow).

## Mục lục

1. [Flow thực tế: từ nhận task đến tạo PR](#flow-thuc-te)
2. [Các lệnh Git thường dùng trong dự án](#lenh-thuong-dung)
3. [amend / rebase / squash / cherry-pick — khi nào dùng?](#amend-rebase-cherrypick)
4. [Trunk-Based Development là gì? So sánh với Git Flow](#trunk-based)
5. [Ghi chú & lời kết](#ghi-chu)

---

## 1. Flow thực tế: từ nhận task đến tạo PR {#flow-thuc-te}

Đây là quy trình mình áp dụng trong công việc (bạn cứ tham khảo rồi điều chỉnh cho phù hợp với team mình nhé 😊).

### 0. Nhận task, ví dụ task ID 123

- Sau này khi thấy một nhánh có số `123`, bạn có thể hiểu đó chính là `taskId`.
- Ví dụ ở team mình, tụi mình develop trên nhánh `develop`.

### 1. Lấy code mới nhất từ nhánh develop

```sh
git checkout develop   # chuyển sang nhánh develop
git pull               # lấy code mới nhất
```

### 2. Code task

CODING CHANGES 😎

Sau khi code xong, hãy review lại thay đổi của mình một cách cẩn thận và từ từ:

- Review lại coding convention.
- Kiểm tra đã xoá hết `console.log` chưa.
- Kiểm tra có `import` thừa không.
- Kiểm tra lỗi eslint.
- Nếu có logic phức tạp, thêm comment giải thích.
- Nếu `if/else` quá nhiều, refactor lại cho gọn.
- ...
- Review code ngay trong VSCode cho dễ đọc. Muốn "ngầu" hơn thì dùng `git diff` để soi! 😎

> Hãy tạo thói quen review code thật kỹ trước khi đưa cho lead review nhé! 😉

### 3. Chuẩn bị tạo Pull Request (PR)

> Code xong là tới lúc chuẩn bị PR.
> Tuy nhiên, trong lúc bạn làm task, có thể người khác đã cập nhật nhánh `develop`.
> Vì vậy bạn cần lấy code mới nhất từ `develop` trước khi áp thay đổi của mình lên.

```sh
git add .     # stage toàn bộ thay đổi
git stash     # cất tạm toàn bộ thay đổi vào stash
git pull      # lấy code mới nhất
```

### 4. Tạo nhánh cho thay đổi của bạn

```sh
git checkout -b feature/123-add-address-ui
```

### 5. Lấy lại code đã stash ở bước trên

```sh
git stash pop
```

> TUỲ CHỌN: Resolve conflict nếu có. Nhớ test lại để chắc chắn code vẫn chạy mượt nhé. 😅

### 6. Tạo commit và viết commit message

```sh
git status    # xem các file đã thay đổi
git add .     # stage toàn bộ thay đổi

git commit -m "[123] Add address UI

- Mô tả chi tiết hơn về PR của bạn
- Viết ngắn gọn, rõ ràng"
```

> 📝 Lưu ý quy ước commit message:
> - Dòng đầu tiên là tiêu đề (title).
> - Dòng thứ hai để trống (BẮT BUỘC).
> - Từ dòng thứ ba trở đi là phần mô tả chi tiết cho Pull Request.
> - Quy ước này giúp GitHub/GitLab/Bitbucket tự điền sẵn phần title và description của PR.

### 7. Push code lên remote (GitHub, GitLab, Bitbucket...)

```sh
git push -u origin feature/123-add-address-ui
```

Cuối cùng, tạo PR/MR vào nhánh `develop` trên remote và request lead review. Xong! Hehe 😄

---

## 2. Các lệnh Git thường dùng trong dự án {#lenh-thuong-dung}

Ngoài flow ở trên, đây là các lệnh bạn sẽ gặp đi gặp lại trong dự án thực tế.

### Cấu hình & alias hữu ích

```sh
# Cấu hình thông tin (chạy 1 lần cho máy)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Đặt editor mặc định + alias xem log dạng cây
git config --global core.editor "code --wait"
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global pull.rebase true   # pull sẽ rebase thay vì tạo merge commit
```

### Làm việc hằng ngày

```sh
git status -s             # trạng thái rút gọn, dễ nhìn
git diff                  # xem thay đổi chưa staged
git diff --staged         # xem thay đổi đã staged
git add -p                # stage từng phần (hunk) — cực hữu ích để tách commit gọn
git log --oneline --graph --decorate --all   # xem lịch sử dạng cây
```

> **Mẹo:** `git add -p` giúp bạn tự review lại code trước khi commit và tách những thay đổi không liên quan ra commit riêng. Đây là thói quen tạo ra commit history sạch.

### Branch & chuyển nhánh (cú pháp mới, rõ nghĩa)

```sh
git switch main              # chuyển nhánh (thay cho git checkout)
git switch -c feature/login  # tạo & chuyển sang nhánh mới
git branch -a                # liệt kê cả nhánh local & remote
git branch -d feature/login  # xoá nhánh đã merge
git branch -D feature/login  # xoá ép (chưa merge)
```

> `git switch` / `git restore` (Git 2.23+) là phiên bản tách rõ nghĩa của `git checkout` (vốn vừa đổi nhánh vừa khôi phục file). Nên dùng để tránh nhầm lẫn.

### Đồng bộ với remote

```sh
git fetch --all --prune       # cập nhật remote, xoá nhánh remote đã bị xoá
git pull --rebase             # cập nhật nhánh, giữ lịch sử thẳng
git push --force-with-lease    # force push AN TOÀN (xem mục 3)
```

> **Quan trọng:** Luôn ưu tiên `--force-with-lease` thay vì `--force`. Nó sẽ từ chối push nếu remote có commit mới mà bạn chưa thấy → tránh ghi đè mất việc của đồng đội.

### Khôi phục & "cứu hộ"

```sh
git restore file.ts            # bỏ thay đổi chưa staged của 1 file
git restore --staged file.ts   # unstage file (vẫn giữ thay đổi)
git reset --soft HEAD~1        # bỏ commit cuối, GIỮ thay đổi đã staged
git reset --mixed HEAD~1       # bỏ commit cuối, đưa thay đổi về unstaged (mặc định)
git reset --hard HEAD~1        # bỏ commit cuối & XOÁ luôn thay đổi (cẩn thận!)
git revert <commit>            # tạo commit mới đảo ngược 1 commit (an toàn cho nhánh chung)
git reflog                     # "phao cứu sinh": xem lại MỌI nơi HEAD từng trỏ tới
```

> **`git reflog` là vị cứu tinh.** Lỡ tay `reset --hard` hay rebase hỏng? `git reflog` cho bạn thấy commit cũ, rồi `git reset --hard <hash>` để quay lại. Git gần như không bao giờ mất dữ liệu đã commit.

### `reset` vs `revert` (rất hay nhầm)

| Tình huống | Dùng |
| --- | --- |
| Sửa lịch sử trên nhánh **cá nhân** chưa push | `git reset` |
| Đảo ngược commit trên nhánh **chung** (`main`/`develop`) đã push | `git revert` |

---

## 3. amend / rebase / squash / cherry-pick — khi nào dùng? {#amend-rebase-cherrypick}

Đây là nhóm lệnh "viết lại lịch sử" (rewrite history). Rất mạnh nhưng cần nhớ **một nguyên tắc vàng**:

> ⚠️ **Không viết lại lịch sử của nhánh đã được chia sẻ/đã merge** (như `main`/`develop`). Chỉ rewrite trên nhánh feature của riêng bạn.

### 3.1. `git commit --amend` — sửa commit gần nhất

**Khi nào dùng:**
- Quên thêm 1 file vào commit vừa rồi.
- Gõ sai commit message.
- Muốn gộp một sửa nhỏ vào commit cuối thay vì tạo commit "fix typo".

**Ví dụ thực tế:** Bạn vừa commit `[123] Add login API` nhưng quên file `auth.service.ts`:

```sh
git add src/auth/auth.service.ts
git commit --amend --no-edit       # gộp file vào commit cuối, giữ nguyên message
# hoặc sửa luôn message:
git commit --amend -m "[123] Add login API with auth service"
```

Nếu commit đó **đã push**, sau khi amend cần:

```sh
git push --force-with-lease
```

### 3.2. `git rebase` — sắp xếp lại / làm thẳng lịch sử

**Khi nào dùng:**
- **Cập nhật nhánh feature** theo `develop`/`main` mới nhất mà không tạo merge commit rối.
- **Dọn dẹp** lịch sử commit lộn xộn trước khi mở PR.

**Ví dụ — update feature theo develop:**

```sh
git switch feature/123-payment
git fetch origin
git rebase origin/develop
# nếu conflict: sửa file → git add . → git rebase --continue
# muốn huỷ:    git rebase --abort
```

Kết quả: các commit của bạn được "đặt lại" lên trên đầu `develop` mới nhất → lịch sử thẳng, dễ review hơn so với `merge`.

```
# merge (có merge commit):          # rebase (lịch sử thẳng):
*   Merge develop into feature      * feature commit 2
|\                                  * feature commit 1
| * feature commit 2               * develop commit mới
| * feature commit 1               * ...
* | develop commit mới
```

### 3.3. `git rebase -i` (interactive) — squash gộp commit

**Khi nào dùng:** Trước khi merge PR, gộp nhiều commit lặt vặt (`wip`, `fix test`, `typo`) thành 1–2 commit có ý nghĩa.

**Ví dụ thực tế:** Bạn có 4 commit lộn xộn trên nhánh feature:

```sh
git rebase -i HEAD~4
```

Editor mở ra:

```
pick a1b2c3 [123] Add cart page
squash d4e5f6 wip
squash 7g8h9i fix style
squash j1k2l3 fix typo
```

Đổi `pick` → `squash` (hoặc `s`) cho các commit muốn gộp vào commit phía trên. Lưu lại → Git cho bạn viết lại message gộp. Kết quả: 4 commit → 1 commit sạch `[123] Add cart page`.

> Các lệnh hay dùng trong interactive rebase: `pick` (giữ), `squash`/`s` (gộp & gộp message), `fixup`/`f` (gộp nhưng bỏ message), `reword`/`r` (đổi message), `drop`/`d` (xoá commit). Đảo thứ tự dòng để sắp xếp lại commit.

> **Lưu ý:** Nhiều team không cần `rebase -i` thủ công vì GitHub/GitLab có sẵn **"Squash and merge"** khi merge PR — tự gộp toàn bộ commit của PR thành 1.

### 3.4. `git cherry-pick` — "nhặt" 1 commit cụ thể sang nhánh khác

**Khi nào dùng:**
- **Hotfix:** vá lỗi gấp trên `main` và cần đưa đúng commit đó sang nhánh `release` (hoặc ngược lại).
- Lỡ commit nhầm nhánh, muốn mang commit đó sang đúng nhánh.

**Ví dụ thực tế — đưa hotfix sang nhánh release:**

```sh
# Sửa lỗi và commit trên main
git switch main
git commit -m "fix: critical null check in checkout"
# giả sử hash commit: 9fa3b21

# Đưa đúng commit đó sang nhánh release đang chạy production
git switch release/v1.2
git cherry-pick 9fa3b21
# nếu conflict: sửa → git add . → git cherry-pick --continue

# cherry-pick nhiều commit liền nhau:
git cherry-pick a1b2c3^..d4e5f6
```

### Tóm tắt nhanh

| Lệnh | Mục đích | Khi nào dùng |
| --- | --- | --- |
| `commit --amend` | Sửa commit **gần nhất** | Quên file / sửa message |
| `rebase` | Làm thẳng / cập nhật lịch sử | Update feature theo base branch |
| `rebase -i` (squash) | Gộp nhiều commit | Trước khi merge PR |
| `cherry-pick` | Lấy 1 commit cụ thể | Hotfix, mang commit qua nhánh khác |

---

## 4. Trunk-Based Development là gì? So sánh với Git Flow {#trunk-based}

**Trunk-Based Development (TBD)** là mô hình quản lý nhánh trong đó **tất cả dev cùng làm việc trên một nhánh chính duy nhất** (gọi là *trunk* — thường là `main`), và **merge thay đổi vào trunk rất thường xuyên** (ít nhất 1 lần/ngày).

### Đặc điểm chính

- Chỉ có **một nhánh dài hạn**: `main` (trunk).
- Nhánh feature nếu có thì **rất ngắn** (vài giờ đến 1–2 ngày) rồi merge ngay.
- Mỗi commit vào `main` phải **luôn build & test pass** → `main` luôn ở trạng thái "có thể deploy".
- Tính năng chưa xong được "giấu" bằng **Feature Flags** thay vì giữ trên nhánh riêng lâu ngày.
- Phụ thuộc rất nhiều vào **CI/CD tự động** (test, build chạy trên mỗi lần push).

```
Trunk-Based:                        Git Flow:
                                    main ─────●────────────●──  (release)
main ●─●─●─●─●─●─●─●  (luôn deploy)          │              │
     ↑ ↑   ↑   ↑                   develop ─●──●──●──●──●──●──
   merge nhỏ, thường xuyên                   │  │     │
   (feature branch sống ngắn)         feature feature release/hotfix...
```

### So sánh Trunk-Based vs Git Flow

| Tiêu chí | Trunk-Based | Git Flow |
| --- | --- | --- |
| Số nhánh dài hạn | 1 (`main`) | Nhiều (`main`, `develop`, `release`, `hotfix`) |
| Tuổi đời nhánh feature | Rất ngắn (giờ/ngày) | Dài (ngày/tuần) |
| Tần suất merge | Liên tục (CI) | Theo đợt release |
| Merge conflict | Ít (merge sớm, nhỏ) | Nhiều (merge muộn, lớn) |
| Yêu cầu CI/CD | Bắt buộc, mạnh | Không bắt buộc |
| Tốc độ release | Nhanh, liên tục (CD) | Theo chu kỳ release |
| Độ phức tạp | Đơn giản | Phức tạp hơn |

### Dự án nào nên dùng Trunk-Based?

✅ **Phù hợp khi:**
- Team làm **web app / SaaS** triển khai liên tục (Continuous Deployment).
- Có **CI/CD mạnh** và **test tự động đầy đủ** (đây là điều kiện tiên quyết).
- Team review nhanh (PR nhỏ, merge trong ngày).
- Muốn giảm "merge hell" và ship tính năng nhanh.
- Các công ty lớn như Google, Facebook dùng mô hình này ở quy mô rất lớn.

### Dự án nào nên dùng Git Flow (thay vì Trunk-Based)?

✅ **Git Flow phù hợp hơn khi:**
- Sản phẩm có **nhiều phiên bản phát hành** cần bảo trì song song (phần mềm desktop, mobile app phải hỗ trợ v1.x, v2.x...).
- Release theo **chu kỳ cố định**, cần giai đoạn QA/stabilize rõ ràng.
- Sản phẩm bán theo phiên bản, không thể "deploy liên tục" (firmware, app cài trên máy khách).
- Team chưa có CI/CD và test tự động đủ mạnh để đảm bảo `main` luôn deploy được.

### Kết luận về workflow

Không có workflow "tốt nhất tuyệt đối" — chỉ có cái **phù hợp với cách team release sản phẩm**:

- **Deploy liên tục, team gọn, CI/CD mạnh →** Trunk-Based Development.
- **Release theo phiên bản, bảo trì nhiều version, cần QA gate →** Git Flow.

Nhiều team hiện đại chọn con đường ở giữa: **GitHub Flow** — một nhánh `main` + nhánh feature ngắn + Pull Request + deploy khi merge. Đây là phiên bản đơn giản hoá rất phổ biến cho dự án web vừa và nhỏ (và cũng gần với flow ở phần 1 của bài này).

---

## 5. Ghi chú & lời kết {#ghi-chu}

**📝 Lưu ý:**

- Mỗi dự án có quy ước đặt tên nhánh khác nhau; hãy theo rule của team bạn.
- Nhánh bạn làm việc cũng tuỳ team, không phải lúc nào cũng là `develop`.
- `Không phải ai` cũng theo đúng quy trình như mình; mỗi người có một `style` riêng.
- Quy trình chia sẻ ở trên là thứ mình đã áp dụng trong sự nghiệp và thấy hiệu quả. Mình chia sẻ để bạn tham khảo, cứ điều chỉnh cho phù hợp nhé. 😊

Hãy bắt đầu từ việc tập thói quen tạo commit sạch (`git add -p`, message rõ ràng), rồi dần làm quen với `rebase`/`cherry-pick`, và chọn workflow phù hợp cho team mình.

CHÚC CÁC BẠN SỨC KHOẺ VÀ HỌC TẬP THẬT TỐT! ❤️
