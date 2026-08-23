import { readdirSync, readFileSync, statSync } from 'fs'
import { join, relative } from 'path'
import { describe, expect, it } from 'vitest'

/**
 * Chặn tái phát một lỗi đã xảy ra: `hooks/use-auth` import barrel
 * `@/constants`, và use-auth nằm trong chuỗi phụ thuộc của `_app`
 * (pages/_app → @/components/common → header → @/hooks → use-auth).
 *
 * Hệ quả: bất cứ thứ gì được re-export từ `constants/index.ts` đều bị gộp vào
 * bundle dùng chung của TOÀN BỘ site. Khi `./system-design` còn nằm trong
 * barrel, nội dung 13 buổi bị tải trên cả trang chủ, blog và works — làm
 * first-load JS dùng chung phình từ 287 kB lên 340 kB.
 *
 * Không có công cụ nào trong repo bắt được lỗi này: type-check, lint và toàn
 * bộ test đều xanh. Chỉ đọc kích thước chunk trong output của `next build`
 * mới thấy.
 */
describe('barrel constants không kéo dữ liệu lớn vào bundle dùng chung', () => {
  const barrel = readFileSync(join(__dirname, 'index.ts'), 'utf8')

  it('không re-export ./system-design', () => {
    const reexports = barrel
      .split('\n')
      .filter((line) => line.trim().startsWith('export'))
      .filter((line) => line.includes('system-design'))
    expect(reexports).toEqual([])
  })

  it('hook tiến độ không import qua barrel @/constants', () => {
    const hook = readFileSync(join(__dirname, '..', 'hooks', 'use-lesson-progress.ts'), 'utf8')
    expect(hook).not.toMatch(/from '@\/constants'/)
  })

  /**
   * Cùng một cơ chế, nạn nhân khác: `components/form/photo-field` lấy
   * DEFAULT_THUMBNAIL_URL qua barrel nên kéo trọn `./glossary` (912 dòng) vào
   * chunk của works, login và trang chủ — 22,9 kB gzip trên 9 route không hề
   * hiển thị glossary.
   *
   * Chỉ các trang Glossary mới được dùng barrel, vì chúng cần chính dữ liệu đó.
   * Nơi khác phải import thẳng module con (`@/constants/common`, `./game`...).
   */
  it('chỉ trang glossary được import barrel @/constants', () => {
    const root = join(__dirname, '..')
    const SEARCH_DIRS = ['components', 'hooks', 'pages', 'utils', 'models', 'api-client']
    const ALLOWED = ['pages/glossary.tsx', 'pages/glossary/muc-luc.tsx']

    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) {
          walk(full)
          continue
        }
        if (!/\.tsx?$/.test(entry) || /\.test\.tsx?$/.test(entry)) continue
        const rel = relative(root, full).split('\\').join('/')
        if (ALLOWED.includes(rel)) continue
        if (/from '@\/constants'/.test(readFileSync(full, 'utf8'))) offenders.push(rel)
      }
    }
    for (const dir of SEARCH_DIRS) walk(join(root, dir))

    expect(offenders).toEqual([])
  })

  /**
   * Cùng cơ chế, barrel khác. `hooks/index.ts` gom 11 hook, trong đó
   * useLoginFormShema kéo yup (43,9 kB gzip) và nhóm hook works kéo api-client →
   * axios (19,6 kB). Header gọi useAuth trên mọi trang, nên chỉ cần một import
   * `from '@/hooks'` ở đó là cả hai thứ nằm trong first-load của /blog,
   * /glossary, /system-design — những trang không hề gọi API.
   *
   * Cùng lý do với '@/components/layouts' (barrel kéo AdminLayout → useAuth) và
   * '@/components/common' (kéo header + auth).
   */
  it('không import qua các barrel nằm trên đường dẫn của mọi trang', () => {
    const root = join(__dirname, '..')
    const SEARCH_DIRS = ['components', 'hooks', 'pages', 'utils', 'models', 'api-client']
    const FORBIDDEN = [
      "from '@/hooks'",
      "from '@/components/layouts'",
      "from '@/components/common'",
      "from '../common'",
    ]

    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) {
          walk(full)
          continue
        }
        if (!/\.tsx?$/.test(entry) || /\.test\.tsx?$/.test(entry)) continue
        const source = readFileSync(full, 'utf8')
        const rel = relative(root, full).split('\\').join('/')
        for (const pattern of FORBIDDEN) {
          if (source.includes(pattern)) offenders.push(`${rel} → ${pattern}`)
        }
      }
    }
    for (const dir of SEARCH_DIRS) walk(join(root, dir))

    expect(offenders).toEqual([])
  })
})
