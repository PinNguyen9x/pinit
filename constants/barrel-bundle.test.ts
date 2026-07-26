import { readFileSync } from 'fs'
import { join } from 'path'
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
})
