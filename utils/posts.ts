import { Post } from '@/models'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
const BLOG_FOLDER = path.join(process.cwd(), 'blog')

export function getReadingMinutes(content: string): number {
  if (!content) return 1
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export async function getPostList() {
  // read all markdown files
  const fileNameList = fs.readdirSync(BLOG_FOLDER)
  const postList: Post[] = []
  for (const fileName of fileNameList) {
    const filePath = path.join(BLOG_FOLDER, fileName)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { content, data, excerpt } = matter(fileContent, {
      excerpt_separator: '<!-- truncate-->',
    })
    postList.push({
      id: fileName,
      slug: data.slug,
      title: data.title,
      thumbnailUrl: data.image || '',
      author: {
        name: data.author,
        avatarUrl: data.author_image_url || '',
        profileUrl: data.author_url || '',
        title: data.author_title || '',
      },
      tagList: data.tags,
      publishedDate: data.date,
      description: excerpt || '',
      readingMinutes: getReadingMinutes(content),
      mdContent: content,
      htmlContent: '',
    })
  }
  return postList.sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime(),
  )
}
