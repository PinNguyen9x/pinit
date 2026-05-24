import { MainLayout } from '@/components/layouts'
import avatar from '@/images/avatar.png'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import Image from 'next/image'
import {
  FaAward,
  FaBriefcase,
  FaCertificate,
  FaEnvelope,
  FaExternalLinkAlt,
  FaGraduationCap,
  FaHeart,
  FaMapMarkerAlt,
  FaPhone,
} from 'react-icons/fa'

const personal = {
  name: 'Pin Nguyen',
  role: 'Full-Stack Engineer · Data Platforms',
  bio: 'Full-stack engineer with 8+ years of experience building web applications and data platforms. Focused on scalable architectures, real-time pipelines, and polished user interfaces.',
  birthYear: '1995',
  location: 'Ho Chi Minh City, Vietnam',
  phone: '+84 090 690 1419',
  email: 'nguyenthanhpin95@gmail.com',
}

const workExperience = [
  {
    company: 'Aperia Solutions',
    position: 'Senior Frontend Developer',
    duration: '2019 — 2024',
    products: ['Frontend Framework', 'CRM System', 'Banking'],
  },
  {
    company: 'Nashtech',
    position: 'Senior Software Engineer',
    duration: '2018 — 2019',
    products: ['E-commerce Platform', 'CRM System'],
  },
  {
    company: 'iFinancial',
    position: 'Software Engineer',
    duration: '2017 — 2018',
    products: ['E-commerce Platform', 'Banking System'],
  },
  {
    company: 'ASWhite Global',
    position: 'Software Engineer',
    duration: '2017',
    products: ['Insurance'],
  },
]

const education = [
  {
    degree: 'Bachelor of Engineering',
    institution: 'University of Science — VNUHCM',
    major: 'Software Engineering',
    year: '2013 — 2017',
  },
]

interface Certificate {
  name: string
  issuer: string
  date: string
  credentialUrl?: string
}

// Placeholder certificates — replace with your real ones.
const certificates: Certificate[] = [
  {
    name: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    date: '2024',
    credentialUrl: '#',
  },
  {
    name: 'Professional Scrum Master I',
    issuer: 'Scrum.org',
    date: '2023',
    credentialUrl: '#',
  },
  {
    name: 'Meta Front-End Developer Professional Certificate',
    issuer: 'Meta / Coursera',
    date: '2022',
    credentialUrl: '#',
  },
]

const programmingLanguages = ['TypeScript', 'JavaScript', 'Go', 'Java', 'Python']
const frameworks = ['React', 'Next.js', 'Node.js', 'Express', 'Spring Boot']
const dataTools = ['Kafka', 'RabbitMQ', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker']
const hobbies = ['Coding', 'Reading', 'Traveling', 'Photography']

function SectionHeading({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Typography
      component="h2"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        pl: 1.5,
        mb: 3,
        fontWeight: 700,
        fontSize: { xs: '1.15rem', md: '1.3rem' },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '0.2em',
          bottom: '0.2em',
          width: '3px',
          bgcolor: 'primary.main',
          borderRadius: '2px',
        },
      }}
    >
      <Box component="span" sx={{ color: 'primary.main', display: 'inline-flex' }}>
        {icon}
      </Box>
      {children}
    </Typography>
  )
}

