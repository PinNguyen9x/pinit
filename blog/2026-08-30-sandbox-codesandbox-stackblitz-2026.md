---
slug: sandbox-codesandbox-stackblitz-2026
title: "Sandbox: ba nghĩa, bốn nền tảng, và một cú xoay hướng không ai thông báo"
description: "Tôi mở repo pinit trên CodeSandbox và nhận về một câu: tính năng này đã bị gỡ. Đo tay bốn nền tảng để xem chữ sandbox giờ còn nghĩa gì và chỗ nào thật sự chạy được."
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [NextJS, DevTools, AI, Agents, Tooling, Frontend]
date: '2026-08-30T09:00:00Z'
image: /covers/blog/sandbox-codesandbox-stackblitz-2026.png
---

Tôi định viết một bài bình thường: CodeSandbox là gì, khi nào nên dùng, được lợi gì. Bước đầu tiên là đẩy [pinit](https://github.com/PinNguyen9x/pinit) — repo public, Next.js, 39 dependency — lên đó để có số liệu thật thay vì chép lại tài liệu.

Nhận về đúng một dòng:

> **Repositories is no longer available**
> Opening repositories on CodeSandbox is a feature that has been removed and is no longer available.

Cái tính năng làm nên tên tuổi của CodeSandbox — dán link GitHub, có ngay editor chạy được — đã bị gỡ. Đào tiếp thì hoá ra nó không phải chuyện riêng của một công ty: **cả một thế hệ IDE-trên-trình-duyệt vừa lặng lẽ đổi nghề**, và không nơi nào ra thông báo tử tế.

<!-- truncate -->

> Bài này là một lát cắt ngày **30/08/2026**. Mảng này đang đổi rất nhanh — mọi con số dưới đây đều kèm cách tự kiểm chứng lại, vì tôi không dám hứa nó còn đúng sau vài tháng.

---

## Mục lục

1. [Chữ "sandbox" đang mang ba nghĩa](#s1)
2. [CodeSandbox 2026: nó đã thành cái gì](#s2)
3. [Thử cái còn làm được việc đó: StackBlitz](#s3)
4. [Preview không phải deploy](#s4)
5. [Bốn nền tảng, một hướng đi](#s5)
6. [Vậy khi nào nên dùng cái gì](#s6)

---

## 1. Chữ "sandbox" đang mang ba nghĩa {#s1}

Phải gỡ chỗ này trước, vì phần lớn tranh cãi quanh chữ "sandbox" là do hai người đang nói hai thứ khác nhau mà tưởng cùng một thứ.

| | Nghĩa | Ai hay dùng | "Đưa code vào sandbox" nghĩa là gì |
|---|---|---|---|
| **A** | Môi trường thử của một dịch vụ | Tích hợp API, thanh toán | Trỏ app sang endpoint test, key test, dữ liệu giả. Anh em với staging/UAT. |
| **B** | Môi trường chạy cô lập | Bảo mật, hạ tầng | Nhốt tiến trình vào container/microVM để nó không đụng được host. |
| **C** | Playground code online | Frontend, dạy học | Mở project trong trình duyệt để xem, sửa, chia sẻ link. |

Khi ai đó nói "deploy lên môi trường sandbox", gần như luôn là **nghĩa A**. Đó là chuyện của pipeline và hạ tầng, và không liên quan gì tới bài này.

Bài này nói về **C** — và về việc C đang chết dần trong khi **B** thì bùng lên, vì AI cần chỗ chạy code do chính nó sinh ra. Cái tên "CodeSandbox" bắt đầu ở C. Nó vừa chuyển hẳn sang B.

> Ba nghĩa không loại trừ nhau: một microVM (B) hoàn toàn có thể được dùng làm môi trường thử (A). Điều đáng quan tâm là **công cụ được thiết kế cho nghĩa nào**, vì thứ bạn thật sự nhận được khác hẳn nhau — mục 4 sẽ cho thấy khác tới mức nào.

---

## 2. CodeSandbox 2026: nó đã thành cái gì {#s2}

### Chuyện đã xảy ra, theo đúng thứ tự

| Ngày | Việc |
|---|---|
| **12/12/2024** | Together AI công bố mua lại CodeSandbox. Không công bố giá. |
| **13/01/2025** | Changelog CodeSandbox: "Joining Together AI, launching CodeSandbox SDK" |
| **20/05/2025** | Bài blog cuối cùng trên `codesandbox.io/blog` |
| **01/04/2026** | Repositories ngừng nhận import mới |
| **01/07/2026** | Repositories hết hỗ trợ hoàn toàn |

Hai mốc cuối lấy từ banner trên chính trang docs của họ:

> Deprecation notice: CodeSandbox Repositories will no longer accept new imports starting April 1, 2026. Full support for repositories will end on July 1, 2026. Please review our migration guide to transition to **GitHub Codespaces**.

Đọc kỹ chữ cuối: CodeSandbox tự tay chỉ người dùng sang GitHub Codespaces.

### Chỗ khó chịu: gần như không có thông báo công khai

Đây là phần tôi tìm lâu nhất, và kết quả là **không tìm thấy**:

- `codesandbox.io/changelog` — bài mới nhất là **15/05/2025**. Không có dòng nào về việc khai tử repositories.
- `codesandbox.io/blog` — bài mới nhất là **20/05/2025**.

Thứ duy nhất tồn tại là **một email gửi riêng cho người dùng**, được ai đó đăng lại lên Hacker News ngày 17/03/2026. Trong thread đó có người hỏi thẳng: *"where's the actual notice? all traces of it have been deleted..?"*

Email đó còn nói hai điều không hề xuất hiện ở bất kỳ đâu công khai:

- **Sandpack: "No longer actively maintained."** Repo vẫn để public.
- **CodeSandbox CI: đóng cửa.**

Và ngày tháng trong email (15/04 và 15/07) *lệch* với ngày trên docs (01/04 và 01/07). Tôi không xác định được bên nào đúng; tôi chọn tin docs vì đó là tuyên bố first-party duy nhất còn sống.

> ⚠️ Riêng chuyện Sandpack đáng nói thêm. Tính tới hôm nay, **không có một thông báo ngừng bảo trì nào công khai**: footer `codesandbox.io` vẫn liệt kê Sandpack ở mục Ecosystem, trang `sandpack.codesandbox.io/docs` vẫn sống và không có banner cảnh báo, README trên GitHub cũng không. Repo chưa archive, 6.2k sao. Nhưng lần push cuối là **24/04/2025** và bản npm mới nhất `2.20.0` ra **14/02/2025**.
>
> Nói cách khác: một thư viện được quảng bá như đang sống, thực tế đã đóng băng 18 tháng, và bằng chứng duy nhất về tình trạng thật của nó là một email riêng tư.

Tự kiểm chứng phần npm:

```bash
npm view @codesandbox/sandpack-react dist-tags time --json
npm view @codesandbox/sdk dist-tags --json
```

Với `@codesandbox/sdk` cũng có chuyện tương tự: 127 bản đã publish, nhưng dist-tag `latest` vẫn dừng ở **2.4.2 ngày 04/12/2025**. Cả năm 2026 chỉ có đúng một bản được đẩy lên (2.5.0, 10/03/2026), và nó nằm ở tag `pint` chứ không phải `latest`.

### Sản phẩm bây giờ bán cho máy, không bán cho người

Trang chủ mở đầu bằng banner *"CodeSandbox is now part of Together AI"*, cuối trang ghi *"© 2026 CodeSandbox BV, a Together AI company"*. Phần hero không nói gì về editor:

> Programmatically spin up isolated sandboxes for instant code execution in your AI agents and code playgrounds.

Docs cũng bắt đầu bằng `npm install`, không phải bằng "tạo sandbox đầu tiên của bạn":

```bash
npm install @codesandbox/sdk
```

```js
import { CodeSandbox } from "@codesandbox/sdk";

const sdk = new CodeSandbox();
const sandbox = await sdk.sandboxes.create();
const client = await sandbox.connect();

const output = await client.commands.run("echo 'Hello World'");
```

Bạn cần API key và expose thành `CSB_API_KEY`. Người dùng của sản phẩm này là **chương trình**, không phải người.

### Vẫn còn gì cho người?

Có, và cần nói cho công bằng: **browser sandbox vẫn sống**. `codesandbox.io/embed/new` mở ra một editor React chạy được, không cần đăng nhập. Gói free ("Build", $0) cho 5 thành viên, 40 giờ VM credit mỗi tháng, không giới hạn số sandbox, VM tối đa 4 vCPU + 8 GiB.

Nhưng dấu hiệu mục ruỗng thì thấy rõ. Link "Explore templates" ngay trên trang chủ trỏ tới `codesandbox.io/templates`, và trang đó trả về:

```
Application error: a server-side exception has occurred
Digest: 3016558034
```

Tôi thử hai lần, cùng kết quả. Còn `codesandbox.io/docs/learn/environment/vm` thì vẫn mô tả "CodeSandbox repositories" như thể chúng đang tồn tại — **đừng tin bảng VM ở trang đó**, nó tả một sản phẩm đã chết.

---

## 3. Thử cái còn làm được việc đó: StackBlitz {#s3}

Câu hỏi tự nhiên tiếp theo: thứ CodeSandbox vừa bỏ, còn ai làm không? Tôi ném đúng repo đó sang StackBlitz:

```
https://stackblitz.com/github/PinNguyen9x/pinit
```

Mở thẳng, **không cần đăng nhập**, có editor và terminal thật. Log terminal nguyên văn:

```
311 packages are looking for funding
  run `npm fund` for details
▲ Next.js 15.5.15
- Local:        http://localhost:3000
✓ Starting...
  Downloading swc package @next/swc-wasm-nodejs... to /home/.cache/next-swc
✓ Ready in 6.8s
○ Compiling / ...
✓ Compiled / in 367.3s (12528 modules)
GET / 200 in 432286ms
GET / 200 in 67978ms
GET / 200 in 5169ms
```

Dãy số cuối là toàn bộ câu chuyện:

| Mốc | Thời gian |
|---|---|
| Clone + `npm install` + dev server sẵn sàng | **6,8 giây** |
| Compile route `/` lần đầu (12528 module) | **367,3 giây** (~6 phút) |
| `GET /` lần 1 | **432 giây** (~7,2 phút) |
| `GET /` lần 2 | **68 giây** |
| `GET /` lần 3 | **5,2 giây** |

Và trang **hiện ra đầy đủ**: title `Pin Nguyen | Blog`, bốn knowledge track, phần Featured Works. Không phải một cái vỏ trắng.

### Vì sao lần đầu chậm tới vậy

Dòng đáng chú ý là `Downloading swc package @next/swc-wasm-nodejs`.

StackBlitz chạy trên **WebContainers** — một Node runtime biên dịch sang WebAssembly, chạy ngay trong tab trình duyệt của bạn. Không có máy chủ nào ở đầu kia. Hệ quả trực tiếp, tài liệu của họ nói thẳng: *"It is not possible to run native addons"*, nên Node được khởi động với cờ `--no-addons`.

Next.js bình thường biên dịch bằng binary native (`@next/swc-linux-x64-gnu`). Binary đó nạp không được, Next tự rơi về bản WASM. Vẫn chạy — nhưng 6 phút cho 12528 module là cái giá phải trả.

Cùng lý do đó, `pnpm` 12 hiện **không chạy được** trên WebContainers vì nó ship một executable native. Cứ thứ gì là binary thì đừng trông đợi.

### Một chỗ mà issue tracker nói sai

Issue [webcontainer-core#1978](https://github.com/stackblitz/webcontainer-core/issues/1978) mở từ 24/09/2025 và vẫn đang open, báo rằng Next.js trên WebContainers văng `Invariant: Expected workUnitAsyncStorage to have a store`. Trong thread có người kết luận "anything above **15.4.7** gets this error". Nhân viên StackBlitz trả lời ngày 17/02/2026 rằng đã báo nội bộ nhưng không hứa thêm gì.

pinit chạy **Next.js 15.5.15** — nằm gọn trong khoảng được cho là hỏng. Đo thật: **không gặp lỗi đó**, app chạy tới cùng và render đủ.

Bài học phụ, không liên quan sandbox nhưng đáng nhớ: **một issue còn open không có nghĩa là lỗi còn sống.** Nó chỉ có nghĩa là chưa ai đóng nó.

### Đối chiếu với máy thật cho công bằng

pinit vốn đã nặng. Trên MacBook, `next dev` mất 48–50 giây mỗi route và thỉnh thoảng tự restart vì chạm ngưỡng RAM. Nên phần lớn cái chậm là do project, không phải do StackBlitz. Thứ StackBlitz thêm vào là hệ số nhân của tầng WASM.

---

## 4. Preview không phải deploy {#s4}

Đây là chỗ nối lại với mục 1, và là hiểu nhầm tốn kém nhất.

Khi dev server chạy, StackBlitz cho bạn một URL trông y hệt URL thật:

```
https://<id>--3000--<hash>.local-credentialless.webcontainer.io/
```

Có domain, có HTTPS, mở được ở tab riêng. Rất dễ tưởng đây là bản deploy tạm và gửi link cho người khác xem.

Mở nó ở một tab khác, đây là thứ hiện ra:

> **You're almost there!**
> In order to see your preview, you need to connect this tab to its project.

Lý do: **không có server nào ở đầu kia cả.** Toàn bộ "máy chủ" chạy bên trong tab đang mở project của bạn. Đóng tab là hết. Gửi link cho đồng nghiệp thì họ nhận đúng màn hình trên, không phải trang web.

Chiếu lại ba nghĩa ở mục 1:

- Đây là **C** (playground) chạy trên nền **B** (cô lập trong trình duyệt).
- Nó **không phải A**. Không có môi trường nào được dựng cho người khác truy cập, không có URL chia sẻ được, không có gì sống sót sau khi bạn đóng tab.

Nếu thứ bạn cần là "chỗ để QA vào bấm thử" hay "link gửi khách xem bản nháp" thì **không công cụ nào trong bài này làm việc đó**. Cái bạn cần là môi trường staging thật: deploy preview của Vercel/Netlify, hoặc một namespace riêng trên cluster của bạn. Khác bài toán, khác công cụ.

---

## 5. Bốn nền tảng, một hướng đi {#s5}

| | Mở repo public trong trình duyệt? | Gói free | Thực chất giờ là gì |
|---|---|---|---|
| **CodeSandbox** | **Không.** Repo import tắt 01/04/2026, hết hỗ trợ 01/07/2026. Vẫn mở/sửa được *sandbox* (không gắn Git), kể cả khi chưa đăng nhập. | Build $0 — 5 thành viên, 40 giờ VM credit/tháng, sandbox không giới hạn, VM tối đa 4 vCPU / 8 GiB | Bán hạ tầng microVM (CodeSandbox SDK) cho người xây AI agent, bên trong **Together AI** |
| **StackBlitz** | **Có**, miễn phí, không cần đăng nhập | Personal $0 — project public không giới hạn, mở và sửa repo GitHub public, upload tối đa 1MB/project | IDE chạy hoàn toàn trong trình duyệt; công ty đã dồn lực sang **Bolt.new** |
| **GitHub Codespaces** | **Có**, gói free bao gồm | 120 core-hour + 15 GB-month/tháng (GitHub Free) — tức **60 giờ** trên máy 2 core mặc định | Cloud dev environment chính thống cho người, và là nơi CodeSandbox chỉ người dùng chạy sang |
| **Ona** (Gitpod cũ) | **Không** — không còn gói free | Không có. Core **từ $20/tháng** | Sandbox + điều phối cho coding agent chạy nền. **OpenAI mua, đóng deal 10/08/2026** |

Vài số chi tiết nếu bạn cần tính tiền:

- **Codespaces**: máy nhỏ nhất 2 core / 8 GB RAM / 32 GB đĩa, cũng là mặc định. Quá hạn mức thì $0.18/giờ, đĩa $0.07/GB-tháng. Không gắn thẻ thì bị chặn hẳn chứ không âm thầm tính tiền. Idle timeout mặc định 30 phút, xoá sau 30 ngày không dùng.
- **StackBlitz**: Pro $18/tháng (trả theo năm) hoặc $25 trả tháng. Lưu ý lớn nếu định nhúng vào web: **embed chỉ chạy trên trình duyệt nhân Chromium**.
- **Ona**: tính bằng OCU, 80–2200 OCU/tháng tuỳ gói, môi trường tự xoá sau 7 ngày không dùng. Gitpod Classic bản trả-theo-dùng đã tắt 15/10/2025. Maintainer open source xin được tối đa $200 credit/tháng.
- **CodeSandbox**: gói Scale từ $170/tháng/workspace; VM ngoài hạn mức $0.15/giờ (docs ghi số lẻ hơn: $0.01486/credit).

### Cái đáng chú ý không nằm trong bảng

Đọc dọc cột cuối:

- CodeSandbox → **Together AI** (12/2024)
- Gitpod → đổi tên thành Ona (02/09/2025) → **OpenAI** (đóng deal 10/08/2026)

Hai trong bốn nền tảng đã bị AI lab mua, và cả hai đều đổi từ "IDE cho người" sang "sandbox cho agent". Đây không phải trùng hợp: thứ hiếm mà các lab cần không phải editor, mà là **năng lực bung hàng nghìn môi trường cô lập trong vài giây để chạy code do model sinh ra**. Đúng thứ mà mấy công ty này đã dành nhiều năm xây.

Nói theo bảng ở mục 1: **thị trường đã chuyển giá trị từ nghĩa C sang nghĩa B.** Người dùng là người thì được thừa hưởng phần còn lại, không phải phần được đầu tư.

---

## 6. Vậy khi nào nên dùng cái gì {#s6}

Bỏ qua thương hiệu, hỏi thẳng bạn cần gì:

**Mở nhanh repo public của người khác để đọc và thử sửa** → **StackBlitz**. Dán link `stackblitz.com/github/<owner>/<repo>` là xong, không cần tài khoản. Chấp nhận rằng thứ gì cần binary native sẽ chậm hoặc không chạy.

**Môi trường dev đầy đủ, giống máy thật, có Docker và binary native** → **GitHub Codespaces**. 60 giờ/tháng miễn phí trên máy 2 core là đủ dùng cho việc lặt vặt. Đây cũng là chỗ CodeSandbox tự chỉ người dùng của họ sang.

**Nhúng ví dụ code chạy được vào bài viết hoặc tài liệu** → StackBlitz embed, và nhớ nó **chỉ chạy trên Chromium**. Sandpack về lý thuyết hợp hơn cho việc này, nhưng với tình trạng đã đóng băng từ 02/2025 và bị gọi là "no longer actively maintained" trong một email riêng, tôi sẽ không xây thứ gì mới trên nó.

**Chạy code do AI sinh ra, cô lập, quy mô lớn** → đây mới là chỗ **CodeSandbox SDK** thật sự mạnh, và là lý do nó được mua. Nếu bài toán của bạn là "spin 500 sandbox song song cho agent" thì nó được thiết kế đúng cho việc đó.

**Link cho người khác vào xem bản nháp** → **không phải sandbox**. Dùng deploy preview thật.

**Project nặng, build lâu, ăn RAM** → cứ ở máy của bạn. pinit mất 6 phút cho lần compile đầu trên StackBlitz so với ~50 giây ở local. Sandbox trên trình duyệt được việc khi project nhẹ và bạn cần *nhanh và tiện*, không phải khi bạn cần *khoẻ*.

---

## Điều đáng nhớ nhất

Ba thứ tôi mang ra khỏi buổi này.

**Một — kiểm bằng tay trước khi tin tài liệu.** Docs của CodeSandbox vẫn mô tả repositories như đang sống, trong khi app báo đã gỡ. Issue tracker của StackBlitz nói Next.js 15.5 hỏng, trong khi 15.5.15 chạy ngon. Cả hai chiều đều sai được, và cách duy nhất để biết là mở lên chạy thử.

**Hai — "còn truy cập được" khác với "còn được bảo trì".** Sandpack có docs, có repo public, có mặt ở footer trang chủ, chưa archive. Nhìn từ ngoài vào là một dự án khoẻ mạnh. Ngày publish cuối trên npm mới là thứ nói thật. Trước khi chọn một thư viện, xem `npm view <pkg> time` và ngày push cuối của repo — hai con số đó khó nguỵ trang hơn trang chủ nhiều.

**Ba — khi một công cụ đổi chủ, hãy hỏi nó đang được mua vì cái gì.** Together AI không mua CodeSandbox vì cái editor. OpenAI không mua Ona vì giao diện. Họ mua năng lực bung microVM. Phần bạn đang dùng hằng ngày — nếu nó không nằm trong lý do mua — sẽ không biến mất ngay, nhưng cũng sẽ không được đầu tư nữa. Và như trường hợp này cho thấy, tin báo tử có khi chỉ đến bằng một email mà bạn phải đọc lại trên Hacker News.
