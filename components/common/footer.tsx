import { Facebook, Instagram, Twitter, LinkedIn } from '@mui/icons-material'
import { Box, Icon, Stack, Typography } from '@mui/material'

export function Footer() {
  const socialLinks = [
    {
      icon: Facebook,
      url: 'https://www.facebook.com',
    },
    {
      icon: Twitter,
      url: 'https://www.twitter.com',
    },
    {
      icon: Instagram,
      url: 'https://www.instagram.com',
    },
    {
      icon: LinkedIn,
      url: 'https://www.linkedin.com',
    },
  ]
  return (
    <Box component="footer" sx={{ py: 3, px: 2, textAlign: 'center' }}>
      <Stack direction="row" justifyContent="center">
        {socialLinks.map((link, index) => (
          <Box
            component="a"
            href={link.url}
            key={index}
            p={2}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon width={5} height={5} component={link.icon} sx={{ fontSize: 48 }} />
          </Box>
        ))}
      </Stack>
      <Typography>Copyright ©{new Date().getFullYear()} All rights reserved </Typography>
    </Box>
  )
}
