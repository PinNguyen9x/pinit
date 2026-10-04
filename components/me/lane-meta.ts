import type { Lane } from '@/utils/private-content-schema'

/** Tên hiển thị + màu nhấn cho từng lane — đủ tương phản trên cả nền sáng lẫn tối. */
export const LANE_META: Record<Lane, { label: string; color: string; icon: string }> = {
  'ai-platform': { label: 'AI Platform', color: '#a78bfa', icon: '🧠' },
  'data-platform': { label: 'Data Platform', color: '#22d3ee', icon: '🛰️' },
  interview: { label: 'Phỏng vấn', color: '#4ade80', icon: '🎯' },
  english: { label: 'Tiếng Anh', color: '#f472b6', icon: '🗣️' },
  degree: { label: 'Bằng cấp', color: '#fbbf24', icon: '🎓' },
}

/** Thứ tự hiển thị: lane nghề trước, lane hỗ trợ sau. */
export const LANE_ORDER: Lane[] = ['ai-platform', 'data-platform', 'interview', 'english', 'degree']
