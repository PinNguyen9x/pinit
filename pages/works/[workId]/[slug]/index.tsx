import { TicTacToe } from '@/components/games'
import { MainLayout } from '@/components/layouts'
import { SlUG } from '@/constants'
import { Work } from '@/models'
import { Box, Chip, Container, Stack, Typography } from '@mui/material'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const ColorMatching = dynamic(
  () => import('@/components/games/color-matching').then((mod) => mod.ColorMatching),
  { ssr: false },
)

export interface WorkDetailsProps {
  work: Work
}

export default function WorkDetails({ work }: WorkDetailsProps) {
  const router = useRouter()
  const { slug } = router.query || {}
  return (
    <Box>
      <Container>
        <Typography component="h1" variant="h5" mt={4} mb={4}>
          Work details
        </Typography>
        <Box>
          <Stack mt={2} direction="row" justifyContent="space-between" alignItems="center">
            <Typography component="h1" variant="h5" mt={4} mb={4}>
              {work.title}
            </Typography>
          </Stack>
          <Stack direction="row" my={2}>
            <Chip
              label={new Date(Number(work.createdAt)).getFullYear()}
              color="primary"
              size="small"
            />
            <Typography ml={2} color="GrayText">
              {work.tagList.join(', ')}
            </Typography>
          </Stack>
          <Typography>{work.shortDescription}</Typography>
          <Box mt={6}>
            <Typography variant="h6" gutterBottom></Typography>
            {slug === SlUG.GAME_TIC_TAC_TOE && <TicTacToe />}
            {slug === SlUG.GAME_COLOR_MATCHING && <ColorMatching />}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

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
  const { workId } = context.params || {}
  console.log('\nGET STATIC PROPS', context.params?.workId)
  // server-side code
  // build -times
  const response = await fetch(`${process.env.API_URL}/api/works/${workId}`)
  const data = await response.json()
  return {
    props: {
      work: data,
    },
    revalidate: 60,
  }
}
