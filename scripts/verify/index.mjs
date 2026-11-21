// `npm run verify` — chạy app thật rồi chứng minh từng route trong
// docs/feature-map.md còn hoạt động.
//
// Vì sao build rồi start, không dùng `next dev`: dev server của repo này compile
// 48–50s mỗi route và tự restart khi chạm ngưỡng RAM, request bị timeout. Bản
// production trả lời dưới 10ms. Đo bằng dev là đo sai thứ, và chậm hơn.
//
// Dùng:
//   npm run verify                       # 32 route, viewport desktop
//   npm run verify -- --route /glossary  # một route
//   npm run verify -- --mobile           # viewport điện thoại
//   npm run verify -- --both             # cả hai viewport
//   npm run verify -- --no-build         # dùng .next đã có (nhanh, dễ sai)
//   npm run verify -- --keep             # giữ server chạy sau khi xong
//
// Kết quả: .verify-out/ — screenshot từng route, result.json, summary.md.
// Exit code 0 = mọi route đạt; khác 0 = có route hỏng.
import { spawn } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { API_CHECKS, ROUTES } from './routes.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '../..')
const FIXTURE_ENV = join(HERE, 'fixture.env')
const OUT = join(REPO, '.verify-out')

const PASSPHRASE = 'pinit-verify-fixture'

// Cổng riêng, không phải 3000: 3000 hay bị `npm run dev` của phiên khác giữ, và
// một verify vô tình bắn vào server khác là kết quả sai mà trông như thật.
const APP_PORT = 4318

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
}

// ---------- tham số ----------

function parseArgs(argv) {
  const opts = { route: null, viewports: ['desktop'], build: true, keep: false }
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--route') opts.route = argv[++i]
    else if (a.startsWith('--route=')) opts.route = a.slice(8)
    else if (a === '--mobile') opts.viewports = ['mobile']
    else if (a === '--both') opts.viewports = ['desktop', 'mobile']
    else if (a === '--no-build') opts.build = false
    else if (a === '--keep') opts.keep = true
    else if (a === '--help' || a === '-h') opts.help = true
    else {
      console.error(`verify: tham số lạ "${a}". Xem --help.`)
      process.exit(2)
    }
  }
  return opts
}

// ---------- env fixture ----------

/**
 * Parse dotenv tối giản: `KEY=value`, bỏ comment và dòng rỗng, bỏ một lớp nháy
 * bọc ngoài. Không hỗ trợ nội suy `${...}` — cố ý: fixture phải là giá trị
 * tường minh, không phải thứ đổi theo env của máy đang chạy.
 */
