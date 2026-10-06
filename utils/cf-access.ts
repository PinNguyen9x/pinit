// Lớp kiểm Cloudflare Access cho khu /me. Đứng TRƯỚC passphrase + cookie HMAC,
// KHÔNG thay thế: Access chứng minh "đúng người có email trong policy", passphrase
// chứng minh "biết bí mật". Mất một lớp vẫn còn lớp kia.
//
// Không import gì của Node — middleware (edge runtime) gọi vào đây. `jose` chạy
// bằng Web Crypto nên hợp cả hai runtime.
import { createRemoteJWKSet, jwtVerify } from 'jose'

export interface CfAccessConfig {
  teamDomain: string
  aud: string
}

// Cloudflare gửi JWT ở CẢ hai chỗ. Header là đường chính; cookie là đường dự phòng
// cho request không qua proxy chèn header (và để debug bằng trình duyệt).
export const CF_ACCESS_HEADER = 'cf-access-jwt-assertion'
export const CF_ACCESS_COOKIE = 'CF_Authorization'

/**
 * Chuẩn hoá team domain: chấp cả `https://pinit.cloudflareaccess.com/` và
 * `pinit.cloudflareaccess.com`. Dán cả scheme vào env là lỗi hay gặp nhất, mà
 * triệu chứng chỉ là "mọi request /me trả 403" — không có gì chỉ ra nguyên nhân.
 */
function normalizeTeamDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
}

/**
 * null = lớp Access TẮT (bỏ qua check). Cố ý: local và staging không có Access
 * đứng trước, bật check ở đó thì tự khoá mình ra ngoài.
 *
 * Chỉ bật khi CẢ HAI biến có giá trị. Đặt một biến mà quên biến kia thì vẫn tắt —
 * xem cfAccessProblem(), nó lo phần làm cho sự im lặng đó lộ ra lúc khởi động.
 */
export function getCfAccessConfig(): CfAccessConfig | null {
  const teamDomain = normalizeTeamDomain(process.env.CF_ACCESS_TEAM_DOMAIN ?? '')
  const aud = (process.env.CF_ACCESS_AUD ?? '').trim()
  if (!teamDomain || !aud) return null
  return { teamDomain, aud }
}

/**
 * Vì sao lớp Access không bật — dùng cho log lúc khởi động (instrumentation.ts).
 * null = không có gì đáng nói (bật hẳn, hoặc tắt hẳn một cách có ý thức).
 *
 * Cấu hình nửa vời là ca nguy hiểm: owner tưởng /me đã có Access che, thực tế
 * check bị bỏ qua hoàn toàn. Phải hét lên, không được im.
 */
export function cfAccessProblem(): string | null {
  const teamDomain = normalizeTeamDomain(process.env.CF_ACCESS_TEAM_DOMAIN ?? '')
  const aud = (process.env.CF_ACCESS_AUD ?? '').trim()
  if (!teamDomain && !aud) return null
  if (!teamDomain) return 'CF_ACCESS_AUD đã đặt nhưng CF_ACCESS_TEAM_DOMAIN rỗng — lớp Access BỊ BỎ QUA.'
  if (!aud) return 'CF_ACCESS_TEAM_DOMAIN đã đặt nhưng CF_ACCESS_AUD rỗng — lớp Access BỊ BỎ QUA.'
  return null
}

// JWKS cache theo team domain. createRemoteJWKSet tự cache key và tự giới hạn tần
// suất gọi lại; tạo mới mỗi request thì mất cache -> một lượt fetch cho mỗi request.
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

function jwks(teamDomain: string) {
  let set = jwksCache.get(teamDomain)
  if (!set) {
    set = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`))
    jwksCache.set(teamDomain, set)
  }
  return set
}

/** Lấy JWT từ header, không có thì tới cookie. undefined = không có token nào. */
export function readAccessToken(
  header: string | null | undefined,
  cookie: string | null | undefined,
): string | undefined {
  return header?.trim() || cookie?.trim() || undefined
}

/**
 * true = JWT hợp lệ. Verify bằng `jose`, không tự tay giải chữ ký.
 *
 * Kiểm đủ ba thứ: chữ ký khớp JWKS của team, `iss` = team domain, `aud` chứa AUD
 * tag của đúng application. Thiếu `aud` thì JWT của BẤT KỲ app nào trong cùng
 * team cũng qua được — kể cả app do người khác trong team tạo.
 *
 * Lỗi mạng khi lấy JWKS cũng trả false (fail closed). Lần đầu mới tốn một request;
 * sau đó jose giữ key trong cache.
 */
export async function verifyAccessJwt(
  token: string,
  { teamDomain, aud }: CfAccessConfig,
): Promise<boolean> {
  try {
    await jwtVerify(token, jwks(teamDomain), {
      issuer: `https://${teamDomain}`,
      audience: aud,
    })
    return true
  } catch {
    return false
  }
}
