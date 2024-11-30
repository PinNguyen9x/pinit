export const encodeUrl = (path: string): string => {
  return encodeURIComponent(window.btoa(path))
}
export const decodeUrl = (path: string): string => {
  return window.atob(decodeURIComponent(path))
}
