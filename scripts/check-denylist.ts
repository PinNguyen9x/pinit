// Quét content private theo `.denylist` trong PRIVATE_CONTENT_DIR.
//
//   npm run check:denylist
//   PRIVATE_CONTENT_DIR=/srv/pinit-private/content npm run check:denylist
//
// stdout chỉ gồm các dòng `file:line:từ-khóa` (để pipe/grep); mọi thông báo khác
// ra stderr. Exit code:
//   0  sạch
//   1  có chỗ khớp
//   2  lỗi cấu hình: chưa có/rỗng .denylist, không có thư mục content — KHÔNG phải pass
//
// Đừng chạy trên CI có log public: output in nguyên từ khóa, tức chính những tên
// nội bộ mà denylist được lập ra để giấu.
import { existsSync } from 'fs'
import { join } from 'path'
import {
  DENYLIST_FILE,
  listScanTargets,
  loadDenylist,
  scanFiles,
  SHORT_KEYWORD_MAX,
  shortKeywords,
} from '../utils/denylist'
import { contentDir } from '../utils/private-content'

async function main(): Promise<number> {
  const dir = contentDir()
  if (!existsSync(dir)) {
    console.error(`✗ không có thư mục content: ${dir}`)
    return 2
  }

  const denylist = await loadDenylist(dir)
  if (denylist.status !== 'ok') {
    const why = denylist.status === 'missing' ? 'chưa có denylist' : 'denylist rỗng'
    console.error(`✗ ${why}: ${join(dir, DENYLIST_FILE)} — chưa kiểm được, không coi là pass`)
    return 2
  }

  for (const kw of shortKeywords(denylist.keywords)) {
    console.error(`⚠ từ khóa "${kw}" chỉ ≤ ${SHORT_KEYWORD_MAX} ký tự — dễ khớp nhầm giữa từ`)
  }

  const files = await listScanTargets(dir)
  const matches = await scanFiles(files, denylist.keywords, dir)
  for (const m of matches) console.log(`${m.file}:${m.line}:${m.keyword}`)

  console.error(
    matches.length
      ? `✗ ${matches.length} chỗ khớp trong ${files.length} file`
      : `✓ sạch — ${files.length} file, ${denylist.keywords.length} từ khóa`,
  )
  return matches.length ? 1 : 0
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err)
    process.exit(2)
  },
)