function parseEnvFile(raw) {
  const out = {}
  for (const line of raw.split('\n')) {
    const s = line.trim()
    if (!s || s.startsWith('#')) continue
    const eq = s.indexOf('=')
    if (eq < 0) continue
    const key = s.slice(0, eq).trim()
    let value = s.slice(eq + 1).trim()
    if (
      value.length >= 2 &&
      ((value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"')))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

/**
 * Chặn cứng: verify gọi /me/practice thật, nên nếu ANTHROPIC_BASE_URL không trỏ
 * về loopback thì mỗi lần chạy là một lần gọi model thật — tốn tiền, và kết quả
 * phụ thuộc model nên hai lần chạy không còn so được với nhau. Dừng hẳn, không
 * cảnh báo rồi chạy tiếp.
 */
function assertMockOnly(env) {
  const raw = env.ANTHROPIC_BASE_URL
  if (!raw) {
    fail(
      'fixture.env thiếu ANTHROPIC_BASE_URL. Verify từ chối chạy: thiếu biến này thì SDK\n' +
        'gọi thẳng api.anthropic.com.',
    )
  }
  let url
  try {
    url = new URL(raw)
  } catch {
    fail(`ANTHROPIC_BASE_URL không phải URL hợp lệ: ${raw}`)
  }
  if (!['127.0.0.1', 'localhost', '::1', '[::1]'].includes(url.hostname)) {
    fail(
      `ANTHROPIC_BASE_URL phải trỏ về loopback, đang là "${url.hostname}".\n` +
        'Verify từ chối chạy để không gọi model thật.',
    )
  }
  return Number(url.port || 80)
}

function fail(message) {
  console.error(`\nverify: ${message}\n`)
  process.exit(2)
}

// ---------- tiến trình con ----------

function portFree(port) {
  return new Promise((res) => {
    const s = createServer()
    s.once('error', () => res(false))
    s.once('listening', () => s.close(() => res(true)))
    s.listen(port, '127.0.0.1')
  })
}

function run(cmd, args, env, label) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { cwd: REPO, env, stdio: ['ignore', 'pipe', 'pipe'] })
    let log = ''
    p.stdout.on('data', (d) => (log += d))
    p.stderr.on('data', (d) => (log += d))
    p.on('close', (code) => (code === 0 ? res(log) : rej(new Error(`${label} thoát ${code}\n${log}`))))
  })
}

/** Khởi động `next start`, trả handle + log đã bắt được lúc boot. */
async function startApp(env) {
  const child = spawn('npx', ['next', 'start', '--port', String(APP_PORT)], {
    cwd: REPO,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let log = ''
  child.stdout.on('data', (d) => (log += d))
  child.stderr.on('data', (d) => (log += d))

  const deadline = Date.now() + 90_000
  for (;;) {
    if (child.exitCode !== null) throw new Error(`next start chết khi khởi động:\n${log}`)
    try {
      const r = await fetch(`http://127.0.0.1:${APP_PORT}/api/me/logout`, { method: 'POST' })
      if (r.status) break
    } catch {
      /* chưa lên */
    }
    if (Date.now() > deadline) throw new Error(`next start không lên trong 90s:\n${log}`)
    await new Promise((r) => setTimeout(r, 400))
  }
  return { child, bootLog: () => log }
}

function startMock(port) {
  const child = spawn('node', [join(HERE, 'anthropic-mock.mjs'), String(port)], {
    cwd: REPO,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let log = ''
  child.stdout.on('data', (d) => (log += d))
  child.stderr.on('data', (d) => (log += d))
  return { child, log: () => log }
}

function stop(handle) {
  if (handle?.child && handle.child.exitCode === null) handle.child.kill('SIGTERM')
}

// ---------- kiểm nội dung ----------

/**
 * Đếm không phân biệt hoa thường: UI hiện `title` trong frontmatter
 * ("Kubernetes") còn routes.mjs nhắc tới slug ("kubernetes"). Phân biệt hoa
 * thường ở đây chỉ sinh ra ca đỏ giả, không bắt được lỗi nào.
 */
async function countText(page, needle) {
  const body = (await page.evaluate(() => document.body?.innerText ?? '')).toLowerCase()
  const want = needle.toLowerCase()
  let n = 0
  let i = body.indexOf(want)
  while (i !== -1) {
    n += 1
    i = body.indexOf(want, i + want.length)
  }
  return n
}

async function checkExpectations(page, expectations) {
  const problems = []
  for (const e of expectations ?? []) {
    if (e.selector) {
      const n = await page.locator(e.selector).count()
      if (e.count !== undefined && n !== e.count) {
        problems.push(`"${e.selector}": cần đúng ${e.count}, có ${n}`)
      } else if (e.min !== undefined && n < e.min) {
        problems.push(`"${e.selector}": cần >= ${e.min}, có ${n}`)
      }
    } else if (e.text !== undefined) {
      const n = await countText(page, e.text)
      if (e.count !== undefined && n !== e.count) {
        problems.push(`chuỗi "${e.text}": cần đúng ${e.count} lần, có ${n}`)
      } else if (e.count === undefined && n === 0) {
        problems.push(`thiếu chuỗi "${e.text}"`)
      }
    } else if (e.missing !== undefined) {
      if ((await countText(page, e.missing)) > 0) {
        problems.push(`không được có chuỗi "${e.missing}"`)
      }
    }
  }
  return problems
}

// ---------- tiếng ồn được bỏ qua ----------

/**
 * Console error được phép bỏ qua. Mỗi dòng ở đây là một khoảng mù mà verify
 * không còn bắt được — nên phải kèm lý do, và danh sách phải ngắn.
 * Thêm dòng mới thì tự hỏi: đây là tiếng ồn thật, hay là bug mình đang che?
 */
const CONSOLE_IGNORE = [
  {
    why: '`useAuth` trong _app dò trạng thái đăng nhập ở MỌI trang. 401 là câu trả lời đúng cho khách ẩn danh, không phải lỗi.',
    test: (text, url) => url.endsWith('/api/profile') && text.includes('401'),
  },
]

/** Lọc console error, trả cả phần bị bỏ qua để báo cáo còn đếm được. */
function filterConsole(entries, pageUrl, expectedStatus, tolerate = []) {
  const kept = []
  const ignored = []
  for (const e of entries) {
    const at = e.lastIndexOf(' @ ')
    const text = at < 0 ? e : e.slice(0, at)
    const url = at < 0 ? '' : e.slice(at + 3)

    // Route mà 404 LÀ kỳ vọng: chính response 404 của trang đó hiện ra dưới
    // dạng console error. Bỏ qua đúng response của trang, không bỏ qua 404 khác.
    const ownNotFound =
      expectedStatus === 404 && text.includes('404') && url.split('?')[0] === pageUrl.split('?')[0]

    const rule = CONSOLE_IGNORE.find((r) => r.test(text, url))
    // `tolerate` của riêng route: hẹp hơn CONSOLE_IGNORE, chỉ đúng endpoint mà
    // route đó khai. Cố ý không nới theo `external` — `external` nói về mã HTTP
    // của trang, không cho phép bỏ qua mọi tiếng ồn trên trang đó.
    const tolerated = tolerate.some((t) => t.pattern.test(e))
    if (rule || ownNotFound || tolerated) ignored.push(e)
    else kept.push(e)
  }
  return { kept, ignored }
}

// ---------- một route ----------

function slug(path) {
  return (path.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '') || 'root').slice(0, 80)
}

async function visit(context, route, viewport) {
  const page = await context.newPage()
  await page.setViewportSize(VIEWPORTS[viewport])

  const consoleErrors = []
  const serverErrors = []
  const pageErrors = []

  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const where = m.location()?.url ?? ''
    consoleErrors.push(`${m.text().slice(0, 200)} @ ${where.slice(0, 160)}`)
  })
  page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 300)))
  page.on('response', (r) => {
    if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.url().slice(0, 160)}`)
  })

  const url = `http://127.0.0.1:${APP_PORT}${route.path}`
  let problems = []
  let status = null

  try {
    const res = await page.goto(url, { waitUntil: 'load', timeout: 45_000 })
    status = res?.status() ?? null

    // Deeplink đọc hash lúc mount, và trang nào cũng có phần hydrate — chờ
    // network lặng trước khi đọc DOM, nếu không là đo HTML trước hydrate.
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})

    if (route.redirectTo) {
      const landed = new URL(page.url()).pathname
      if (landed !== route.redirectTo) {
        problems.push(`cần chuyển sang ${route.redirectTo}, đang ở ${landed}`)
      }
    } else if (route.external) {
      // Dữ liệu ngoài repo: chỉ đòi không 5xx. Xem docs/feature-map.md.
      if (status >= 500) problems.push(`status ${status}`)
    } else {
      const want = route.status ?? 200
      if (status !== want) problems.push(`status ${status}, cần ${want}`)
    }

    if (status !== 404 && !route.redirectTo) {
      problems.push(...(await checkExpectations(page, route.expect)))
    }
  } catch (err) {
    problems.push(`mở trang lỗi: ${String(err.message).split('\n')[0]}`)
  }

  const shot = join(OUT, `${viewport}--${slug(route.path)}.png`)
  await page.screenshot({ path: shot, fullPage: true }).catch(() => {})

  const console_ = filterConsole(consoleErrors, url, route.status ?? 200, route.tolerate)
  if (serverErrors.length) problems.push(`response 5xx: ${serverErrors.join(', ')}`)
  if (console_.kept.length) problems.push(`console error: ${console_.kept.join(' | ')}`)
  if (pageErrors.length) problems.push(`lỗi JS: ${pageErrors.join(' | ')}`)

  // Lỗi đã biết, đã có work item: không làm verify đỏ, nhưng KHÔNG mất tăm —
  // báo cáo liệt kê riêng. Im lặng bỏ qua thì lần sau không ai nhớ nó còn đó.
  const known = []
  if (route.knownIssue) {
    const hit = problems.filter((p) => route.knownIssue.pattern.test(p))
    if (hit.length) {
      for (const h of hit) known.push(`${route.knownIssue.ref}: ${h}`)
      problems = problems.filter((p) => !route.knownIssue.pattern.test(p))
    }
  }

  await page.close()
  return {
    path: route.path,
    name: route.name ?? route.path,
    auth: route.auth,
    viewport,
    status,
    ok: problems.length === 0,
    problems,
    known,
    ignoredConsole: console_.ignored.length,
    screenshot: shot.slice(REPO.length + 1),
  }
}

