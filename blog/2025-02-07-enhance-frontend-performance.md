---
slug: enhance-frontend-performance-critical-rendering-path
title: Enhance frontend performance - Critical Rendering Path (CRP)
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [ReactJS, JavaScript, TypeScript]
date: '2024-07-29T12:00:00Z'
image: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80
---

Vấn đề cốt lõi của tối ưu Frontend là làm sao để trình duyệt tải và hiển thị nội dung trang web một cách nhanh chóng nhất, từ đó mang lại trải nghiệm tốt cho người dùng. Để giải quyết vấn đề này, chúng ta cần phối hợp nhiều kỹ thuật khác nhau, tập trung vào ba yếu tố chính: giảm dung lượng tài nguyên (như HTML, CSS, JavaScript, hình ảnh) bằng cách minification, tree shaking, code splitting, nén file; tận dụng bộ nhớ đệm (cache) của trình duyệt và CDN để lưu trữ và tái sử dụng tài nguyên, giảm số lượng request; và tối ưu hóa cách tải và thực thi code bằng cách sử dụng async, defer, lazy loading, preload, prefetch. Khi giải quyết được ba yếu tố này, tốc độ tải trang sẽ được cải thiện đáng kể, giúp người dùng truy cập và tương tác với trang web một cách mượt mà và hiệu quả hơn.

<!-- truncate-->

## Agenda

## 1. Enhance Frontend - Critical Rendering Path (CRP)

### 1.1 What is CRP?

> Browser rendering pipleline:Là trình tự các bước **browser** chuyển đổi các resource (html, css, js) thành **pixcel** trền màn hình.

