import { NoDataFound } from '@/components/common'
import { GameColorMatching, GameSkeleton, GomeTicTacToe } from '@/components/games'
import { MainLayout } from '@/components/layouts'
import { SlUG } from '@/constants'
import { Work } from '@/models'
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
  console.log('\nGET STATIC PATHS')
  // server-side code
  // build -times
  const response = await fetch(
    `${
      process.env.API_URL ?? 'https://json-server-blog.vercel.app'
    }/api/works?status=published&_page=1&_limit=10`,
  )
  const data = await response.json()

  return {
    paths: data.data.map((work: Work) => ({ params: { workId: work.id, slug: work.slug } })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<WorkDetailsProps> = async (
  context: GetStaticPropsContext,
) => {
  const { workId, slug } = context.params || {}
  console.log('\nGET STATIC PROPS', context.params?.workId)
  // server-side code
  // build -times
  if (!workId || !slug) {
    return {
      notFound: true,
    }
  }
  const response = await fetch(
    `${
      process.env.API_URL ?? 'https://json-server-blog.vercel.app'
    }/api/works/${workId}?slug=${slug}`,
  )
  const data = await response.json()
  return {
    props: {
      work: data,
    },
    revalidate: 60,
  }
}
