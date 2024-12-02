import { NoDataFound } from '@/components/common'
import { MainLayout } from '@/components/layouts'
import { WorkDetailSkeleton } from '@/components/work'
import { useAuth, useRenderTagIcon } from '@/hooks'
import { Work } from '@/models'
import {
  Box,
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'
import Zoom from '@mui/material/Zoom'
import { styled } from '@mui/system'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { MdArrowForward, MdCheckCircle, MdEdit } from 'react-icons/md'
import sanitizeHtml from 'sanitize-html'

export interface WorkDetailsProps {
  work: Work
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '2rem',
  margin: '2rem 0',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}))

const ActionButton = styled(Button)(({ theme }) => ({
  padding: '0.8rem 2rem',
  borderRadius: '25px',
  textTransform: 'none',
  fontSize: '1.1rem',
  fontWeight: '600',
  margin: '0 0.5rem',
}))

const DemoButton = styled(ActionButton)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  boxShadow: '0 3px 15px rgba(33, 150, 243, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
  },
}))

const GithubButton = styled(ActionButton)(({ theme }) => ({
  background: 'linear-gradient(45deg, #24292e 30%, #404448 90%)',
  boxShadow: '0 3px 15px rgba(36, 41, 46, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #1b1f23 30%, #2f3337 90%)',
  },
}))

const EditButton = styled(ActionButton)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
  boxShadow: '0 3px 15px rgba(255, 107, 107, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF5252 30%, #FF7043 90%)',
  },
}))

const ArchitectureBox = styled(Box)(({ theme }) => ({
  padding: '2rem',
  background: '#f8f9fa',
  borderRadius: '12px',
  marginBottom: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
}))

const FlowStep = styled(Box)(({ theme }) => ({
  padding: '1.5rem',
  background: '#ffffff',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}))
const renderLayer = (checkList: string[]) => {
  if (!checkList || checkList.length === 0) return []
  return (
    <List dense>
      {checkList.map((item, index) => (
        <ListItem key={index}>
          <ListItemIcon>
            <MdCheckCircle color="#2196F3" />
          </ListItemIcon>
          <ListItemText primary={item} />
        </ListItem>
      ))}
    </List>
  )
}

export default function WorkDetails({ work }: WorkDetailsProps) {
  const [hoveredTag, setHoveredTag] = useState<number | null>(null)
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const techStack = useRenderTagIcon(work?.tagList || [])
  if (router.isFallback) {
    return <WorkDetailSkeleton />
  }
  if (!work) return <NoDataFound />

  return (
    <Container maxWidth="lg">
      <StyledPaper elevation={0}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {work.title}
        </Typography>

        <Typography
          variant="body1"
          paragraph
          sx={{ fontSize: '1.1rem' }}
          dangerouslySetInnerHTML={{ __html: work.fullDescription }}
        />

        <ArchitectureBox>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: '600' }}>
            Architecture Flow
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.isArray(work.frontEndTagList) && work.frontEndTagList.length > 0 && (
              <FlowStep>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Frontend Layer
                  </Typography>
                  {renderLayer(work.frontEndTagList || [])}
                </Box>
                <MdArrowForward size={24} color="#2196F3" />
              </FlowStep>
            )}
            {Array.isArray(work.backEndTagList) && work.backEndTagList.length > 0 && (
              <FlowStep>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    API Layer
                  </Typography>
                  {renderLayer(work.backEndTagList || [])}
                </Box>
                <MdArrowForward size={24} color="#2196F3" />
              </FlowStep>
            )}

            {Array.isArray(work.dbTagList) && work.dbTagList.length > 0 && (
              <FlowStep>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Data Layer
                  </Typography>
                  {renderLayer(work.dbTagList || [])}
                </Box>
                <MdArrowForward size={24} color="#2196F3" />
              </FlowStep>
            )}
          </Box>
        </ArchitectureBox>

        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Technical Stack
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {techStack.map((tech, index) => (
            <Grid item key={tech.name}>
              <Tooltip title={tech.name} TransitionComponent={Zoom} arrow placement="top">
                <Box
                  onMouseEnter={() => setHoveredTag(index)}
                  onMouseLeave={() => setHoveredTag(null)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    background: '#f0f2f5',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    color: hoveredTag === index ? tech.color : 'text.primary',
                    border: `1px solid ${tech.color}`,
                    '&:hover': {
                      background: '#e3e6e9',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${tech.name} technology tag`}
                >
                  {tech.icon}
                  <Typography variant="body2">{tech.name}</Typography>
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <DemoButton
            variant="contained"
            aria-label="View project demo"
            onClick={() => console.log('Demo clicked')}
          >
            View Demo
          </DemoButton>
          <GithubButton
            variant="contained"
            aria-label="View source code on GitHub"
            onClick={() => window.open('https://github.com/username/repo', '_blank')}
          >
            Source Code
          </GithubButton>
          {isLoggedIn && (
            <EditButton
              variant="contained"
              aria-label="Edit project details"
              onClick={() => router.push(`/works/${work.id}`)}
              startIcon={<MdEdit />}
            >
              Edit Project
            </EditButton>
          )}
        </Box>
      </StyledPaper>
    </Container>
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
    paths: data.data.map((work: Work) => ({ params: { workId: work.id } })),
    fallback: true,
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
  //sanitize data
  data.fullDescription = sanitizeHtml(data.fullDescription, {
    allowedAttributes: {
      span: ['style', 'class'],
    },
  })
  return {
    props: {
      work: data,
    },
  }
}
