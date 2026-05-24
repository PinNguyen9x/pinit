import { NoDataFound } from '@/components/common'
import { MainLayout } from '@/components/layouts'
import { WorkDetailSkeleton } from '@/components/work'
import { useAuth, useRenderTagIcon } from '@/hooks'
import { Work, WorkStatus } from '@/models'
import { API_BASE, safeFetchJson } from '@/utils'
import { Box, Container, Stack, useTheme } from '@mui/material'
import { format } from 'date-fns'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaGithub } from 'react-icons/fa'
import { MdEdit, MdLaunch, MdOpenInNew } from 'react-icons/md'
import sanitizeHtml from 'sanitize-html'

export interface WorkDetailsProps {
  work: Work
}

const SERIF = '"Fraunces", Georgia, serif'
const MONO = '"JetBrains Mono", ui-monospace, monospace'

interface Section {
  id: string
  label: string
}

function parseDate(value: string | number | undefined): Date | null {
  if (!value) return null
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isNaN(n) && n > 0) return new Date(n)
  const d = new Date(value as string)
  return Number.isNaN(d.getTime()) ? null : d
}

export default function WorkDetails({ work }: WorkDetailsProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const techStack = useRenderTagIcon(work?.tagList || [])

  const accent = theme.palette.primary.main
  const accentSoft = isDark ? 'rgba(74,222,128,0.10)' : 'rgba(22,163,74,0.08)'
  const accentEdge = isDark ? 'rgba(74,222,128,0.32)' : 'rgba(22,163,74,0.28)'
  const green = theme.palette.secondary.main
  const greenSoft = isDark ? 'rgba(52,211,153,0.10)' : 'rgba(5,150,105,0.10)'
  const greenEdge = isDark ? 'rgba(52,211,153,0.32)' : 'rgba(5,150,105,0.28)'
  const bg = theme.palette.background.default
  const bg1 = isDark ? '#0d0d10' : '#fafafa'
  const bg2 = isDark ? '#121216' : '#f3f3f5'
  const bg3 = isDark ? '#17171c' : '#ececef'
  const line = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'
  const line2 = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const ink = theme.palette.text.primary
  const inkDim = theme.palette.text.secondary
  const inkFaint = isDark ? '#5d5d66' : '#8b8b94'

  const layers = useMemo(
    () =>
      [
        { title: 'Frontend layer', items: work?.frontEndTagList || [] },
        { title: 'API / orchestration layer', items: work?.backEndTagList || [] },
        { title: 'Data layer', items: work?.dbTagList || [] },
      ].filter((l) => l.items.length > 0),
    [work],
  )

  const sections = useMemo<Section[]>(() => {
    const list: Section[] = [{ id: 'overview', label: 'Overview' }]
    if (work?.fullDescription) list.push({ id: 'narrative', label: 'Project narrative' })
    if (layers.length > 0) list.push({ id: 'architecture', label: 'Architecture flow' })
    if (techStack.length > 0) list.push({ id: 'stack', label: 'Tech stack' })
    return list
  }, [work, layers, techStack])

  const [active, setActive] = useState<string>(sections[0]?.id ?? 'overview')

  const updateActive = useCallback(() => {
    if (typeof window === 'undefined') return
    const y = window.scrollY + 140
    let cur = sections[0]?.id ?? 'overview'
    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el && el.offsetTop <= y) cur = s.id
    }
    setActive(cur)
  }, [sections])

  useEffect(() => {
    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    return () => window.removeEventListener('scroll', updateActive)
  }, [updateActive])

  if (router.isFallback) return <WorkDetailSkeleton />
  if (!work) return <NoDataFound />

  const created = parseDate(work.createdAt)
  const updated = parseDate(work.updatedAt)
  const year = created ? format(created, 'yyyy') : '—'
  const isShipped = work.status === WorkStatus.PUBLISHED
  const statusLabel = isShipped ? 'Shipped' : 'Draft'

  const titleParts = (work.title || '').trim().split(' ')
  const titleHead = titleParts.slice(0, -1).join(' ')
  const titleTail = titleParts[titleParts.length - 1] || ''

  type TagVariant = 'solid' | 'dot' | 'ghost'
  const heroTags: { label: string; variant: TagVariant }[] = [
    {
      label: isShipped ? 'Live in production' : 'In progress',
      variant: isShipped ? 'dot' : 'ghost',
    },
    ...(work.tagList?.[0] ? [{ label: work.tagList[0], variant: 'solid' as TagVariant }] : []),
    { label: year, variant: 'ghost' },
    ...(updated
      ? [{ label: `Updated ${format(updated, 'MMM yyyy')}`, variant: 'ghost' as TagVariant }]
      : []),
  ]

  const stackSummary = (work.tagList || []).slice(0, 2).join(' · ') || '—'

  const metaRows: { k: string; v: React.ReactNode }[] = [
    { k: 'Year', v: year },
    { k: 'Status', v: <StatusValue label={statusLabel} green={isShipped} color={green} /> },
    ...(updated ? [{ k: 'Updated', v: format(updated, 'd MMM yyyy') }] : []),
    { k: 'Stack', v: stackSummary },
    { k: 'Layers', v: layers.length > 0 ? `${layers.length} layers` : '—' },
    { k: 'Tech', v: `${techStack.length} items` },
  ]

  const quickStats: { k: string; v: string; unit?: string }[] = [
    { k: 'Year', v: year },
    { k: 'Tech', v: String(techStack.length), unit: 'items' },
    { k: 'Frontend', v: String(work.frontEndTagList?.length ?? 0), unit: 'tools' },
    { k: 'Backend', v: String(work.backEndTagList?.length ?? 0), unit: 'tools' },
  ]

  // ----- shared styles -----
  const panelSx = {
    border: `1px solid ${line}`,
    borderRadius: '14px',
    bgcolor: bg1,
    p: '22px',
  } as const
  const panelHSx = {
    fontFamily: MONO,
    fontWeight: 600,
    fontSize: '10px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: inkFaint,
    m: 0,
    mb: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as const
  const tagBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontFamily: MONO,
    fontWeight: 500,
    fontSize: '11px',
    lineHeight: 1,
    px: '10px',
    py: '6px',
    borderRadius: '6px',
  } as const

  const renderTag = (label: string, variant: 'solid' | 'dot' | 'ghost', key: string) => {
    if (variant === 'dot') {
      return (
        <Box
          key={key}
          sx={{
            ...tagBase,
            color: green,
            border: `1px solid ${greenEdge}`,
            bgcolor: greenSoft,
            pl: '8px',
            '&::before': {
              content: '""',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              bgcolor: green,
              boxShadow: `0 0 0 2px ${greenSoft}`,
            },
          }}
        >
          {label}
        </Box>
      )
    }
    if (variant === 'ghost') {
      return (
        <Box
          key={key}
          sx={{
            ...tagBase,
            color: inkDim,
            border: `1px solid ${line}`,
            bgcolor: 'transparent',
          }}
        >
          {label}
        </Box>
      )
    }
    return (
      <Box
        key={key}
        sx={{
          ...tagBase,
          color: accent,
          border: `1px solid ${accentEdge}`,
          bgcolor: accentSoft,
        }}
      >
        {label}
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: bg, color: ink }}>
      <Container maxWidth={false} sx={{ maxWidth: '1320px', px: { xs: 2, md: '28px' }, pt: { xs: 4, md: '36px' }, pb: { xs: 8, md: '96px' } }}>
        {/* breadcrumb */}
        <Box
          sx={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            fontFamily: MONO,
            fontSize: '12px',
            fontWeight: 500,
            color: inkFaint,
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            mb: '28px',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/works" style={{ color: inkFaint, textDecoration: 'none' }}>
            Works
          </Link>
          <Box component="span" sx={{ opacity: 0.5 }}>
            /
          </Box>
          <Box component="span">{year}</Box>
          <Box component="span" sx={{ opacity: 0.5 }}>
            /
          </Box>
          <Box component="b" sx={{ color: ink, fontWeight: 500 }}>
            {work.title}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '300px 1fr' },
            gap: { xs: 4, lg: '56px' },
            alignItems: 'start',
          }}
        >
          {/* ============ SIDEBAR ============ */}
          <Box
            component="aside"
            sx={{
              position: { xs: 'static', lg: 'sticky' },
              top: { lg: '84px' },
              alignSelf: 'start',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              maxHeight: { lg: 'calc(100vh - 100px)' },
              overflowY: { lg: 'auto' },
              pr: { lg: '4px' },
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-thumb': { background: line, borderRadius: '2px' },
            }}
          >
            {/* Project info */}
            <Box sx={panelSx}>
              <Box component="h5" sx={panelHSx}>
                <span>Project info</span>
                {isShipped && (
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: green,
                      fontSize: '10px',
                      '&::before': {
                        content: '""',
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        bgcolor: green,
                        boxShadow: `0 0 0 3px ${greenSoft}`,
                      },
                    }}
                  >
                    Live
                  </Box>
                )}
              </Box>
              <Stack>
                {metaRows.map((row, i) => (
                  <Box
                    key={row.k}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1.5,
                      py: '11px',
                      borderBottom: i === metaRows.length - 1 ? 0 : `1px dashed ${line2}`,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        fontFamily: MONO,
                        fontWeight: 500,
                        fontSize: '11px',
                        lineHeight: 1,
                        color: inkFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                      }}
                    >
                      {row.k}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        fontWeight: 500,
                        fontSize: '13px',
                        lineHeight: 1.3,
                        color: ink,
                        textAlign: 'right',
                      }}
                    >
                      {row.v}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Actions */}
            <Box sx={panelSx}>
              <Stack spacing={1}>
                {work.linkDemo && (
                  <SideButton
                    href={work.linkDemo}
                    primary
                    accent={accent}
                    line={line}
                    bg2={bg2}
                    bg3={bg3}
                    ink={ink}
                    inkFaint={inkFaint}
                  >
                    <MdLaunch size={15} />
                    Open live demo
                  </SideButton>
                )}
                {work.linkSource && (
                  <SideButton
                    href={work.linkSource}
                    accent={accent}
                    line={line}
                    bg2={bg2}
                    bg3={bg3}
                    ink={ink}
                    inkFaint={inkFaint}
                  >
                    <FaGithub size={15} />
                    View source
                    <Box component="span" sx={{ ml: 'auto', fontFamily: MONO, color: 'inherit' }}>
                      ↗
                    </Box>
                  </SideButton>
                )}
                {isLoggedIn && (
                  <SideButton
                    accent={accent}
                    line={line}
                    bg2={bg2}
                    bg3={bg3}
                    ink={ink}
                    inkFaint={inkFaint}
                    onClick={() => router.push(`/works/${work.id}`)}
                  >
                    <MdEdit size={15} />
                    Edit project
                  </SideButton>
                )}
                {!work.linkDemo && !work.linkSource && !isLoggedIn && (
                  <SideButton
                    href="/works"
                    accent={accent}
                    line={line}
                    bg2={bg2}
                    bg3={bg3}
                    ink={ink}
                    inkFaint={inkFaint}
                  >
                    <MdOpenInNew size={15} />
                    Browse all works
                  </SideButton>
                )}
              </Stack>
            </Box>

            {/* TOC */}
            <Box sx={panelSx}>
              <Box component="h5" sx={panelHSx}>
                On this page
              </Box>
              <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {sections.map((s, i) => {
                  const on = active === s.id
                  return (
                    <Box
                      component="a"
                      key={s.id}
                      href={`#${s.id}`}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '24px 1fr',
                        gap: '10px',
                        alignItems: 'center',
                        px: '10px',
                        py: '9px',
                        borderRadius: '7px',
                        textDecoration: 'none',
                        color: on ? accent : inkDim,
                        fontWeight: 500,
                        fontSize: '13px',
                        lineHeight: 1.4,
                        borderLeft: `2px solid ${on ? accent : 'transparent'}`,
                        bgcolor: on ? accentSoft : 'transparent',
                        transition: 'all 0.15s',
                        '&:hover': { color: on ? accent : ink, bgcolor: on ? accentSoft : bg2 },
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontFamily: MONO,
                          fontWeight: 500,
                          fontSize: '10px',
                          lineHeight: 1,
                          color: on ? accent : inkFaint,
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </Box>
                      <Box component="span">{s.label}</Box>
                    </Box>
                  )
                })}
              </Box>
            </Box>

            {/* Quick stats */}
            <Box sx={panelSx}>
              <Box component="h5" sx={panelHSx}>
                Quick stats
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1px',
                  bgcolor: line2,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                {quickStats.map((s) => (
                  <Box
                    key={s.k}
                    sx={{ bgcolor: bg1, p: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}
                  >
                    <Box
                      sx={{
                        fontFamily: MONO,
                        fontWeight: 500,
                        fontSize: '10px',
                        lineHeight: 1,
                        color: inkFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                      }}
                    >
                      {s.k}
                    </Box>
                    <Box
                      sx={{
                        fontFamily: SERIF,
                        fontWeight: 600,
                        fontSize: '22px',
                        lineHeight: 1,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {s.v}
                      {s.unit && (
                        <Box
                          component="small"
                          sx={{
                            fontFamily: 'inherit',
                            fontWeight: 400,
                            fontSize: '11px',
                            color: inkDim,
                            ml: '3px',
                          }}
                        >
                          {s.unit}
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* ============ MAIN ============ */}
          <Box component="main" sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 8, md: '80px' } }}>
            {/* HERO */}
            <Box component="section" id="overview">
              <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap', mb: '20px' }}>
                {heroTags.map((t, i) => renderTag(t.label, t.variant, `${t.label}-${i}`))}
              </Box>
              <Box
                component="h1"
                sx={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: { xs: '44px', md: '64px', lg: '84px' },
                  lineHeight: 0.96,
                  letterSpacing: '-0.035em',
                  m: '8px 0 20px',
                  color: ink,
                }}
              >
                {titleHead && <>{titleHead} </>}
                <Box
                  component="em"
                  sx={{
                    fontStyle: 'italic',
                    color: accent,
                    fontWeight: 400,
                  }}
                >
                  {titleTail}
                </Box>
                <Box component="span" sx={{ color: accent }}>
                  .
                </Box>
              </Box>
              {work.shortDescription && (
                <Box
                  component="p"
                  sx={{
                    fontSize: { xs: '17px', md: '19px' },
                    lineHeight: 1.55,
                    color: inkDim,
                    maxWidth: '680px',
                    m: '0 0 36px',
                    '& strong': { color: ink, fontWeight: 600 },
                  }}
                >
                  {work.shortDescription}
                </Box>
              )}
              <HeroCover
                thumbnailUrl={work.thumbnailUrl}
                title={work.title}
                accent={accent}
                accentEdge={accentEdge}
                accentSoft={accentSoft}
                green={green}
                greenSoft={greenSoft}
                bg={bg}
                bg1={bg1}
                bg2={bg2}
                line={line}
                ink2={inkDim}
                inkFaint={inkFaint}
                year={year}
                primaryTag={work.tagList?.[0]}
                statusLabel={statusLabel}
                isShipped={isShipped}
              />
            </Box>

            {/* NARRATIVE (fullDescription) */}
            {work.fullDescription && (
              <Box component="section" id="narrative" sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <SectionHead num="02" title="Project narrative." meta="from the maker" accent={accent} line={line} inkFaint={inkFaint} ink={ink} />
                <Box
                  sx={{
                    color: inkDim,
                    fontSize: '16px',
                    lineHeight: 1.75,
                    '& strong': { color: ink, fontWeight: 600 },
                    '& em': { color: ink },
                    '& p': { m: 0, mb: '1em' },
                    '& a': { color: accent },
                    '& h1,& h2,& h3,& h4': { color: ink, fontFamily: SERIF, fontWeight: 600, letterSpacing: '-0.01em' },
                    '& code': {
                      fontFamily: MONO,
                      fontSize: '0.92em',
                      bgcolor: bg2,
                      color: ink,
                      px: '6px',
                      py: '2px',
                      borderRadius: '4px',
                      border: `1px solid ${line2}`,
                    },
                    '& pre': {
                      fontFamily: MONO,
                      fontSize: '13px',
                      bgcolor: bg1,
                      border: `1px solid ${line}`,
                      borderRadius: '10px',
                      p: '16px',
                      overflowX: 'auto',
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: work.fullDescription }}
                />
              </Box>
            )}

            {/* ARCHITECTURE */}
            {layers.length > 0 && (
              <Box component="section" id="architecture" sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <SectionHead
                  num={work.fullDescription ? '03' : '02'}
                  title="Architecture flow."
                  meta={`${layers.length} layers · swappable`}
                  accent={accent}
                  line={line}
                  inkFaint={inkFaint}
                  ink={ink}
                />
                <Box sx={{ border: `1px solid ${line}`, borderRadius: '14px', bgcolor: bg1, overflow: 'hidden' }}>
                  {layers.map((layer, i) => (
                    <Box
                      key={layer.title}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '60px 1fr', md: '80px 1fr 220px' },
                        gap: { xs: 2, md: '24px' },
                        alignItems: 'center',
                        p: { xs: '20px', md: '24px 28px' },
                        borderBottom: i === layers.length - 1 ? 0 : `1px solid ${line}`,
                        position: 'relative',
                        transition: 'background 0.15s',
                        '&:hover': { bgcolor: bg2 },
                        '&::after':
                          i === layers.length - 1
                            ? {}
                            : {
                                content: '""',
                                position: 'absolute',
                                left: { xs: '34px', md: '51px' },
                                bottom: '-9px',
                                width: '18px',
                                height: '18px',
                                borderRight: `1px dashed ${accentEdge}`,
                                borderBottom: `1px dashed ${accentEdge}`,
                                transform: 'rotate(45deg)',
                                bgcolor: bg1,
                              },
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: '46px', md: '54px' },
                          height: { xs: '46px', md: '54px' },
                          borderRadius: '12px',
                          bgcolor: accentSoft,
                          border: `1px solid ${accentEdge}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: accent,
                        }}
                      >
                        <Box sx={{ fontFamily: MONO, fontWeight: 600, fontSize: '16px', lineHeight: 1 }}>
                          {String(i + 1).padStart(2, '0')}
                        </Box>
                        <Box
                          sx={{
                            fontFamily: MONO,
                            fontWeight: 500,
                            fontSize: '9px',
                            lineHeight: 1,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: inkFaint,
                            mt: '3px',
                          }}
                        >
                          Layer
                        </Box>
                      </Box>
                      <Box>
                        <Box
                          component="h4"
                          sx={{
                            fontWeight: 600,
                            fontSize: '18px',
                            m: '0 0 8px',
                            letterSpacing: '-0.005em',
                            color: ink,
                          }}
                        >
                          {layer.title}
                        </Box>
                        <Stack spacing={0.5}>
                          {layer.items.map((item) => (
                            <Box
                              key={item}
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: '18px 1fr',
                                gap: '6px',
                                color: inkDim,
                                fontSize: '14px',
                                lineHeight: 1.6,
                                '&::before': {
                                  content: '"→"',
                                  color: accent,
                                  fontFamily: MONO,
                                  fontSize: '13px',
                                  lineHeight: 1.6,
                                },
                              }}
                            >
                              <Box component="span" />
                              <Box component="span">{item}</Box>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                      <Box
                        sx={{
                          display: { xs: 'none', md: 'flex' },
                          gap: '6px',
                          flexWrap: 'wrap',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {(work.tagList || []).slice(i * 2, i * 2 + 2).map((t) => renderTag(t, 'solid', `${layer.title}-${t}`))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* TECH STACK */}
            {techStack.length > 0 && (
              <Box component="section" id="stack" sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <SectionHead
                  num={String(2 + (work.fullDescription ? 1 : 0) + (layers.length > 0 ? 1 : 0)).padStart(2, '0')}
                  title="Technical stack."
                  meta={`${techStack.length} dependencies`}
                  accent={accent}
                  line={line}
                  inkFaint={inkFaint}
                  ink={ink}
                />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)',
                    },
                    gap: '14px',
                  }}
                >
                  {techStack.map((tech, i) => (
                    <Box
                      key={`${tech.name}-${i}`}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        p: '20px',
                        border: `1px solid ${line}`,
                        borderRadius: '12px',
                        bgcolor: bg1,
                        transition: 'all 0.15s',
                        '&:hover': {
                          borderColor: accentEdge,
                          bgcolor: bg2,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '9px',
                          bgcolor: accentSoft,
                          border: `1px solid ${accentEdge}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: accent,
                        }}
                      >
                        {tech.icon}
                      </Box>
                      <Box sx={{ fontWeight: 600, fontSize: '14px', lineHeight: 1.2, color: ink }}>
                        {tech.name}
                      </Box>
                      <Box
                        sx={{
                          fontFamily: MONO,
                          fontWeight: 500,
                          fontSize: '10px',
                          lineHeight: 1.3,
                          color: inkFaint,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        Stack item
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

// ─────────── Subcomponents ───────────

interface SideButtonProps {
  href?: string
  primary?: boolean
  accent: string
  line: string
  bg2: string
  bg3: string
  ink: string
  inkFaint: string
  onClick?: () => void
  children: React.ReactNode
}
function SideButton({
  href,
  primary,
  accent,
  line,
  bg2,
  bg3,
  ink,
  inkFaint,
  onClick,
  children,
}: SideButtonProps) {
  const sx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    px: '16px',
    py: '11px',
    borderRadius: '9px',
    border: `1px solid ${primary ? accent : line}`,
    bgcolor: primary ? accent : bg2,
    color: primary ? '#fff' : ink,
    fontWeight: 500,
    fontSize: '13px',
    lineHeight: 1,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
    justifyContent: 'flex-start',
    boxShadow: 'none',
    '&:hover': primary
      ? {
          bgcolor: accent,
          color: '#fff',
          transform: 'translateY(-1px)',
          boxShadow: `0 8px 22px ${accent}40`,
        }
      : {
          borderColor: accent,
          color: accent,
          bgcolor: bg3,
          transform: 'translateY(-1px)',
        },
    '& svg': { flexShrink: 0 },
  } as const
  if (href) {
    return (
      <Box component="a" href={href} target="_blank" rel="noopener noreferrer" sx={sx}>
        {children}
      </Box>
    )
  }
  return (
    <Box component="button" onClick={onClick} sx={sx}>
      {children}
    </Box>
  )
}

function StatusValue({ label, green, color }: { label: string; green: boolean; color: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: green ? color : 'inherit',
        '&::before': green
          ? {
              content: '""',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              bgcolor: color,
            }
          : {},
      }}
    >
      {label}
    </Box>
  )
}

interface SectionHeadProps {
  num: string
  title: string
  meta: string
  accent: string
  line: string
  inkFaint: string
  ink: string
}
function SectionHead({ num, title, meta, accent, line, inkFaint, ink }: SectionHeadProps) {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '24px',
        pb: '18px',
        borderBottom: `1px solid ${line}`,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '18px', flexWrap: 'wrap' }}>
        <Box
          component="span"
          sx={{
            fontFamily: MONO,
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: 1,
            color: accent,
            letterSpacing: '0.16em',
            pt: '6px',
          }}
        >
          — {num}
        </Box>
        <Box
          component="h2"
          sx={{
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: { xs: '28px', md: '36px' },
            lineHeight: 1,
            m: 0,
            letterSpacing: '-0.02em',
            color: ink,
          }}
        >
          {title}
        </Box>
      </Box>
      <Box
        component="span"
        sx={{
          fontFamily: MONO,
          fontWeight: 500,
          fontSize: '11px',
          lineHeight: 1,
          color: inkFaint,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
        }}
      >
        {meta}
      </Box>
    </Box>
  )
}

interface HeroCoverProps {
  thumbnailUrl?: string
  title: string
  accent: string
  accentEdge: string
  accentSoft: string
  green: string
  greenSoft: string
  bg: string
  bg1: string
  bg2: string
  line: string
  ink2: string
  inkFaint: string
  year: string
  primaryTag?: string
  statusLabel: string
  isShipped: boolean
}
function HeroCover({
  thumbnailUrl,
  title,
  accent,
  accentEdge,
  accentSoft,
  green,
  greenSoft,
  bg,
  bg1,
  bg2,
  line,
  ink2,
  inkFaint,
  year,
  primaryTag,
  statusLabel,
  isShipped,
}: HeroCoverProps) {
  const hasImage = !!thumbnailUrl
  return (
    <Box
      sx={{
        height: { xs: '300px', md: '420px', lg: '480px' },
        borderRadius: '16px',
        border: `1px solid ${line}`,
        backgroundImage: hasImage
          ? `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.45)), url(${thumbnailUrl})`
          : `
              radial-gradient(ellipse 50% 70% at 30% 50%, ${accentSoft.replace('0.10', '0.20')}, transparent 60%),
              radial-gradient(ellipse 60% 80% at 80% 20%, ${accentSoft}, transparent 70%),
              linear-gradient(180deg, ${bg2}, ${bg1})
            `,
        backgroundSize: hasImage ? 'cover' : 'auto',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': hasImage
          ? {}
          : {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: `
              repeating-linear-gradient(0deg, transparent 0 39px, rgba(255,255,255,0.025) 39px 40px),
              repeating-linear-gradient(90deg, transparent 0 39px, rgba(255,255,255,0.025) 39px 40px)
            `,
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 90%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 90%)',
            },
      }}
    >
      {!hasImage && (
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            color: inkFaint,
            fontFamily: MONO,
            fontSize: '12px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            border: `1px dashed ${line}`,
            px: '18px',
            py: '10px',
            borderRadius: '8px',
            bgcolor: `${bg}cc`,
          }}
        >
          ▦ {title} · cover
        </Box>
      )}
      <FloatingBadge top="32px" left="32px" bg={bg1} line={line} color={ink2}>
        <Box
          component="span"
          sx={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            bgcolor: isShipped ? green : inkFaint,
            boxShadow: isShipped ? `0 0 0 2px ${greenSoft}` : 'none',
          }}
        />
        {isShipped ? 'shipped · production' : 'work in progress'}
      </FloatingBadge>
      <FloatingBadge
        top="50%"
        right="60px"
        bg={bg1}
        line={line}
        color={ink2}
        sx={{ transform: 'translateY(-50%)', display: { xs: 'none', md: 'flex' } }}
      >
        ▦ /{year} · {primaryTag || 'project'}
      </FloatingBadge>
      <FloatingBadge
        bottom="32px"
        right="32px"
        bg={`${accentSoft}`}
        line={accentEdge}
        color={accent}
      >
        <Box component="span" sx={{ width: '8px', height: '8px', borderRadius: '50%', bgcolor: accent }} />
        {statusLabel} · {primaryTag || 'project'}
      </FloatingBadge>
    </Box>
  )
}

