// Danh sách route mà `npm run verify` đi qua. Nguồn sự thật về *ý nghĩa* của
// từng route là docs/feature-map.md — file này là bản máy đọc được của nó.
// Thêm route vào pages/ thì sửa cả hai, nếu không verify bỏ qua route mới
// trong im lặng.
//
// Mỗi mục:
//   path      URL để mở.
//   auth      'public' | 'owner' — 'owner' thì dùng cookie đã đăng nhập.
//   status    Mã HTTP mong đợi. Mặc định 200. 404 ở đây là KỲ VỌNG, không phải lỗi.
//   external  Dữ liệu đến từ API ngoài repo (xem docs/feature-map.md). Với các
//             route này chỉ kiểm "không 5xx": một lần API ngoài chết không được
//             làm verify đỏ vì lý do không liên quan thay đổi vừa làm.
//   expect    Mảng điều kiện về nội dung. Chỉ đặt thứ nào ổn định qua các lần
//             chạy — đếm phần tử, chuỗi cố định. Không đặt thứ phụ thuộc dữ
//             liệu của API ngoài.
//
// Điều kiện trong `expect`:
//   { selector, min }   số phần tử khớp selector phải >= min
//   { selector, count } số phần tử khớp selector phải đúng bằng count
//   { text }            chuỗi phải xuất hiện trong body
//   { text, count }     chuỗi phải xuất hiện đúng số lần đó
//   { missing }         chuỗi KHÔNG được xuất hiện

/** Dữ liệu thật, lấy 21/11/2026. Đổi khi fixture hoặc nội dung đổi. */
export const SAMPLES = {
  blogSlug: 'reactjs-techniques-hooks',
  systemDesignSlug: 'nguyen-ly-cap-microservices',
  workId: '85287225-2cec-5155-8a6e-555d97248cb7',
  postId: 'aqbbx1vj1lqrtv3wg',
  // Từ private-content.example/ — slug của note và case study lấy theo TÊN FILE,
  // còn slug của post lấy từ frontmatter.
  mePostSlug: 'vi-du-bai-viet',
  meCaseStudySlug: 'example-migration',
  meTopic: 'kubernetes',
  meNote: 'scheduling',
}

// `detail` của mỗi thuật ngữ glossary kết thúc bằng điểm neo này, và nó chỉ
// render khi thẻ đang mở (`Collapse ... unmountOnExit`). Nên đếm chuỗi này =
// đếm số thẻ đang mở — tín hiệu rẻ và chắc cho deeplink.
const GLOSSARY_ANCHOR = '💡 Dễ nhớ:'

