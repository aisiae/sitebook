import { createContext, useContext, useState, useEffect } from 'react'

export const LIGHT = {
  primary:       '#534AB7',
  primaryLight:  '#EEEDFE',
  bg:            '#f5f4ff',
  dark:          '#2d2a6e',
  cardBorder:    '0.5px solid rgba(83,74,183,0.12)',
  cardRadius:    '14px',
  btnRadius:     '10px',
  cardBg:        '#fff',
  textPrimary:   '#1a1a2e',
  textSub:       '#555',
  textMuted:     '#999',
  navBg:         'rgba(255,255,255,0.88)',
  navBorder:     '0.5px solid rgba(83,74,183,0.10)',
  rowHoverBg:    '#f8f7ff',
  tableHeaderBg: '#faf9ff',
  sidebarBg:     '#fff',
  divider:       'rgba(83,74,183,0.08)',
  inputBg:       '#fff',
  inputBorder:   '1px solid #e0dff8',
  subBorder:     '#e0dff8',
  deleteOverlay: 'rgba(255,255,255,0.97)',
  tagBg:         '#f8f7ff',
  footerBg:      '#1e1c4a',
  footerCta:     '#2d2a6e',
  isDark:        false,
}

export const DARK = {
  primary:       '#7B74E0',
  primaryLight:  '#1e1c4a',
  bg:            '#0f0e1a',
  dark:          '#c4bfff',
  cardBorder:    '0.5px solid rgba(123,116,224,0.20)',
  cardRadius:    '14px',
  btnRadius:     '10px',
  cardBg:        '#1a1832',
  textPrimary:   '#e8e6ff',
  textSub:       '#aca8cc',
  textMuted:     '#6b688e',
  navBg:         'rgba(15,14,26,0.92)',
  navBorder:     '0.5px solid rgba(123,116,224,0.15)',
  rowHoverBg:    '#211f3a',
  tableHeaderBg: '#12102a',
  sidebarBg:     '#12102a',
  divider:       'rgba(123,116,224,0.10)',
  inputBg:       '#1a1832',
  inputBorder:   '1px solid #2a2748',
  subBorder:     '#2a2748',
  deleteOverlay: 'rgba(20,18,40,0.97)',
  tagBg:         '#211f3a',
  footerBg:      '#07060f',
  footerCta:     '#0a0918',
  isDark:        true,
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('sitebook-theme') === 'dark' } catch { return false }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('sitebook-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(d => !d), T: isDark ? DARK : LIGHT }}>
      {children}
    </ThemeContext.Provider>
  )
}

/** Returns theme color tokens */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  return ctx ? ctx.T : LIGHT
}

/** Returns isDark + toggleTheme */
export function useThemeControl() {
  const ctx = useContext(ThemeContext)
  if (!ctx) return { isDark: false, toggleTheme: () => {} }
  return { isDark: ctx.isDark, toggleTheme: ctx.toggleTheme }
}
