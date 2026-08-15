// KHÔNG export file này từ constants/index.ts — barrel đó nằm trong chuỗi phụ
// thuộc của `_app`, xem constants/barrel-bundle.test.ts. Import trực tiếp
// '@/constants/tracks'.

export interface KnowledgeTrack {
  key: string
  title: string
  blurb: string
  /** Bài thuộc track nếu có ÍT NHẤT MỘT tag nằm trong danh sách này (không phân biệt hoa thường). */
  tags: string[]
  /** Tag dùng để lọc khi bấm vào track — phải là tag có thật trong blog. */
  filterTag: string
}

export const KNOWLEDGE_TRACKS: KnowledgeTrack[] = [
  {
    key: 'ai-agents',
    title: 'AI & Claude Code',
    blurb: 'Slash command, memory, skills, subagent, MCP, hook — và cách điều phối nhiều agent chạy song song.',
    tags: ['AI', 'Claude', 'DevTools', 'Agents', 'claude-code', 'LLM', 'Chatbot'],
    filterTag: 'Claude',
  },
  {
    key: 'devops',
    title: 'DevOps: CI/CD → GitOps',
    blurb: 'Từ git push tới production: Jenkins, Docker Compose, ghcr, rồi ArgoCD và GitOps trên Kubernetes.',
    tags: ['DevOps', 'CI/CD', 'Jenkins', 'ArgoCD', 'GitOps', 'Kubernetes', 'Deployment', 'Docker Compose', 'ghcr'],
    filterTag: 'DevOps',
  },
  {
    key: 'distributed',
    title: 'Distributed: Kafka & Redis',
    blurb: 'Kiến trúc Kafka, Kafka Connect và CDC; Redis từ single-thread tới data structure và chiến lược cache.',
    tags: ['Kafka', 'Kafka Connect', 'CDC', 'Debezium', 'Redis', 'Messaging', 'Distributed Systems', 'Cache'],
    filterTag: 'Kafka',
  },
  {
    key: 'frontend',
    title: 'Frontend craft',
    blurb: 'Critical rendering path, hook nâng cao, micro frontend với Module Federation, và câu hỏi phỏng vấn React.',
    tags: ['ReactJS', 'React', 'JavaScript', 'Micro Frontends', 'Module Federation', 'Scalable UI'],
    filterTag: 'ReactJS',
  },
  {
    // KHÔNG dùng Productivity / CLI / Workflow: ba tag đó dính 4 bài Claude Code,
    // sẽ kéo nguyên cụm AI sang đây. Chỉ tag đặc trưng cho terminal và git.
    key: 'terminal-git',
    title: 'Terminal & Git',
    blurb: 'tmux giữ phiên khi rớt SSH, git trong dự án thật với amend/rebase/cherry-pick, và chạy nhiều agent song song bằng worktree.',
    tags: ['Git', 'Version Control', 'tmux', 'Terminal'],
    filterTag: 'Git',
  },
]