// ---------- đăng nhập ----------

/**
 * Đăng nhập qua form thật một lần rồi dùng lại cookie — vừa kiểm được form,
 * vừa không tốn một lần bcrypt cho mỗi route.
 */
async function loginOnce(browser) {
  const context = await browser.newContext({ viewport: VIEWPORTS.desktop })
  const page = await context.newPage()
  await page.goto(`http://127.0.0.1:${APP_PORT}/me/login`, { waitUntil: 'load' })

  const field = page.locator('input[type="password"]')
  if ((await field.count()) !== 1) {
    const body = (await page.evaluate(() => document.body?.innerText ?? '')).slice(0, 200)
    throw new Error(
      `/me/login không có ô passphrase (status trang có thể là 404).\n` +
        `Thiếu OWNER_PASSWORD_HASH hoặc SESSION_SECRET thì MỌI route /me trả 404, kể cả trang login.\n` +
        `Nội dung trang: ${body}`,
    )
  }
  await field.fill(PASSPHRASE)
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith('/me/login'), { timeout: 20_000 }),
    page.locator('button[type="submit"]').click(),
  ])
  const state = await context.storageState()
  await context.close()
  return state
}

// ---------- kiểm API ----------

async function runApiChecks(cookieHeader) {
  const results = []
  for (const c of API_CHECKS) {
    const problems = []
    let status = null
    let json = null
    try {
      const r = await fetch(`http://127.0.0.1:${APP_PORT}${c.path}`, {
        method: c.method,
        headers: { 'content-type': 'application/json', cookie: cookieHeader },
        body: JSON.stringify(c.body),
      })
      status = r.status
      json = await r.json().catch(() => null)
      if (status !== c.status) problems.push(`status ${status}, cần ${c.status}`)
      if (status === c.status && c.expectJson && json) {
        const bad = c.expectJson(json)
        if (bad) problems.push(bad)
      }
    } catch (err) {
      problems.push(`gọi lỗi: ${String(err.message).split('\n')[0]}`)
    }
    results.push({ name: c.name, status, ok: problems.length === 0, problems })
  }
  return results
}

