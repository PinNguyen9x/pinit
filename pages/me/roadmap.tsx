import { OwnerLayout } from '@/components/layouts/owner'
import { ContentErrors } from '@/components/me/content-errors'
import { requireOwner } from '@/utils/owner-auth'
import { loadRoadmap } from '@/utils/private-content'
import {
  LANES,
  Lane,
  laneProgress,
  Milestone,
  MilestoneStatus,
} from '@/utils/private-content-schema'
import { Alert, Box, Chip, LinearProgress, Link as MuiLink, Stack, Typography } from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'

interface RoadmapPageProps {
  milestones: Milestone[]
  errors: string[]
  missing: boolean
}

const STATUS_COLOR: Record<MilestoneStatus, 'default' | 'primary' | 'success'> = {
  todo: 'default',
  doing: 'primary',
  done: 'success',
  dropped: 'default',
}

function LaneSection({ lane, items }: { lane: Lane; items: Milestone[] }) {
  const { done, total, percent } = laneProgress(items)
  return (
    <Box component="section" mb={5}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" mb={1}>
        <Typography component="h2" variant="h6">
          {lane}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {done}/{total}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{ mb: 2, height: 6, borderRadius: 3 }}
      />
      <Stack spacing={1.5}>
        {items.map((m) => (
          <Box
            key={m.id}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
              opacity: m.status === 'dropped' ? 0.55 : 1,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip
                label={m.status}
                size="small"
                color={STATUS_COLOR[m.status]}
                variant={m.status === 'todo' ? 'outlined' : 'filled'}
              />
              <Typography
                fontWeight={600}
                sx={{
                  flexGrow: 1,
                  textDecoration: m.status === 'dropped' ? 'line-through' : 'none',
                }}
              >
                {m.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                {m.target}
              </Typography>
            </Stack>
            {m.notes && (
              <Typography variant="body2" color="text.secondary" mt={1} whiteSpace="pre-wrap">
                {m.notes}
              </Typography>
            )}
            {m.links.length > 0 && (
              <Stack component="ul" sx={{ m: 0, mt: 1, pl: 2.5 }}>
                {m.links.map((href) => (
                  <li key={href}>
                    <MuiLink href={href} target="_blank" rel="noopener noreferrer" variant="body2">
                      {href}
                    </MuiLink>
                  </li>
                ))}
              </Stack>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

export default function RoadmapPage({ milestones, errors, missing }: RoadmapPageProps) {
  return (
    <>
      <Head>
        <title>Roadmap</title>
      </Head>
      <Typography component="h1" variant="h4" mb={3}>
        Roadmap
      </Typography>
      {missing && <Alert severity="info">Chưa có roadmap.yaml trong PRIVATE_CONTENT_DIR.</Alert>}
      <ContentErrors errors={errors} />
      {LANES.map((lane) => {
        const items = milestones.filter((m) => m.lane === lane)
        return items.length ? <LaneSection key={lane} lane={lane} items={items} /> : null
      })}
    </>
  )
}

RoadmapPage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps<RoadmapPageProps> = async (ctx) => {
  const denied = await requireOwner(ctx)
  if (denied) return denied
  const roadmap = await loadRoadmap()
  return {
    props: {
      milestones: roadmap?.data ?? [],
      errors: roadmap?.errors ?? [],
      missing: roadmap == null,
    },
  }
}
