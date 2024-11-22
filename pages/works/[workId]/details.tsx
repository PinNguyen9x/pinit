import { MainLayout } from '@/components/layouts'
import { useAuth } from '@/hooks'
import { Work } from '@/models'
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'
import sanitizeHtml from 'sanitize-html'

export interface WorkDetailsProps {
  work: Work
}

export default function WorkDetails({ work }: WorkDetailsProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()

  return (
    <Box>
      <Container>
        <Typography component="h1" variant="h5" mt={8} mb={4}>
          Work details
        </Typography>
        <Box>
          <Stack mb={4} mt={8} direction="row" justifyContent="space-between" alignItems="center">
            <Typography component="h1" variant="h5" mt={8} mb={4}>
              {work.title}
            </Typography>
            {isLoggedIn && (
              <Button variant="contained" onClick={() => router.push(`/works/${work.id}`)}>
                Edit
              </Button>
            )}
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
          <Box
            component="div"
            dangerouslySetInnerHTML={{ __html: work.fullDescription }}
            sx={{ img: { maxWidth: '100%' } }}
          />
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
  const response = await fetch(`${process.env.API_URL}/api/works?_page=1&limit=3`)
  const data = await response.json()

  return {
    paths: data.data.map((work: Work) => ({ params: { workId: work.id } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<WorkDetailsProps> = async (
  context: GetStaticPropsContext,
) => {
  const workId = context.params?.workId
  console.log('\nGET STATIC PROPS', context.params?.workId)
  // server-side code
  // build -times
  const response = await fetch(`${process.env.API_URL}/api/works/${workId}`)
  const data = await response.json()
  // sanitize data
  data.fullDescription = sanitizeHtml(data.fullDescription, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  })
  return {
    props: {
      work: data,
    },
  }
}