// ---------- main ----------

const HELP = `npm run verify [-- tham số]

  --route <path>   chỉ chạy một route (vd --route /glossary)
  --mobile         viewport điện thoại 390x844 thay vì desktop 1440x900
  --both           chạy cả hai viewport
  --no-build       dùng .next đã có, không build lại
  --keep           giữ server chạy sau khi xong
  -h, --help       bản này

Kết quả vào .verify-out/. Exit 0 = mọi route đạt.
`

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.help) {
    process.stdout.write(HELP)
    return 0
  }

  const fixture = parseEnvFile(await readFile(FIXTURE_ENV, 'utf8'))
  const mockPort = assertMockOnly(fixture)

  // Key giả, dựng lúc chạy. `getAnthropic()` trả null nếu biến rỗng, và
  // `anthropicKeyProblem()` cảnh báo nếu không bắt đầu bằng 'sk-ant-' hoặc
  // ngắn hơn 40 ký tự. Ghép từng mảnh để repo không chứa chuỗi nào có dạng
  // key thật — push protection của GitHub chặn đúng loại chuỗi đó.
  const fakeKey = ['sk', 'ant', 'verify', 'mock', 'khong-phai-key-that-0000000000'].join('-')

  const env = {
    ...process.env,
    ...fixture,
    ANTHROPIC_API_KEY: fakeKey,
    PORT: String(APP_PORT),
    NODE_ENV: 'production',
  }

  for (const port of [APP_PORT, mockPort]) {
    if (!(await portFree(port))) {
      fail(`cổng ${port} đang bị giữ. Giải phóng: lsof -ti:${port} | xargs kill -9`)
    }
  }

  await rm(OUT, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })

  const selected = opts.route ? ROUTES.filter((r) => r.path === opts.route) : ROUTES
  if (!selected.length) {
    fail(
      `không có route "${opts.route}" trong scripts/verify/routes.mjs.\n` +
        `Thêm route mới vào pages/ thì phải thêm vào routes.mjs và docs/feature-map.md.`,
    )
  }

  let mock = null
  let app = null
  const t0 = Date.now()

  try {
    mock = startMock(mockPort)
    process.stdout.write(`[verify] mock Anthropic: 127.0.0.1:${mockPort}\n`)

    if (opts.build) {
      process.stdout.write('[verify] next build…\n')
      await run('npx', ['next', 'build'], env, 'next build')
    } else {
      process.stdout.write('[verify] bỏ qua build (--no-build)\n')
    }

    process.stdout.write(`[verify] next start trên cổng ${APP_PORT}…\n`)
    app = await startApp(env)

    // Lớp Cloudflare Access nửa vời không làm request lỗi ngay — nó chỉ im lặng
    // bị bỏ qua, và cảnh báo duy nhất nằm trong log khởi động.
    const boot = app.bootLog()
    const bootWarnings = boot
      .split('\n')
      .filter((l) => /BỊ BỎ QUA|không giống key thật|chưa đặt/i.test(l))
      .map((l) => l.trim())

    const browser = await chromium.launch({ headless: true })
    const needsOwner = selected.some((r) => r.auth === 'owner')
    let state = null
    let cookieHeader = ''
    if (needsOwner) {
      process.stdout.write('[verify] đăng nhập /me…\n')
      state = await loginOnce(browser)
      cookieHeader = (state.cookies ?? []).map((c) => `${c.name}=${c.value}`).join('; ')
    }

    const results = []
    for (const viewport of opts.viewports) {
      const anon = await browser.newContext({ viewport: VIEWPORTS[viewport] })
      const owner = state
        ? await browser.newContext({ viewport: VIEWPORTS[viewport], storageState: state })
        : null
      for (const route of selected) {
        const ctx = route.auth === 'owner' ? owner : anon
        const r = await visit(ctx, route, viewport)
        results.push(r)
        process.stdout.write(
          `  ${r.ok ? '✓' : '✗'} ${viewport.padEnd(7)} ${r.path}${r.ok ? '' : `\n      ${r.problems.join('\n      ')}`}\n`,
        )
      }
      await anon.close()
      if (owner) await owner.close()
    }

    const apiResults = needsOwner && !opts.route ? await runApiChecks(cookieHeader) : []
    for (const a of apiResults) {
      process.stdout.write(
        `  ${a.ok ? '✓' : '✗'} api     ${a.name}${a.ok ? '' : `\n      ${a.problems.join('\n      ')}`}\n`,
      )
    }

    const mockCalls = await fetch(`http://127.0.0.1:${mockPort}/__mock/health`)
      .then((r) => r.json())
      .then((j) => j.calls)
      .catch(() => null)

    await browser.close()

    const failed = [...results, ...apiResults].filter((r) => !r.ok)
    const report = {
      at: new Date().toISOString(),
      seconds: Math.round((Date.now() - t0) / 1000),
      viewports: opts.viewports,
      route: opts.route,
      total: results.length + apiResults.length,
      failed: failed.length,
      ignoredConsole: results.reduce((n, r) => n + (r.ignoredConsole ?? 0), 0),
      knownIssues: results.reduce((n, r) => n + r.known.length, 0),
      mockAnthropicCalls: mockCalls,
      bootWarnings,
      routes: results,
      api: apiResults,
    }
    await writeFile(join(OUT, 'result.json'), JSON.stringify(report, null, 2))
    await writeFile(join(OUT, 'summary.md'), summarize(report))

    process.stdout.write(
      `\n[verify] ${report.total - report.failed}/${report.total} đạt trong ${report.seconds}s` +
        ` · mock Anthropic nhận ${mockCalls ?? '?'} lời gọi` +
        ` · bỏ qua ${report.ignoredConsole} console error` +
        (report.knownIssues ? ` · ${report.knownIssues} lỗi đã biết` : '') +
        '\n',
    )
    if (bootWarnings.length) {
      process.stdout.write(`[verify] cảnh báo lúc khởi động:\n  ${bootWarnings.join('\n  ')}\n`)
    }
    process.stdout.write(`[verify] .verify-out/summary.md\n`)

    if (opts.keep) {
      process.stdout.write(`[verify] --keep: server còn ở http://127.0.0.1:${APP_PORT}, Ctrl-C để dừng\n`)
      await new Promise(() => {})
    }
    return failed.length === 0 ? 0 : 1
  } finally {
    if (!opts.keep) {
      stop(app)
      stop(mock)
    }
  }
}

