import { MainLayout } from '@/components/layouts'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import { FaBriefcase, FaGraduationCap, FaHeart, FaPhone, FaUserCircle } from 'react-icons/fa'

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '2rem',
  marginBottom: '2rem',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}))

function AboutPage() {
  const [personalInfo, setPersonalInfo] = useState({
    name: 'Pin Nguyen',
    birthYear: '1995',
    gender: 'Male',
    hometown: 'Ho Chi Minh City',
    phone: '+84 0906901419',
  })

  const [education] = useState([
    {
      degree: 'Bachelor of Engineering',
      institution: 'University of Science VNUHCM',
      major: 'Software Engineering',
      year: '2013-2017',
    },
  ])

  const [workExperience] = useState([
    {
      company: 'Aperia Solutions',
      position: 'Senior Frontend Developer',
      duration: '2019-2024',
      products: ['Frontend Framework', 'CRM System', 'Banking'],
    },
    {
      company: 'Nashtech',
      position: 'Senior Software Engineer',
      duration: '2018-2019',
      products: ['E-commerce Platform', 'CRM System'],
    },
    {
      company: 'iFinancial',
      position: 'Software Engineer',
      duration: '2017-2018',
      products: ['E-commerce Platform', 'Banking System'],
    },
    {
      company: 'ASWhite Global',
      position: 'Software Engineer',
      duration: '2017',
      products: ['Insurance'],
    },
  ])

  const [hobbies] = useState(['Coding', 'Reading', 'Traveling', 'Photography'])
  const [programmingLanguages] = useState(['JavaScript', 'Python', 'Java', 'TypeScript'])

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <FaUserCircle size={64} color="#1976d2" />
        <Typography variant="h3" component="h1" gutterBottom>
          About Me
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <FaUserCircle style={{ marginRight: '8px' }} /> Personal Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Name"
                  secondary={personalInfo.name}
                  primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Birth Year"
                  secondary={personalInfo.birthYear}
                  primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Gender"
                  secondary={personalInfo.gender}
                  primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FaPhone style={{ marginRight: '8px' }} /> Phone
                    </Box>
                  }
                  secondary={personalInfo.phone}
                  primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Hometown"
                  secondary={personalInfo.hometown}
                  primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
            </List>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <FaGraduationCap style={{ marginRight: '8px' }} /> Education
            </Typography>
            {education.map((edu, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{edu.degree}</Typography>
                  <Typography color="textSecondary">{edu.institution}</Typography>
                  <Typography variant="body2">
                    {edu.major} ({edu.year})
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </StyledPaper>
        </Grid>

        <Grid item xs={12}>
          <StyledPaper elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <FaBriefcase style={{ marginRight: '8px' }} /> Work Experience
            </Typography>
            {workExperience.map((work, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="h6">{work.company}</Typography>
                <Typography color="textSecondary">{work.position}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {work.duration}
                </Typography>
                <Typography variant="subtitle2">Products Developed:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {work.products.map((product, idx) => (
                    <Chip key={idx} label={product} variant="outlined" />
                  ))}
                </Box>
                {index < workExperience.length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            ))}
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <FaHeart style={{ marginRight: '8px' }} /> Hobbies
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {hobbies.map((hobby, index) => (
                <Chip key={index} label={hobby} color="primary" />
              ))}
            </Box>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h5" gutterBottom>
              Programming Languages
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {programmingLanguages.map((lang, index) => (
                <Chip key={index} label={lang} color="secondary" />
              ))}
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default AboutPage

AboutPage.Layout = MainLayout
