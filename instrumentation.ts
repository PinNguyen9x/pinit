// Next gọi register() một lần khi server khởi động.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { ownerConfigProblem } = await import('./utils/owner-auth')
  const problem = ownerConfigProblem()
  if (problem) console.warn(`[me] ${problem} — khu /me tắt, mọi route trả 404.`)
}
