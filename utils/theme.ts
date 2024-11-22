import { createTheme, responsiveFontSizes } from '@mui/material/styles'

export let theme = createTheme({
  typography: {
    fontFamily: 'Heebo, sans-serif',
  },
  palette: {
    primary: {
      main: '#FF6464',
    },
    secondary: {
      light: '#EDF7FA',
      main: '#00A8CC',
    },
    error: {
      main: '#f44336',
    },
    text: {
      primary: '#21243D',
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        maxWidthSm: {
          maxWidth: '680px', // default 680px
          '@media (min-width: 600px)': {
            maxWidth: '680px',
          },
        },
        maxWidthMd: {
          maxWidth: '860px', // default 860px
          '@media (min-width: 900px)': {
            maxWidth: '860px',
          },
        },
      },
      defaultProps: {
        maxWidth: 'md',
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: 'black',
          '&:hover, &.active': {
            color: '#FF6464',
          },
        },
      },
      defaultProps: {
        underline: 'hover',
      },
    },
    MuiButton: {
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            color: 'white',
          },
        },
      ],
    },
    MuiChip: {
      styleOverrides: {
        root: {
          paddingInline: 2,
        },
      },
      variants: [
        {
          props: { color: 'secondary' },
          style: {
            color: 'white',
            backgroundColor: '#142850',
            fontWeight: 'bold',
            fontSize: '16px',
          },
        },
        {
          props: { color: 'primary' },
          style: {
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
          },
        },
      ],
    },
  },
})

theme = responsiveFontSizes(theme)

// theme.typography.h3 = {
//   fontSize: '2rem',
//   [theme.breakpoints.up('md')]: {
//     fontSize: '3rem',
//   },
// }
