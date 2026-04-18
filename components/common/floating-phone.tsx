import { Box, keyframes, Tooltip, useTheme } from '@mui/material'
import { FaPhoneAlt } from 'react-icons/fa'

const PHONE = '+84906901419'
const PHONE_DISPLAY = '+84 906 901 419'

const ping = keyframes`
  0%   { transform: scale(0.95); opacity: 0.8; }
  80%  { transform: scale(1.6);  opacity: 0;   }
  100% { transform: scale(1.6);  opacity: 0;   }
`

export function FloatingPhone() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Tooltip title={`Call ${PHONE_DISPLAY}`} placement="left" arrow>
      <Box
        component="a"
        href={`tel:${PHONE}`}
        aria-label={`Call ${PHONE_DISPLAY}`}
        sx={{
          position: 'fixed',
          right: { xs: 16, md: 24 },
          bottom: { xs: 16, md: 24 },
          zIndex: 1300,
          width: { xs: 50, md: 56 },
          height: { xs: 50, md: 56 },
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          background: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)',
          boxShadow: isDark
            ? '0 10px 28px -8px rgba(220,38,38,0.55), 0 0 0 1px rgba(255,255,255,0.06)'
            : '0 10px 28px -8px rgba(220,38,38,0.4), 0 0 0 1px rgba(0,0,0,0.04)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          textDecoration: 'none',
          '&:hover': {
            transform: 'translateY(-2px) scale(1.04)',
            boxShadow: isDark
              ? '0 14px 34px -8px rgba(220,38,38,0.7), 0 0 0 1px rgba(255,255,255,0.1)'
              : '0 14px 34px -8px rgba(220,38,38,0.55), 0 0 0 1px rgba(0,0,0,0.06)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(220,38,38,0.6)',
            animation: `${ping} 1.8s cubic-bezier(0,0,0.2,1) infinite`,
            pointerEvents: 'none',
          },
        }}
      >
        <FaPhoneAlt size={18} />
      </Box>
    </Tooltip>
  )
}
