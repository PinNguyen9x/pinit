import { spawnSync } from 'child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join, resolve } from 'path'
import { afterAll, describe, expect, it } from 'vitest'
import {
  checkCaseStudy,
  listScanTargets,
  loadDenylist,
  parseDenylist,
  scanFiles,
  scanText,
  shortKeywords,
} from './denylist'

const ROOT = resolve(__dirname, '..')
const dirs: string[] = []
afterAll(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })))

/** Dựng một thư mục content tạm từ map path → nội dung. */
function fixture(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'pinit-denylist-'))
  dirs.push(dir)
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(dir, path, '..'), { recursive: true })
    writeFileSync(join(dir, path), text)
  }
  return dir
}

describe('parseDenylist', () => {
  it('bỏ dòng trống, comment #, khoảng trắng; gộp trùng không phân biệt hoa thường', () => {
    expect(parseDenylist('# comment\n\n  Acme  \nacme\r\nProject X\n   \n#Không\n')).toEqual([
      'Acme',
      'Project X',
    ])
  })

  it('chuẩn hoá NFC — bản NFD và NFC của cùng một chữ là một từ khóa', () => {
    const nfd = 'Việt'.normalize('NFD')
    expect(parseDenylist(`${nfd}\nViệt`)).toEqual(['Việt'])
  })
})

describe('scanText', () => {
  it('không phân biệt hoa thường, báo đúng dòng, nhiều từ khóa trên một dòng', () => {
    const text = 'dòng một\nGặp ACME và project x\r\nsạch'
    expect(scanText(text, ['acme', 'Project X'], 'f.md')).toEqual([
      { file: 'f.md', line: 2, keyword: 'acme' },
      { file: 'f.md', line: 2, keyword: 'Project X' },
    ])
  })

  it.each(['c++', 'a.b*', '(x)', '[ok]', '\\d+', '$HOME', '^start'])(
    'từ khóa %s được so nghĩa đen, không thành regex',
    (kw) => {
      expect(scanText(`trước ${kw} sau`, [kw], 'f')).toHaveLength(1)
      // Nếu bị hiểu là regex thì những chuỗi này sẽ khớp (hoặc ném lỗi).
      expect(scanText('cc abxb x d1 HOME start', [kw], 'f')).toHaveLength(0)
    },
  )

  it('nội dung NFD vẫn khớp từ khóa NFC (file soạn trên macOS)', () => {
    const content = 'Công ty Nguyễn'.normalize('NFD')
    expect(scanText(content, ['nguyễn'], 'f')).toHaveLength(1)
  })
})

describe('shortKeywords', () => {
  it('cảnh báo từ khóa ≤ 3 ký tự, đếm theo code point', () => {
    expect(shortKeywords(['ab', 'abc', 'abcd', 'ệệệ', '😀😀😀😀'])).toEqual(['ab', 'abc', 'ệệệ'])
  })
})

describe('loadDenylist', () => {
  it('thiếu file → missing, chỉ có comment → empty — không phải pass', async () => {
    expect(await loadDenylist(fixture({}))).toEqual({ status: 'missing' })
    expect(await loadDenylist(fixture({ '.denylist': '# chỉ comment\n\n' }))).toEqual({
      status: 'empty',
    })
  })
})

describe('listScanTargets + scanFiles', () => {
  it('quét roadmap.yaml, learn/** đệ quy, case-studies và posts; bỏ file ẩn và file không phải .md', async () => {
    const dir = fixture({
      'roadmap.yaml': 'milestones:\n  - title: Acme migration\n',
      'learn/k8s/index.md': 'sạch',
      'learn/k8s/deep/nested.md': 'dòng 1\nACME ở đây',
      'learn/k8s/diagram.png': 'acme',
      'learn/.draft.md': 'acme',
      'case-studies/x.md': 'acme',
      'posts/bai-viet.md': 'acme trong bài private',
      'practice-log.jsonl': 'acme',
      '.denylist': 'acme',
    })
    const files = await listScanTargets(dir)
    expect(files).toEqual([
      'roadmap.yaml',
      'learn/k8s/deep/nested.md',
      'learn/k8s/index.md',
      'case-studies/x.md',
      'posts/bai-viet.md',
    ])
    const matches = await scanFiles(files, ['acme'], dir)
    expect(matches.map((m) => `${m.file}:${m.line}`)).toEqual([
      'roadmap.yaml:2',
      'learn/k8s/deep/nested.md:2',
      'case-studies/x.md:1',
      'posts/bai-viet.md:1',
    ])
  })

  // Hồi quy cho đúng cái lỗ đã gặp lúc thêm posts/: content type mới không được
  // thêm vào listScanTargets thì nó lách denylist, mà script vẫn exit 0.
  it('bài trong posts/ KHÔNG được lách denylist', async () => {
    const dir = fixture({ 'posts/co-ten-noi-bo.md': 'dòng 1\nAcme Corp ở dòng 2' })
    const files = await listScanTargets(dir)
    expect(files).toContain('posts/co-ten-noi-bo.md')
    const matches = await scanFiles(files, ['acme corp'], dir)
    expect(matches.map((m) => `${m.file}:${m.line}`)).toEqual(['posts/co-ten-noi-bo.md:2'])
  })
})