![Critical Rendering Path Process](https://miro.medium.com/v2/resize:fit:800/format:webp/1*1TqtN67IYVJBafkUGKwiMw.png)
_Figure: Critical Rendering Path Process - Source: miro.medium.com_

- **📝NOTES**:

  - Qúa trình chuyển đổi HTML -> DOM và CSS -> CSSDOM sẽ chạy song song và 2 quá trình này hoàn tất sẽ tạo thành cây hoàn chỉnh (Render Tree)
  - **Render Tree** sẽ tính toán các style cuối cùng cho các **Node**, ví dụ loại bỏ các Node có thuộc tính `display:none` chẳn hạn.
  - **Layout** từ các thông tin trên **Render Tree** trình duyệt phải tính toán các vị trí và kích cở của các phần tử Node.
  - **Paint**: sau khi xong tất các các công đoạn tính toán các style, xác định vị trí thì sẽ tới bước cuối cùng này lúc này người dùng sẽ thấy được giao diện.
  - Tóm cần phải biết bản chất của việc browser phải thực hiện những công đoạn nào trước khi hiển thị nôi dung đến với người dùng là bước đầu tiên và quan trong trong việc cải hiện hiêu suất phía frontend.

### 1.2 Những Nguyên Nhân có thể ảnh hưởng đến hiệu suất:

- **Blocking Resource**: Sẽ bao gồm hai thuật ngữ nữa đó là **render bloking** và **parser blokcing**

  - **render blocking**: Là những tài nguyên ngăn chặn thực thi render giao diện. ở đây ứng với step (HTML, CSS) được xem là render blocking bởi vì việc sinh ra hai thằng này lâu sẽ gây blocking cho các bước tiếp theo.
  - **parser blocking**: Là những tài nguyên ngăn chạn trình duyệt parse HTML(xây dựng cây DOM).vd

  ```sh
  <html>
    <head>
    </head>
    <body>
      <sript src="/script.js"></script>
    </body>
  </html>
  ```

  thẻ **`<script>`** có thể ngăn chặn việc sinh ra cây DOM. Việc xuây dựng DOM sẽ phải chờ cho tới khi các script được tải và thực thi xong.Chúng ta có thể hiểu là javascript sẽ chạy các mã lệnh từ trên xuống dưới nên trong lúc thực thi các đoạn code gặp thẻ **`script`** thì nó phải dừng việc thực thi cây DOM lại để (tải + thực thi các script) trước cho chắc cốp lý do là có thể trong **`script`** có chứa các mã tác động lên phần tử DOM. Khi hoàn thành thì mới tiếp tục chạy các mã bên dưới.

- Khi Hiểu bản chất việc browser render như thế nào và các yếu tố có thể ảnh hưởng đến việc tốc độ hiển thị nội dung đến với người dùng như thế nào ta sẽ tìm ra được các giai pháp để cải thiện hiệu suất render.có thể hiểu nôm na rằng ta chia tách công đoạn từ Bước đầu tiền (NetWork) -> bước cuối cùng (Paint) thành nhiều bước nhỏ việc tối ưu các bước này làm cho chúng nhanh lên thì chắc chắc hiệu suất tổng thể cuối cùng sẽ nhanh.

## 2. Three Main Frontend Optimization Approaches

### 2.1. SIZE Optimization:

> Tất Cả các thành tố phía trước đoạn Render Tree nếu kích thước càng nhỏ-> các cây (DOM, CSSDOM) nhỏ, khố lương công việc nhỏ đến cuối cùng paint thì sẽ nhanh hơn. Đó cùng là một trong những nguyên lý chung của việc tối ưu càng nhỏ thì càng nhanh ^^!

- **Minification** techniques: cắt bỏ các code thừa (comment, xuống dòng, khoảng trắng) máy sẽ ko cần đến những thứ này chúng chỉ hỗ trợ phía DEV. kỹ thuật(cấu hình webpack).

- **Tree-shaking implementation**:Giúp loại bỏ các code, thư viện không dùng đến vd (import \* from lodash). Nên import những function dùng thôi.
  ![Tree-shaking implementation](https://miro.medium.com/v2/resize:fit:800/format:webp/1*h0Gb9uV_5ri2jE1cr8RhXA.png)
  _Figure: Critical Rendering Path Process - Source: miro.medium.com_

- **Code-splitting strategies**:`Import` nhiều Component vào cùng một Page, vd (Home, Profile) về bản chất nó sẽ bị chậm lúc đầu nhưng khi chuyển qua màn hình Profile nó sẽ nhanh. đây là vấn đề chúng ta cần phải xem xét lại bởi vì đôi lúc chúng ta sẽ không cần load Profile khi mới vào trang Home.trong React ta có thể dùng hàm Lazy.

- **Compression techniques and combined approaches**:Kỹ thuật này phải cấu hình phía server nha nó có 2 thuât toán nén là : `gzip` vs `br` thực ra là thằng `br` cũng tương tự như `gzip` nhưng nó ra sau nên sẽ tối ưu hơn. Khi áp dụng thành công ta có thể check xem thể `Header` của `Request` sẽ có `prop: Content-EndCodeing:gzip` ngoài ra chúng ta có thể dùng **CloudFlare** nó đã tích hợp sẵn kỹ thuật này.
- **Summary of SIZE optimization methods**

- **Special notes on image optimization**: Về bản chất là ta sẽ giảm dung lượng của ảnh đi nhưng chất lượng của nó sẽ không thay đổi đáng kể và người dùng không nhận thấy sự khác biệt
  - Dùng Webpack, vite
  - Tool:`https:tinypng.com`
  - Chyển sang định dạng webP(`Squoosh, Mozjpeg, Guetzli`)
    > Đối với những định dạng như này ta có thể kiểm tra xem trình duyệt có hỗ trợ chúng không `tool: can i use`

### 2.2. CACHE Utilization

> - Cache ở đây chúng ta có thể hiểu là sẽ lấy trước các tài nguyên(resource html, css, media, nội dung) người dùng có thể cần. để sau này họ muốn truy cập lại đúng những tài nguyên đó thì nó sẽ nhanh, chuyển chung sang các server ở gần khu vực địa lý hơn so với người dùng gọi là CDN
> - Hoặc là một hướng tiếp cận nữa là lấy sẵn nội dung gì đấy để sẵn trên máy người dùng.

- **CDN implementation**: Phân tải các tài nguyên (HTML, CSS) ra nhiều web server ở các nước. vd giờ ta truy cập tới một trang web mà resource cần truy cập đang ở Mỹ chẳn hạn và một resource ở Việt Nam thì chắc chắn resource ở Việt Nam sẽ nhanh hơn.
  - Chúng ta có thể kiểm tra bằng cách trên `Request Header` sẽ có thông số `Expires`, cách này phù hợp với những loại data ít có sự thay đổi.
- **IndexDB usage**: Ta có thể dùng để cache lại dữ liệu ít thay đổi từ phía server khi call một **API** nào đó vd các Header của một table nào đó.

### 2.3. WAIT Time Optimization

> Ban đầu tôi có đề cập tới việc Parser Blocking sẽ ngăn chăn quá trình render cây DOM.Chúng ta sẽ tìm hiểu một số kỹ thuật để giảm thiểu nó.

- **Async and Defer techniques**: **Async** giúp quá trình download script diễn ra song song với việc xây dựng cây DOM, nó chỉ dừng lại tại lúc thực thi script và tiếp túc tạo cây DOM khi chạy script xong.thường áp dùng thằng **async** này cho các **google analytics**
  - **google analytics** bản chất cần phân tích hành vi của người dùng nên cần phải chạy script nhanh nhất có thể để biết người dùng thao tác gì trên màn hình.
    **defer** Nó khác **Async** ở một chỗ là việc **download** sẽ diễn ra song song với quá trình xây dựng **DOM** nó chỉ thực thi **script** khi cây **DOM** được xây dựng xong.
  - Tức là người dùng đã thấy giao diện hết rồi thì **script** mới thực thi phía sau ^^.vd là có popup quản cáo (việc hiện quản cáo châm 1, 2 giây đôi khi người dùng còn khoái)
- Lazy loading implementation:

  - **Fold**: ngắn cách giữ viewport và phần ko nhìn thây ta có thể apply kỹ thuật lazy loading cho ảnh khi nào người dùng scroll xuống ta mới load những ảnh cần thiết, chúng ta có thể áp dụng kỹ thuật này (**intersection observer**) vào việc call **API**,
  - Đối với **image**, **iframe** chúng ta có thể dùng kỹ thuật này hoặc dùng trực tiếp thuộc tính **loading="lazy"** trong thẻ **image**
  - **virtual scroll + infinity scroll**:
    - **virtual scroll**:Chỉ hiển thị các phần tử cần thiết trên màn hình, trong khi các phần tử còn lại vẫn được giữ trong bộ nhớ, khi người dùng cuộn các phẩn tử mới được tính toán và hiển thị động vd: lấy hết 100 bản ghi trong db nhưng chỉ hiện thì trc 30 bản ghi khi người dùng scroll mới hiển thị các bản ghi khác.giảm thiểu quá trình xây dựng cây **DOM**
    - **infinity scroll** : khác một tí là nó sẽ chỉ lấy trước 30 bản ghi rồi khi người dùng scroll sẽ tiếp tục trigger call api để lấy bản ghi tiếp theo.vd thực tế là các **combobox** chứa nhiều dữ liệu.

- **Long-running tasks optimization**

  - Có thể liên tưởng như này giả sử có một chiếc xe container rất dài đang chạy trên trên đường và rất hên là đường chỉ có một làn đường nên mấy anh `pikachu` yêu cầu là khi nào xe này chất hết đường tức là từ đầu đường đến cuối đường thì những ông khác vd người đi bộ hoặc người đi xe máy mới được chạy qua. Chúng ta có thể cải thiện bằng cách là thay vì xe `container` dài 200m thì sẽ dùng 20 xe oto con dài 10m và quy định rằng mỗi xe phải chờ nhau một khoảng là 5 phút. và trong 5 phút này các phương tiên có thể băng qua đường chứ không cần chờ hết 20 chiếc xe đó chạy qua. viêc chen những task nhỏ như vậy khiến cho người dùng có thể scroll chuột hoặc làm các việc khác , web vẫn mượt mà trong khi bản chất nó vẫn đang chạy một công việc rất dài và nặng.

- **Web Workers utilization**: chúng ta có thể áp dụng cho các tác vụ tính toán nặng ví dụ trong chứng khoán.

- **Preload and Prefetch strategies**:
  - **preload**: phỏng đoán hoặc biết trước phần trăm cao Web cần resource gì để tải trước luôn.vd các file css, hoặc các ảnh người dùng có cảm giác người dùng nhận thành quả nhanh hơn.
  - **prefetch**: Tải trước các resource lại và cache chúng lại vd web **Chat** tải trước các resource về icon biểu cảm và icon **send** giúp tốc đọ web được cải thiện.
  - **preconnect & DNS-prefetch**: Thường sử dụng cho các domain bên thứ ba bao gôm connect, phân giải tên miền nó sẽ chạy song song với quá trình render
  - **📝NOTES**: chỉ dùng cho ba đến bốn domain bởi vì nó cực kì tốn tài nguyên đặt ra câu hỏi nếu có quá nhiều domain quá thì sao. Chúng ta có thể áp dụng **dns-prefetch** bản chất nó chỉ phân giải tên miền thôi nên ta có thể chia các domain cho việc phân giải tên miền và connect riêng.trong nhiều dự án việc quản lý để giảm open/close kết nối cũng là một thứ cực kì quan trong liên quan đến việc giảm hiêuk năng.

## 3. Tổng Kết:

- Ta sẽ phải xác định được những resource nào thật sự quan trong thì ưu tiên lấy trước
  **(preload, prefetch,dns-prefetch)**
- Những resource nào có đọ ưu tiên thấp hơn/ không cần thiết sẽ có **defer** chúng lại.

## 4. Optimization Tools and Resources

- **LightHouse**: kiểm tra Web vitals + tối ưu.
- **coverage**: Kiểm tra % code được sử dụng trong 1 file.
- **requestblocking**: Chặn request để xem có phải là critical resource không.
- **npm**: `https://bundlephobina.com`
- **browser support**: `https://caniuse.com`
