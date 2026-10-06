import { OwnerLayout } from '@/components/layouts/owner'
import { Heatmap } from '@/components/me/heatmap'
import type { Cockpit } from '@/utils/activity'
import { loadCockpit } from '@/utils/activity'
import type { TodayItem } from '@/utils/activity-insights'
import { requireOwner } from '@/utils/owner-auth'
import { Box, Button, Stack, Typography } from '@mui/material'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { MdArrowDownward, MdArrowForward, MdArrowUpward, MdRemove } from 'react-icons/md'

function Tile({
  label,
  value,
  sub,
  href,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  href?: string
}) {
  const body = (
    <Box
      sx={{
        p: 2,
        height: '100%',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'border-color 150ms',
        ...(href && { '&:hover': { borderColor: 'primary.main' } }),
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing={0.5}
      >
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700} mt={0.5}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary" component="div">
          {sub}
        </Typography>
      )}
    </Box>
  )
  return href ? (
    <Box component={Link} href={href} sx={{ color: 'inherit', textDecoration: 'none' }}>
      {body}
    </Box>
  ) : (
    body
  )
}

function TrendArrow({ trend }: { trend: Cockpit['trend'] }) {
  if (trend === 'up')
    return <MdArrowUpward color="var(--lane-interview)" style={{ verticalAlign: 'middle' }} />
  if (trend === 'down')
    return <MdArrowDownward color="#f87171" style={{ verticalAlign: 'middle' }} />
  if (trend === 'flat') return <MdRemove style={{ verticalAlign: 'middle', opacity: 0.6 }} />
  return null
}

function todayLink(item: TodayItem): { icon: string; text: ReactNode; href: string; cta: string } {
  switch (item.kind) {
    case 'milestone':
      return {
        icon: '🎯',
        text: (
          <>
            <b>{item.title}</b> — còn {item.left} ý checklist, hạn {item.target}
          </>
        ),
        href: `/me/roadmap#${item.id}`,
        cta: 'Mở milestone',
      }
    case 'weak-topic':
      return {
        icon: '🩹',
        text: (
          <>
            Điểm thấp nhất: <b>{item.title}</b> — trung bình {item.average}/10
          </>
        ),
        href: `/me/practice?topic=${item.slug}`,
        cta: 'Luyện lại',
      }
    case 'new-topic':
      return {
        icon: '🌱',
        text: (
          <>
            Chưa luyện bao giờ: <b>{item.title}</b>
          </>
        ),
        href: `/me/practice?topic=${item.slug}`,
        cta: 'Luyện thử',
      }
  }
}

export default function CockpitPage({ c }: { c: Cockpit }) {
  return (
    <>
      <Head>
        <title>Cockpit</title>
      </Head>
      <Stack
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={1}
      >
        <Typography component="h1" variant="h4">
          Hôm nay
        </Typography>
        <Typography variant="body2" color="text.secondary" fontFamily="monospace">
          {c.today}
        </Typography>
      </Stack>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr 1fr', md: 'repeat(4, 1fr)' }}
        gap={1.5}
        mb={4}
      >
        <Tile
          label="Chuỗi ngày"
          value={c.streak ? `🔥 ${c.streak}` : '—'}
          sub={
            c.activeToday
              ? `hôm nay: ${c.activeToday} lần luyện`
              : 'luyện 1 lần hôm nay để giữ chuỗi'
          }
        />
        <Tile
          label="Điểm TB 7 ngày"
          value={
            <>
              {c.avg7 ?? '—'} <TrendArrow trend={c.trend} />
            </>
          }
          sub={c.prev7 != null ? `7 ngày trước: ${c.prev7}` : 'chưa đủ dữ liệu để so'}
          href="/me/practice"
        />
        <Tile
          label="Thẻ đến hạn"
          value={c.dueCards || '0'}
          sub={c.dueCards ? 'ôn ở trang Learn' : 'không có thẻ nào chờ'}
          href="/me/learn"
        />
        <Tile label="Topic" value={c.topicsCount} sub="trong learn/" href="/me/learn" />
      </Box>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '3fr 2fr' }} gap={3} mb={4}>
        <Box>
          <Typography component="h2" variant="h6" mb={1.5}>
            Việc nên làm
          </Typography>
          {c.todayItems.length ? (
            <Stack spacing={1.25}>
              {c.todayItems.map((item) => {
                const l = todayLink(item)
                return (
                  <Stack
                    key={item.kind}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    alignItems={{ sm: 'center' }}
                    sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}
                  >
                    <Typography sx={{ fontSize: '1.4rem', lineHeight: 1 }}>{l.icon}</Typography>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {l.text}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      component={Link}
                      href={l.href}
                      endIcon={<MdArrowForward />}
                      sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      {l.cta}
                    </Button>
                  </Stack>
                )
              })}
            </Stack>
          ) : (
            <Typography color="text.secondary">
              Không còn việc gợi ý — nghỉ ngơi cũng là một phần của lộ trình.
            </Typography>
          )}
        </Box>

        <Box>
          <Typography component="h2" variant="h6" mb={1.5}>
            Đếm ngược
          </Typography>
          <Stack spacing={1.25}>
            {c.countdown.map((m) => (
              <Box
                key={m.id}
                component={Link}
                href={`/me/roadmap#${m.id}`}
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: m.daysLeft < 0 ? 'error.main' : 'divider',
                  borderRadius: 2,
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'center',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Box sx={{ textAlign: 'center', minWidth: 56 }}>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color={m.daysLeft < 0 ? 'error.main' : 'text.primary'}
                  >
                    {Math.abs(m.daysLeft)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {m.daysLeft < 0 ? 'ngày trễ' : 'ngày'}
                  </Typography>
                </Box>
                <Box minWidth={0}>
                  <Typography variant="body2" fontWeight={600}>
                    {m.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    hạn {m.target} · {m.status === 'doing' ? 'đang làm' : 'chưa bắt đầu'}
                  </Typography>
                </Box>
              </Box>
            ))}
            {!c.countdown.length && (
              <Typography color="text.secondary">Không còn milestone nào đang mở.</Typography>
            )}
          </Stack>
        </Box>
      </Box>

      <Typography component="h2" variant="h6" mb={1.5}>
        12 tuần gần nhất
      </Typography>
      <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Heatmap weeks={c.heatmap} />
      </Box>
    </>
  )
}

CockpitPage.Layout = OwnerLayout

export const getServerSideProps: GetServerSideProps<{ c: Cockpit }> = async (ctx) => {
  const denied = await requireOwner(ctx)
  if (denied) return denied
  return { props: { c: await loadCockpit() } }
}
