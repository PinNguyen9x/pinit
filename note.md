- <Link/> Di chuyển giữa các trang (Client side routing) nó không làm full page reload chỉ get file javascript về -> chạy file đó để chuyển qua trong mong muốn.
- prerendering -> tải những file html dc tạo phía server -> load javascript -> gắn event vào DOM (hydration).
  . SSG: default render của nextjs nó là build times tạo ta những file html -> forward lại cho user
  . SSR: (Run times) theo từng request tạo ta file html trả về cho user
  . ISR(Incremental static regenration)
  . CSR: ko render gì phía server mà đợi get file js về -> render phía client.
  -NextJs (client side rendering) là sự kết hơpj của (static generation + fetch )
  data on the client side

- Automatic static optimizaion
- SWR (stale-while-revalidate): React hooks for data fetching
  -- Trong video mình đề cập tới 2 tasks

1. Target to have type suggestion when using profile from useAuth()
2. TIP: Organize Imports (Option + Shift + O)

Mà ở cái task số 2 mình phát hiện có một số vấn đề (sẽ fix ở video 06-13) nhưng mình chia sẻ ở đây trước.

- Đầu tiên là khi optimize import, nó remove luôn dòng import React, cái này OK mn nhen. Vì NextJS 11 mình đang dùng, nó đang sử dụng React 17, mà từ React 17 nó đã chuyển sang dùng jsx transform rồi, ko còn dùng React.createElement() nữa, nên có thể bỏ đi import React. Chi tiết các bạn đọc ở đây nha (https://reactjs.org/blog/2020/09/22/i...)
- Cái thứ hai là đừng sửa file tsconfig chỗ jsx, vì mình sửa xong thì khi chạy lệnh dev / build ở lần tiếp theo thì nextjs nó cũng override lại cái file tsconfig của mình à, do nó muốn dùng value preserve 😅 Nên mn khỏi sửa nhé.
