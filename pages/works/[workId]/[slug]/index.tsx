import { NoDataFound } from '@/components/common'
import { MainLayout } from '@/components/layouts'
import { SlUG } from '@/constants'
import { Work } from '@/models'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const ColorMatching = dynamic(() => import('@/components/games/color-matching'), { ssr: false })
const TicTacToe = dynamic(() => import('@/components/games/tic-tac-toe'), { ssr: false })

export interface WorkDetailsProps {
  work: Work
}

const WorkDetails = ({ work }: WorkDetailsProps) => {
  const router = useRouter()
  if (!work) return <NoDataFound />
  const { slug } = router.query || {}
  return slug === SlUG.GAME_TIC_TAC_TOE ? <TicTacToe /> : <ColorMatching />
}

export default WorkDetails

WorkDetails.Layout = MainLayout

export const getStaticPaths: GetStaticPaths = async () => {
  console.log('\nGET STATIC PATHS')
  // server-side code
  // build -times
  const response = await fetch(`${process.env.API_URL}/api/works?_page=1&_limit=10`)
  const data = await response.json()

  return {
    paths: data.data.map((work: Work) => ({ params: { workId: work.id, slug: work.slug } })),
    fallback: 'blocking',
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
  const response = await fetch(`${process.env.API_URL}/api/works/${workId}/${slug}`)
  const data = await response.json()
  return {
    props: {
      work: data,
    },
    revalidate: 60,
  }
}
