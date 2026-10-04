import { loadRoadmap } from '@/utils/private-content'
import { checkStateWritable, roadmapStatePath, setChecklistItem } from '@/utils/roadmap-state'
import type { NextApiRequest, NextApiResponse } from 'next'

// POST { milestoneId, checklistId, done } → { done, checked } của milestone đó.
// Sau middleware /me (không thuộc PUBLIC_PATHS). Chỉ nhận id có thật trong
// roadmap.yaml hiện tại — client không tự đẻ ra key rác trong state.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ code: 'method-not-allowed' })
  }
  const { milestoneId, checklistId, done } = req.body ?? {}
  if (
    typeof milestoneId !== 'string' ||
    typeof checklistId !== 'string' ||
    typeof done !== 'boolean'
  ) {
    return res.status(400).json({ code: 'invalid-input' })
  }

  const roadmap = await loadRoadmap()
  const milestone = roadmap?.data.find((m) => m.id === milestoneId)
  if (!milestone || !milestone.checklist.some((c) => c.id === checklistId)) {
    return res.status(404).json({ code: 'checklist-item-not-found' })
  }

  const blocked = await checkStateWritable()
  if (blocked) {
    return res.status(503).json({
      code: 'roadmap-state-readonly',
      message: `Không ghi được ${roadmapStatePath()} (${blocked}) — thư mục practice log phải mount rw.`,
    })
  }

  const state = await setChecklistItem(milestoneId, checklistId, done)
  const ticked = state[milestoneId] ?? {}
  res.status(200).json({
    done,
    checked: milestone.checklist.filter((c) => ticked[c.id]).map((c) => c.id),
  })
}
