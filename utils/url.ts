export const encodeUrl = (path: string): string => {
  console.log('path', path)
  return encodeURIComponent(window.btoa(path))
}
export const decodeUrl = (path: string): string => {
  return window.atob(decodeURIComponent(path))
}
