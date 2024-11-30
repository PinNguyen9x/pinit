import { MainLayout } from '@/components/layouts'
import { useAuth } from '@/hooks'
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
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { AiOutlineCloudSync } from 'react-icons/ai'
import { DiPython } from 'react-icons/di'
import { FaDocker, FaNodeJs, FaReact } from 'react-icons/fa'
import { MdCheckCircle, MdEdit } from 'react-icons/md'
import {
  SiExpress,
  SiJavascript,
  SiMongodb,
  SiPython,
  SiRedux,
  SiTailwindcss,
  SiTypescript,
  SiVite,
} from 'react-icons/si'
import { TbJson } from 'react-icons/tb'

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

export default function WorkDetails({ work }: WorkDetailsProps) {
  const [hoveredTag, setHoveredTag] = useState<number | null>(null)
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  if (!work) return null

  const techStack = [
    { icon: <FaDocker size={24} />, name: 'Docker', color: '#2496ED' },
    { icon: <FaReact size={24} />, name: 'ReactJS', color: '#61DAFB' },
    { icon: <FaNodeJs size={24} />, name: 'NodeJS', color: '#339933' },
    { icon: <SiRedux size={24} />, name: 'Redux', color: '#764ABC' },
    { icon: <SiTypescript size={24} />, name: 'TypeScript', color: '#3178C6' },
    { icon: <SiJavascript size={24} />, name: 'JavaScript', color: '#F7DF1E' },
    { icon: <SiExpress size={24} />, name: 'ExpressJS', color: '#000000' },
    { icon: <SiMongodb size={24} />, name: 'MongoDB', color: '#47A248' },
    { icon: <SiVite size={24} />, name: 'Vite', color: '#646CFF' },
    { icon: <TbJson size={24} />, name: 'JSON Server', color: '#000000' },
    { icon: <SiPython size={24} />, name: 'Python', color: '#3776AB' },
    { icon: <DiPython size={24} />, name: 'Faker', color: '#7F5AB6' },
    { icon: <SiTailwindcss size={24} />, name: 'TailwindCSS', color: '#06B6D4' },
    { icon: <DiPython size={24} />, name: 'Gradio', color: '#FF7C00' },
    { icon: <AiOutlineCloudSync size={24} />, name: 'Stable Diffusion', color: '#5C3EE8' },
  ]

  return (
    <Container maxWidth="lg">
      <StyledPaper elevation={0}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {work.title}
        </Typography>

        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
          {work.shortDescription}
        </Typography>

        <Box
          sx={{
            background: '#f8f9fa',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '300px',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              position: 'relative',
            }}
          >
            <Image
              src={work?.thumbnailUrl}
              alt="Project Architecture Diagram"
              layout="fill"
              objectFit="cover"
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <Box
              sx={{
                background: '#ffffff',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                flex: '1',
                minWidth: '200px',
                textAlign: 'left',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Frontend
              </Typography>
              <List dense>
                {[
                  'React Components',
                  'Redux State Management',
                  'TypeScript Integration',
                  'Responsive Design',
                ].map((item, index) => (
                  <ListItem key={index} sx={{ padding: '4px 0' }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}>
                      <MdCheckCircle style={{ color: '#4CAF50' }} />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box
              sx={{
                background: '#ffffff',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                flex: '1',
                minWidth: '200px',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Backend
              </Typography>
              <Typography variant="body2">Node.js + Express API</Typography>
            </Box>
            <Box
              sx={{
                background: '#ffffff',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                flex: '1',
                minWidth: '200px',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Database
              </Typography>
              <Typography variant="body2">MongoDB + Redis Cache</Typography>
            </Box>
          </Box>
        </Box>

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
  const response = await fetch(`${process.env.API_URL}/api/works?_page=1&_limit=3`)
  const data = await response.json()

  return {
    paths: data.data.map((work: Work) => ({ params: { workId: work.id } })),
    fallback: 'blocking',
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
  //   data.fullDescription = sanitizeHtml(data.fullDescription, {
  //     allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  //   })
  return {
    props: {
      work: data,
    },
  }
}
