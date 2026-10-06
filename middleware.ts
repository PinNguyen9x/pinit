import { NextResponse, type NextRequest } from 'next/server'
import {
  CF_ACCESS_COOKIE,
  CF_ACCESS_HEADER,
  getCfAccessConfig,
  readAccessToken,
  verifyAccessJwt,
} from './utils/cf-access'
import { getOwnerConfig } from './utils/owner-auth'
import { OWNER_COOKIE, verifySession } from './utils/owner-session'

// Cửa vào khu private /me. Trang và API dưới /me đều đi qua đây; getServerSideProps
// của từng trang kiểm lại lần nữa (requireOwner) phòng khi matcher bị sửa sai.

// Logout để ngoài: cookie hết hạn vẫn phải xoá được.
const PUBLIC_PATHS = new Set(['/me/login', '/api/me/login', '/api/me/logout'])

function noindex(res: NextResponse) {
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return res
}

export async function middleware(req: NextRequest) {
  const config = getOwnerConfig()
  // Feature tắt: trả 404 như thể route không tồn tại, kể cả trang login.
  if (!config) return noindex(new NextResponse(null, { status: 404 }))

  const { pathname, search } = req.nextUrl

  // Lớp Cloudflare Access, TRƯỚC cả PUBLIC_PATHS: /me/login cũng phải có JWT.
  // Bình thường edge của Cloudflare đã chặn từ xa nên tới được đây là đã có JWT;
  // check này để bắt request vào THẲNG origin — lúc 80/443 còn mở, hoặc khi
  // Access app bị sửa/xoá trên dashboard mà không ai để ý.
  //
  // 403 chứ không redirect: trang login của Access nằm ở edge, origin không có gì
  // để redirect tới. Cũng không trả 404 — 404 lẫn với "feature tắt", mà đây là ca
  // owner cần phân biệt được khi chẩn lỗi.
  const cf = getCfAccessConfig()
  if (cf) {
    const token = readAccessToken(
      req.headers.get(CF_ACCESS_HEADER),
      req.cookies.get(CF_ACCESS_COOKIE)?.value,
    )
    if (!token || !(await verifyAccessJwt(token, cf))) {
      return noindex(new NextResponse(null, { status: 403 }))
    }
  }

  if (PUBLIC_PATHS.has(pathname)) return noindex(NextResponse.next())

  const ok = await verifySession(req.cookies.get(OWNER_COOKIE)?.value, config.sessionSecret)
  if (ok) return noindex(NextResponse.next())

  if (pathname.startsWith('/api/')) {
    return noindex(NextResponse.json({ message: 'Unauthorized' }, { status: 401 }))
  }
  const login = new URL('/me/login', req.url)
  login.searchParams.set('next', pathname + search)
  return noindex(NextResponse.redirect(login))
}

export const config = {
  matcher: ['/me/:path*', '/api/me/:path*'],
}
