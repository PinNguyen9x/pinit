import { NoDataFound } from '@/components/common'
import { GameColorMatching, GameSkeleton, GomeTicTacToe } from '@/components/games'
import { MainLayout } from '@/components/layouts'
import { SlUG } from '@/constants'
import { Work } from '@/models'
import { API_BASE, safeFetchJson } from '@/utils'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'

export interface WorkDetailsProps {
  work: Work
}

const WorkDetails = ({ work }: WorkDetailsProps) => {
  const router = useRouter()
  if (router.isFallback) return <GameSkeleton />
  if (!work) return <NoDataFound />
  const { slug } = work || {}
  return slug === SlUG.GAME_TIC_TAC_TOE ? <GomeTicTacToe /> : <GameColorMatching />
}

export default WorkDetails

WorkDetails.Layout = MainLayout

export const getStaticPaths: GetStaticPaths = async () => {
  const data = await safeFetchJson<{ data: Work[] }>(
    `${API_BASE}/api/works?status=published&_page=1&_limit=10`,
  )

  return {
    paths:
      data?.data?.map((work) => ({ params: { workId: work.id, slug: work.slug ?? '' } })) ?? [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<WorkDetailsProps> = async (
  context: GetStaticPropsContext,
) => {
  const { workId, slug } = context.params || {}
  if (!workId || !slug) {
    return { notFound: true }
  }
  const data = await safeFetchJson<Work>(`${API_BASE}/api/works/${workId}?slug=${slug}`)
  if (!data || !data.id) {
    return { notFound: true, revalidate: 60 }
  }
  return {
    props: {
      work: data,
    },
    revalidate: 300,
  }
}