function FloatingBadge({
  children,
  top,
  bottom,
  left,
  right,
  bg,
  line,
  color,
  sx,
}: {
  children: React.ReactNode
  top?: string
  bottom?: string
  left?: string
  right?: string
  bg: string
  line: string
  color: string
  sx?: object
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top,
        bottom,
        left,
        right,
        border: `1px solid ${line}`,
        borderRadius: '10px',
        bgcolor: bg,
        backdropFilter: 'blur(8px)',
        px: '14px',
        py: '10px',
        fontFamily: MONO,
        fontWeight: 500,
        fontSize: '11px',
        lineHeight: 1.3,
        color,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

WorkDetails.Layout = MainLayout

export const getStaticPaths: GetStaticPaths = async () => {
  const data = await safeFetchJson<{ data: Work[] }>(
    `${API_BASE}/api/works?_page=1&_limit=10`,
  )

  // If the backend was unreachable at build time, skip pre-rendering and let
  // every page render on demand. Otherwise pre-render the first batch.
  return {
    paths: data?.data?.map((work) => ({ params: { workId: work.id } })) ?? [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<WorkDetailsProps> = async (
  context: GetStaticPropsContext,
) => {
  const workId = context.params?.workId
  const data = await safeFetchJson<Work & { fullDescription?: string }>(
    `${API_BASE}/api/works/${workId}`,
  )
  if (!data || !data.id) {
    return { notFound: true, revalidate: 60 }
  }
  data.fullDescription = sanitizeHtml(data.fullDescription ?? '', {
    allowedAttributes: {
      span: ['style', 'class'],
    },
  })
  return {
    props: {
      work: data as Work,
    },
    revalidate: 300,
  }
}