function summarize(report) {
  const rows = report.routes
    .map(
      (r) =>
        `| ${r.ok ? '✓' : '✗'} | ${r.viewport} | \`${r.path}\` | ${r.status ?? '—'} | ${
          r.problems.join('; ') || '' // ok thì để trống
        } |`,
    )
    .join('\n')
  const api = report.api.length
    ? '\n## Lời gọi API\n\n| | Kiểm | Status | Vấn đề |\n|---|---|---|---|\n' +
      report.api
        .map((a) => `| ${a.ok ? '✓' : '✗'} | ${a.name} | ${a.status ?? '—'} | ${a.problems.join('; ')} |`)
        .join('\n') +
      '\n'
    : ''
  const warn = report.bootWarnings.length
    ? `\n## Cảnh báo lúc khởi động\n\n${report.bootWarnings.map((w) => `- ${w}`).join('\n')}\n`
    : ''
  // Lỗi đã biết không làm verify đỏ, nhưng phải hiện ra ở đây mỗi lần chạy —
  // nếu không thì "đã biết" biến thành "đã quên".
  const knownRows = report.routes.flatMap((r) => r.known.map((k) => `- \`${r.path}\` — ${k}`))
  const known = knownRows.length
    ? `\n## Lỗi đã biết, đã có work item\n\n${knownRows.join('\n')}\n`
    : ''
  const ignored = report.ignoredConsole
    ? `\n_Đã bỏ qua ${report.ignoredConsole} console error theo allowlist trong ` +
      `\`scripts/verify/index.mjs\` và \`tolerate\` của từng route._\n`
    : ''
  return `# Kết quả verify

- Lúc: ${report.at}
- Mất: ${report.seconds}s
- Viewport: ${report.viewports.join(', ')}
- Đạt: **${report.total - report.failed}/${report.total}**
- Mock Anthropic nhận: **${report.mockAnthropicCalls ?? '?'}** lời gọi (số này > 0 là bằng chứng
  lời gọi model đã đi vào stub cục bộ, không ra Internet)

| | Viewport | Route | Status | Vấn đề |
|---|---|---|---|---|
${rows}
${api}${known}${warn}${ignored}
Screenshot từng route nằm cùng thư mục này.
`
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(`\nverify: ${err.message}\n`)
    process.exit(2)
  })
