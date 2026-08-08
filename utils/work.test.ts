import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { Work, WorkStatus } from '../models/work'
import { getWorkGameSlug, getWorkHref } from './work'

/**
 * Chặn tái phát một lỗi đã xảy ra: link của work được tính bằng
 * `status === PUBLISHED && slug ? /works/{id}/{slug} : /works/{id}/details`,
 * chép ở 4 component (work-grid-card, work-mini-card, work-hero, work-item).
 *
 * Route `/works/{id}/{slug}` chỉ render game. Mà đúng 2 work `published` lại
 * là 2 game, nên click card là rơi thẳng vào game — trang case study
 * `works/[workId]/details.tsx` (1346 dòng, có TOC + markdown + mermaid) không
 * bao giờ hiện ra cho work đã publish.
 *
 * Lỗi sống sót vì logic bị chép nhiều nơi và một bản (work-item) viết inline
 * chứ không thành hàm `getWorkHref`, nên sửa theo tên hàm sẽ bỏ sót. Type-check,
 * lint và test đều xanh; chỉ đọc HTML prerender mới thấy.
 */

function makeWork(over: Partial<Work> = {}): Work {
  return {
    id: 'w1',
    title: 'T',
    tagList: [],
    shortDescription: '',
    fullDescription: '',
    createdAt: '0',
    updatedAt: '0',
    thumbnailUrl: '',
    status: WorkStatus.DRAFT,
    ...over,
  }
}

describe('getWorkHref', () => {
  it('work published có slug vẫn về trang case study, không vào game', () => {
    const work = makeWork({ status: WorkStatus.PUBLISHED, slug: 'game-tic-tac-toe' })
    expect(getWorkHref(work)).toBe('/works/w1/details')
  })

  it('work draft về trang case study', () => {
    expect(getWorkHref(makeWork())).toBe('/works/w1/details')
  })

  it('work published thiếu slug không sinh URL "undefined"', () => {
    const href = getWorkHref(makeWork({ status: WorkStatus.PUBLISHED }))
    expect(href).toBe('/works/w1/details')
    expect(href).not.toContain('undefined')
  })
})

describe('getWorkGameSlug', () => {
  it('trả slug cho work thực sự có game', () => {
    expect(getWorkGameSlug(makeWork({ slug: 'game-tic-tac-toe' }))).toBe('game-tic-tac-toe')
    expect(getWorkGameSlug(makeWork({ slug: 'game-color-matching' }))).toBe('game-color-matching')
  })

  it('trả null cho work không có game — route game không được là catch-all', () => {
    expect(getWorkGameSlug(makeWork({ slug: 'ai-chatbot' }))).toBeNull()
    expect(getWorkGameSlug(makeWork())).toBeNull()
  })
})

describe('không component nào tự dựng URL work nữa', () => {
  const dir = join(__dirname, '..', 'components', 'work')
  const files = readdirSync(dir).filter((f) => f.endsWith('.tsx'))

  it.each(files)('%s không so PUBLISHED để dựng link', (file) => {
    const src = readFileSync(join(dir, file), 'utf8')
    // Bắt cả hai dạng đã từng tồn tại: hàm getWorkHref cục bộ và biểu thức inline.
    const buildsUrl = /`\/works\/\$\{[^}]*\}\/\$\{[^}]*slug/.test(src)
    expect(buildsUrl).toBe(false)
  })
})