function AboutPage() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const panelSx = {
    p: { xs: 2.5, md: 3 },
    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 2,
    transition: 'border-color 0.2s, background-color 0.2s',
    '&:hover': {
      borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
    },
  }

  const infoRowSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    py: 0.75,
  }

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 8, md: 12 } }}>
      {/* Hero */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 3, md: 5 }}
        alignItems={{ xs: 'center', md: 'flex-start' }}
        textAlign={{ xs: 'center', md: 'left' }}
        mb={{ xs: 6, md: 8 }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: 130, md: 160 },
            height: { xs: 130, md: 160 },
            flexShrink: 0,
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg, #16a34a, #10b981, #84cc16, #34d399, #16a34a)',
              opacity: isDark ? 0.55 : 0.45,
              filter: 'blur(1px)',
            }}
          />
          <Avatar
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              border: `3px solid ${isDark ? '#0a0a0a' : '#ffffff'}`,
              boxShadow: isDark
                ? '0 0 0 1px rgba(255,255,255,0.08), 0 20px 40px rgba(0,0,0,0.55)'
                : '0 0 0 1px rgba(0,0,0,0.06), 0 20px 40px rgba(0,0,0,0.12)',
            }}
          >
            <Image
              src={avatar}
              alt={personal.name}
              width={160}
              height={160}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              priority
            />
          </Avatar>
        </Box>

        <Box flex={1}>
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              letterSpacing: '0.1em',
              fontSize: '0.7rem',
              display: 'block',
              mb: 1,
            }}
          >
            {personal.role}
          </Typography>
          <Typography
            component="h1"
            fontWeight={800}
            letterSpacing="-0.03em"
            lineHeight={1.15}
            mb={2}
            sx={{ fontSize: { xs: '2rem', md: '2.75rem' } }}
          >
            {personal.name}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.75, mb: 3 }}
          >
            {personal.bio}
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            flexWrap="wrap"
            useFlexGap
            justifyContent={{ xs: 'center', md: 'flex-start' }}
          >
            <Button
              component="a"
              href={`mailto:${personal.email}`}
              variant="contained"
              color="primary"
              disableElevation
              startIcon={<FaEnvelope />}
              sx={{ borderRadius: '8px', px: 2.5, py: 1, fontWeight: 600, textTransform: 'none' }}
            >
              Contact
            </Button>
            <Button
              component="a"
              href="/blog"
              variant="outlined"
              sx={{
                borderRadius: '8px',
                px: 2.5,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                color: 'text.primary',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                },
              }}
            >
              Read Blog
            </Button>
          </Stack>
        </Box>
      </Stack>

      <Grid container spacing={{ xs: 3, md: 4 }}>
        {/* Personal Info */}
        <Grid item xs={12} md={5}>
          <Box sx={panelSx}>
            <SectionHeading icon={<FaMapMarkerAlt size={18} />}>Personal</SectionHeading>
            <Stack divider={<Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }} />}>
              <Box sx={infoRowSx}>
                <Typography
                  variant="caption"
                  sx={{ minWidth: 90, color: 'text.disabled', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}
                >
                  Name
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {personal.name}
                </Typography>
              </Box>
              <Box sx={infoRowSx}>
                <Typography
                  variant="caption"
                  sx={{ minWidth: 90, color: 'text.disabled', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}
                >
                  Birth Year
                </Typography>
                <Typography variant="body2">{personal.birthYear}</Typography>
              </Box>
              <Box sx={infoRowSx}>
                <Typography
                  variant="caption"
                  sx={{ minWidth: 90, color: 'text.disabled', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}
                >
                  Location
                </Typography>
                <Typography variant="body2">{personal.location}</Typography>
              </Box>
              <Box sx={infoRowSx}>
                <Typography
                  variant="caption"
                  sx={{ minWidth: 90, color: 'text.disabled', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}
                >
                  <FaPhone size={11} style={{ marginRight: 4 }} />
                  Phone
                </Typography>
                <Typography variant="body2" component="a" href={`tel:${personal.phone}`} sx={{ color: 'inherit', '&:hover': { color: 'primary.main' } }}>
                  {personal.phone}
                </Typography>
              </Box>
              <Box sx={infoRowSx}>
                <Typography
                  variant="caption"
                  sx={{ minWidth: 90, color: 'text.disabled', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.72rem', textTransform: 'uppercase' }}
                >
                  Email
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href={`mailto:${personal.email}`}
                  sx={{ color: 'inherit', '&:hover': { color: 'primary.main' }, wordBreak: 'break-all' }}
                >
                  {personal.email}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>

        {/* Education */}
        <Grid item xs={12} md={7}>
          <Box sx={panelSx}>
            <SectionHeading icon={<FaGraduationCap size={18} />}>Education</SectionHeading>
            <Stack spacing={2}>
              {education.map((edu) => (
                <Box key={edu.institution}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {edu.degree}
                  </Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={500} mb={0.5}>
                    {edu.institution}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {edu.major} · {edu.year}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Grid>

        {/* Experience — Timeline */}
        <Grid item xs={12}>
          <Box sx={panelSx}>
            <SectionHeading icon={<FaBriefcase size={18} />}>Work Experience</SectionHeading>
            <Box sx={{ position: 'relative', pl: { xs: 2.5, md: 3 } }}>
              {/* Vertical line */}
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: 4,
                  top: 6,
                  bottom: 6,
                  width: '2px',
                  bgcolor: theme.palette.divider,
                }}
              />
              <Stack spacing={3.5}>
                {workExperience.map((w) => (
                  <Box key={`${w.company}-${w.duration}`} sx={{ position: 'relative' }}>
                    {/* Dot */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: { xs: -20, md: -24 },
                        top: 6,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        boxShadow: `0 0 0 4px ${isDark ? 'rgba(22,163,74,0.15)' : 'rgba(22,163,74,0.12)'}`,
                      }}
                    />
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'baseline' }}
                      spacing={0.5}
                      mb={0.75}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {w.position}
                        </Typography>
                        <Typography variant="body2" color="primary.main" fontWeight={500}>
                          {w.company}
                        </Typography>
                      </Box>
                      <Chip
                        label={w.duration}
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: 22,
                          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                          color: 'text.secondary',
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                      {w.products.map((p) => (
                        <Chip
                          key={p}
                          label={p}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            height: 22,
                            borderColor: theme.palette.divider,
                            color: 'text.secondary',
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </Grid>

        {/* Certificates */}
        <Grid item xs={12}>
          <Box sx={panelSx}>
            <SectionHeading icon={<FaCertificate size={18} />}>Certificates</SectionHeading>
            <Grid container spacing={2}>
              {certificates.map((cert) => (
                <Grid item xs={12} sm={6} md={4} key={cert.name}>
                  <Box
                    sx={{
                      p: 2.25,
                      height: '100%',
                      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)',
                        boxShadow: isDark
                          ? '0 8px 24px -12px rgba(22,163,74,0.45)'
                          : '0 8px 24px -12px rgba(22,163,74,0.25)',
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.main',
                          bgcolor: isDark ? 'rgba(22,163,74,0.12)' : 'rgba(22,163,74,0.08)',
                          border: `1px solid ${isDark ? 'rgba(22,163,74,0.22)' : 'rgba(22,163,74,0.18)'}`,
                          flexShrink: 0,
                        }}
                      >
                        <FaAward size={14} />
                      </Box>
                      <Chip
                        label={cert.date}
                        size="small"
                        sx={{
                          fontSize: '0.68rem',
                          height: 20,
                          bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                          color: 'text.secondary',
                          fontWeight: 600,
                          ml: 'auto',
                        }}
                      />
                    </Stack>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ lineHeight: 1.35, fontSize: '0.9rem' }}
                    >
                      {cert.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {cert.issuer}
                    </Typography>
                    {cert.credentialUrl && (
                      <Box
                        component="a"
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          mt: 'auto',
                          pt: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.75,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        View credential <FaExternalLinkAlt size={10} />
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        {/* Skills */}
        <Grid item xs={12} md={8}>
          <Box sx={panelSx}>
            <SectionHeading icon={<FaBriefcase size={18} />}>Skills</SectionHeading>
            <Stack spacing={2.5}>
              {[
                { label: 'Languages', items: programmingLanguages },
                { label: 'Frameworks', items: frameworks },
                { label: 'Data & Infra', items: dataTools },
              ].map((group) => (
                <Box key={group.label}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'text.disabled',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      mb: 1,
                    }}
                  >
                    {group.label}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                    {group.items.map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        size="small"
                        sx={{
                          fontSize: '0.75rem',
                          height: 26,
                          px: 0.5,
                          bgcolor: isDark ? 'rgba(22,163,74,0.1)' : 'rgba(22,163,74,0.07)',
                          color: 'primary.main',
                          border: '1px solid rgba(22,163,74,0.25)',
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Grid>

        {/* Hobbies */}
        <Grid item xs={12} md={4}>
          <Box sx={panelSx}>
            <SectionHeading icon={<FaHeart size={16} />}>Hobbies</SectionHeading>
            <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
              {hobbies.map((hobby) => (
                <Chip
                  key={hobby}
                  label={hobby}
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    height: 26,
                    px: 0.5,
                    bgcolor: isDark ? 'rgba(52,211,153,0.1)' : 'rgba(5,150,105,0.07)',
                    color: 'secondary.main',
                    border: `1px solid ${isDark ? 'rgba(52,211,153,0.25)' : 'rgba(5,150,105,0.25)'}`,
                    fontWeight: 500,
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default AboutPage

AboutPage.Layout = MainLayout
