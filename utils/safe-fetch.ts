// Used by getStaticPaths / getStaticProps so a slow or unreachable backend
// during `next build` doesn't crash the build. Returns null on any failure;
// callers decide whether to skip pre-rendering or return notFound.
export async function safeFetchJson<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch (error) {
    console.warn(`[safeFetchJson] ${url} → ${(error as Error).message}`)
    return null
  } finally {
    clearTimeout(timer)
  }
}

export const API_BASE = process.env.API_URL ?? 'https://json-server-blog.vercel.app'
