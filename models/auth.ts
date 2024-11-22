export interface LoginPayload {
  username: string
  password: string
}

export interface UserProfile {
  username: string
  email?: string
  city?: string
}
