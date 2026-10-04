import { spawnSync } from 'child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join, resolve } from 'path'
import { afterAll, describe, expect, it } from 'vitest'

// Chạy thật script bằng bash với danh sách đường dẫn giả (định dạng `tar -t` của
// `docker export`: không có `/` đầu). Phần docker create/export thì CI chạy thật.
const SCRIPT = resolve(__dirname, '../scripts/check-image-private.sh')
const dir = mkdtempSync(join(tmpdir(), 'pinit-image-'))
afterAll(() => rmSync(dir, { recursive: true, force: true }))

function check(paths: string[]) {
  const file = join(dir, `listing-${Math.random()}.txt`)
  writeFileSync(file, paths.join('\n') + '\n')
  const r = spawnSync('bash', [SCRIPT, '--listing', file], { encoding: 'utf8' })
  return { code: r.status, err: r.stderr }
}

const CLEAN = [
  'app/',
  'app/server.js',
  'app/.next/server/pages/me.js',
  'app/node_modules/next/package.json',
  // Bộ mẫu không phải content thật, và tên khác — không được khớp nhầm.
  'app/private-content.example/README.md',
  'app/utils/private-content-schema.js',
]

describe('check-image-private.sh', () => {
  it('image sạch → exit 0', () => {
    const r = check(CLEAN)
    expect(r.code).toBe(0)
    expect(r.err).toContain('image sạch')
  })

  it.each([
    'app/private-content/',
    'app/private-content/learn/k8s/index.md',
    'private-content/roadmap.yaml',
    'app/.denylist',
    'app/private-content.example/.denylist',
    'app/practice-data/practice-log.jsonl',
  ])('có %s → exit 1, in đường dẫn vi phạm', (bad) => {
    const r = check([...CLEAN, bad])
    expect(r.code).toBe(1)
    expect(r.err).toContain(bad)
  })

  it('dùng sai → exit 2', () => {
    expect(spawnSync('bash', [SCRIPT], { encoding: 'utf8' }).status).toBe(2)
    expect(spawnSync('bash', [SCRIPT, '--listing', join(dir, 'khong-co')]).status).toBe(2)
  })
})
