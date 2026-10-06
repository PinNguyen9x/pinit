import type { Lane } from '@/utils/private-content-schema'

/**
 * Tên hiển thị + màu nhấn cho từng lane. Màu là CSS variable (styles/globals.css)
 * nên tự đổi theo theme sáng/tối mà không cần render lại.
 */
export const LANE_META: Record<Lane, { label: string; color: string; icon: string }> = {
  'ai-platform': { label: 'AI Platform', color: 'var(--lane-ai-platform)', icon: '🧠' },
  'data-platform': { label: 'Data Platform', color: 'var(--lane-data-platform)', icon: '🛰️' },
  interview: { label: 'Phỏng vấn', color: 'var(--lane-interview)', icon: '🎯' },
  english: { label: 'Tiếng Anh', color: 'var(--lane-english)', icon: '🗣️' },
  degree: { label: 'Bằng cấp', color: 'var(--lane-degree)', icon: '🎓' },
}

/** Thứ tự hiển thị: lane nghề trước, lane hỗ trợ sau. */
export const LANE_ORDER: Lane[] = ['ai-platform', 'data-platform', 'interview', 'english', 'degree']
