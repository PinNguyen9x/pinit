export enum WorkStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}
export interface Work {
  id: string
  title: string
  tagList: string[]
  shortDescription: string
  fullDescription: string
  createdAt: string
  updatedAt: string
  thumbnailUrl: string
  status: WorkStatus
  slug?: string
  frontEndTagList?: string[]
  backEndTagList?: string[]
  dbTagList?: string[]
}
export interface WorkPayload extends Work {
  thumbnail: null | {
    file: File | null
    previewUrl: string
  }
}
export interface WorkFilterPayload {
  search: string
  tagList_like?: string
  selectedTagList?: string[]
}
