// Next gọi register() một lần khi server khởi động.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { ownerConfigProblem } = await import('./utils/owner-auth')
  const problem = ownerConfigProblem()
  if (problem) console.warn(`[me] ${problem} — khu /me tắt, mọi route trả 404.`)

  // Chỉ cảnh báo: key sai không tắt gì, nhưng phải lộ ra lúc deploy chứ không
  // đợi tới lúc bấm "Sinh câu hỏi".
  const { anthropicKeyProblem } = await import('./utils/practice-client')
  const keyProblem = anthropicKeyProblem()
  if (keyProblem) console.warn(`[practice] ${keyProblem}`)

  // Cấu hình Access nửa vời là ca im lặng nguy hiểm: owner tưởng /me đã có Access
  // che, thực tế middleware bỏ qua check. Tắt hẳn cả hai biến thì không log gì —
  // đó là trạng thái bình thường của local và staging.
  const { cfAccessProblem } = await import('./utils/cf-access')
  const cfProblem = cfAccessProblem()
  if (cfProblem) console.warn(`[cf-access] ${cfProblem}`)
}
