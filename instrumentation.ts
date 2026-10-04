// Next gọi register() một lần khi server khởi động.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { getOwnerConfig } = await import('./utils/owner-auth')
  if (!getOwnerConfig()) {
    console.warn(
      '[me] OWNER_PASSWORD_HASH hoặc SESSION_SECRET (≥ 32 ký tự) chưa đặt — khu /me tắt, mọi route trả 404.'
    )
  }
}