export const ROUTES = [
  // --- Công khai: nội dung chính -------------------------------------------
  {
    path: '/',
    auth: 'public',
    external: true,
    // Trang chủ KHÔNG link tới từng bài blog — đã kiểm HTML tĩnh: chỉ có
    // href="/blog" và link works. Nên neo vào hai heading cố định của hai khối
    // chính, không neo vào số đếm (số bài đổi mỗi lần thêm bài).
    expect: [{ text: 'Đọc theo chủ đề' }, { text: 'Featured Works' }],
  },
  { path: '/about', auth: 'public', expect: [{ selector: 'h1, h2', min: 1 }] },
  {
    path: '/blog',
    auth: 'public',
    // 35 file trong blog/. Ngưỡng 30 để thêm/bớt một hai bài không làm đỏ, mà
    // mất cả danh sách thì vẫn bắt được.
    expect: [{ selector: 'a[href^="/blog/"]', min: 30 }],
  },
  {
    path: `/blog/${SAMPLES.blogSlug}`,
    auth: 'public',
    expect: [{ selector: 'pre', min: 1 }],
  },
  {
    path: '/glossary',
    auth: 'public',
    expect: [
      { selector: 'article', count: 119 },
      // Chưa bấm gì thì không thẻ nào mở.
      { text: GLOSSARY_ANCHOR, count: 0 },
    ],
  },
  {
    path: '/glossary#API',
    auth: 'public',
    name: 'glossary deeplink',
    // Deeplink đọc hash lúc mount → đúng một thẻ mở ra.
    expect: [{ text: GLOSSARY_ANCHOR, count: 1 }],
  },
  {
    path: '/glossary/muc-luc',
    auth: 'public',
    expect: [{ selector: 'a, li', min: 50 }],
  },
  { path: '/system-design', auth: 'public', expect: [{ selector: 'a[href^="/system-design/"]', min: 10 }] },
  {
    path: `/system-design/${SAMPLES.systemDesignSlug}`,
    auth: 'public',
    expect: [{ selector: 'h1, h2', min: 1 }],
  },
  { path: '/system-design/cheat-sheet', auth: 'public', expect: [{ selector: 'h1, h2', min: 1 }] },

  // --- Công khai: works (dữ liệu từ API ngoài) -----------------------------
  { path: '/works', auth: 'public', external: true },
  {
    path: '/works/infinity-scroll',
    auth: 'public',
    external: true,
    // Lỗi hydrate có sẵn trên main, không do verify gây ra. Khai ở đây để
    // verify không đỏ vì nó, nhưng summary.md vẫn liệt kê riêng — sửa xong thì
    // GỠ khối này, nếu không verify thôi canh chỗ đó.
    knownIssue: {
      ref: 'PINIT-63',
      pattern: /React error #418/,
    },
  },
  { path: `/works/${SAMPLES.workId}/details`, auth: 'public', external: true },
  {
    path: `/works/${SAMPLES.workId}`,
    auth: 'public',
    external: true,
    name: 'works edit (cần login riêng của json-server-blog)',
  },
  {
    path: `/works/${SAMPLES.workId}/pinit`,
    auth: 'public',
    status: 404,
    name: 'works game route — 404 vì work này không có published',
  },

  // --- Công khai: nhóm học/thử nghiệm cũ -----------------------------------
  { path: '/posts', auth: 'public', external: true },
  { path: `/posts/${SAMPLES.postId}`, auth: 'public', external: true },
  {
    path: '/posts/khong-ton-tai-chac-chan-404',
    auth: 'public',
    status: 404,
    name: 'posts 404 đúng thiết kế',
  },
  { path: '/posts/create', auth: 'public' },
  { path: '/posts/a/b/c', auth: 'public', expect: [{ text: 'Params page' }] },
  { path: '/product', auth: 'public' },
  {
    path: '/swr',
    auth: 'public',
    // Demo SWR gọi /api/students/<id> ghim cứng, id đó không còn ở API ngoài.
    external: true,
    // Chấp nhận đúng một 404 ở đúng endpoint đó. Không nới theo `external`:
    // một trang dùng dữ liệu ngoài vẫn phải sạch console ở mọi chỗ khác.
    tolerate: [
      {
        pattern: /404.*\/api\/students\//,
        why: 'id student ghim cứng trong trang demo không còn ở API ngoài — dữ liệu ngoài repo, không phải lỗi code',
      },
    ],
  },
  { path: '/login', auth: 'public', external: true },

  // --- Khu private /me ------------------------------------------------------
  // /me/login không cần cookie: đó chính là trang để lấy cookie.
  { path: '/me/login', auth: 'public', expect: [{ selector: 'input[type="password"]', count: 1 }] },
  { path: '/me', auth: 'owner', expect: [{ selector: 'h1, h2', min: 1 }] },
  { path: '/me/posts', auth: 'owner', expect: [{ selector: `a[href^="/me/posts/"]`, min: 1 }] },
  { path: `/me/posts/${SAMPLES.mePostSlug}`, auth: 'owner', expect: [{ selector: 'h1, h2', min: 1 }] },
  { path: '/me/learn', auth: 'owner', expect: [{ text: SAMPLES.meTopic }] },
  {
    path: `/me/learn/${SAMPLES.meTopic}`,
    auth: 'owner',
    expect: [{ text: SAMPLES.meNote }],
  },
  {
    path: `/me/learn/${SAMPLES.meTopic}/${SAMPLES.meNote}`,
    auth: 'owner',
    expect: [{ selector: 'h1, h2', min: 1 }],
  },
  {
    path: '/me/case-studies',
    auth: 'owner',
    expect: [{ selector: 'a[href^="/me/case-studies/"]', min: 2 }],
  },
  {
    path: `/me/case-studies/${SAMPLES.meCaseStudySlug}`,
    auth: 'owner',
    expect: [{ selector: 'h1, h2', min: 1 }],
  },
  { path: '/me/roadmap', auth: 'owner', expect: [{ selector: 'h1, h2', min: 1 }] },
  {
    path: '/me/practice',
    auth: 'owner',
    // Trang phải vào được dù chưa cấu hình gì; lời gọi model được kiểm riêng ở
    // bước API, không ở bước mở trang.
    expect: [{ missing: 'practice đang tắt' }],
  },

  // --- Route không có trong pages/, kiểm cửa vào ---------------------------
  {
    path: '/me',
    auth: 'anonymous',
    name: '/me chưa đăng nhập phải chuyển sang /me/login',
    redirectTo: '/me/login',
  },
]

/**
 * Lời gọi API của /me/practice — đường duy nhất đi tới model. Kiểm riêng khỏi
 * ROUTES vì đây là POST có body, không phải một trang mở được.
 *
 * Mục đích: chứng minh lời gọi model đi qua stub cục bộ và trả 200, chứ không
 * ra ngoài Internet. Thiếu bước này thì mock chỉ là lời khai.
 */
export const API_CHECKS = [
  {
    name: 'POST /api/me/practice/generate',
    method: 'POST',
    path: '/api/me/practice/generate',
    body: { topic: SAMPLES.meTopic },
    status: 200,
    expectJson: (j) => (Array.isArray(j.questions) && j.questions.length === 5
      ? null
      : `cần 5 câu hỏi, nhận ${JSON.stringify(j.questions)?.slice(0, 80)}`),
  },
  {
    name: 'POST /api/me/practice/grade',
    method: 'POST',
    path: '/api/me/practice/grade',
    body: {
      topic: SAMPLES.meTopic,
      question: 'Scheduler của Kubernetes lọc rồi chấm điểm node theo thứ tự nào?',
      answer: 'Lọc trước (predicates), sau đó chấm điểm (priorities) các node còn lại.',
    },
    status: 200,
    expectJson: (j) =>
      Number.isInteger(j.score) && typeof j.followUp === 'string'
        ? null
        : `cần score nguyên và followUp chuỗi, nhận ${JSON.stringify(j)?.slice(0, 80)}`,
  },
  {
    name: 'POST /api/me/practice/grade thiếu answer → 400',
    method: 'POST',
    path: '/api/me/practice/grade',
    body: { topic: SAMPLES.meTopic, question: 'thiếu answer' },
    status: 400,
  },
]