describe('checkCaseStudy', () => {
  it('not-found / missing / empty / clean / matches', async () => {
    const base = { 'case-studies/a.md': 'Acme\nsạch' }
    expect((await checkCaseStudy('khong-co', fixture(base))).status).toBe('not-found')
    expect((await checkCaseStudy('a', fixture(base))).status).toBe('missing-denylist')
    expect((await checkCaseStudy('a', fixture({ ...base, '.denylist': '#' }))).status).toBe(
      'empty-denylist',
    )
    expect(await checkCaseStudy('a', fixture({ ...base, '.denylist': 'beta' }))).toEqual({
      status: 'clean',
      matches: [],
    })
    expect(await checkCaseStudy('a', fixture({ ...base, '.denylist': 'acme' }))).toEqual({
      status: 'matches',
      matches: [{ file: 'case-studies/a.md', line: 1, keyword: 'acme' }],
    })
  })
})

describe('npm run check:denylist (chạy thật qua tsx)', () => {
  function run(dir: string) {
    const r = spawnSync(join(ROOT, 'node_modules/.bin/tsx'), ['scripts/check-denylist.ts'], {
      cwd: ROOT,
      env: { ...process.env, PRIVATE_CONTENT_DIR: dir },
      encoding: 'utf8',
    })
    return { code: r.status, out: r.stdout, err: r.stderr }
  }

  it('exit 2 khi chưa có denylist, báo rõ', () => {
    const r = run(fixture({ 'learn/a/index.md': 'acme' }))
    expect(r.code).toBe(2)
    expect(r.err).toContain('chưa có denylist')
    expect(r.out).toBe('')
  })

  it('exit 2 khi denylist rỗng hoặc thư mục content không tồn tại', () => {
    expect(run(fixture({ '.denylist': '\n# x\n' })).code).toBe(2)
    expect(run(join(tmpdir(), 'pinit-khong-co-' + Date.now())).code).toBe(2)
  })

  it('exit 1 và in file:line:từ-khóa khi có khớp; cảnh báo từ khóa ngắn', () => {
    const r = run(
      fixture({
        '.denylist': 'Acme\nab\n',
        'roadmap.yaml': 'x\nacme corp',
        'case-studies/c.md': 'ABBA',
      }),
    )
    expect(r.code).toBe(1)
    expect(r.out.trim().split('\n')).toEqual(['roadmap.yaml:2:Acme', 'case-studies/c.md:1:ab'])
    expect(r.err).toContain('từ khóa "ab"')
  })

  it('exit 0 khi sạch', () => {
    const r = run(fixture({ '.denylist': 'acme', 'learn/a/index.md': 'sạch' }))
    expect(r.code).toBe(0)
    expect(r.err).toContain('sạch')
  })

  it('bộ mẫu trong repo + denylist.example → bắt được chỗ cố tình để lại', () => {
    const dir = fixture({})
    rmSync(dir, { recursive: true })
    spawnSync('cp', ['-R', join(ROOT, 'private-content.example'), dir])
    spawnSync('cp', [join(dir, 'denylist.example'), join(dir, '.denylist')])
    const r = run(dir)
    expect(r.code).toBe(1)
    expect(r.out).toContain('case-studies/public-candidate-example.md:')
    expect(r.out).toContain(':Project Falcon')
  })
})
