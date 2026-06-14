import { createContext, useContext } from 'react'

interface ThemeColorModeContextType {
  toggleColorMode: () => void
  mode: 'light' | 'dark'
}

export const ThemeColorModeContext = createContext<ThemeColorModeContextType>({
  toggleColorMode: () => {},
  mode: 'dark',
})

export const useThemeMode = () => useContext(ThemeColorModeContext)
