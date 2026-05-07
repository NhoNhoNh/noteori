import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('fontSize') || 'medium'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const sizes = { small: '14px', medium: '16px', large: '18px' }
    document.documentElement.style.fontSize = sizes[fontSize] || '16px'
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const value = { theme, setTheme, toggleTheme, fontSize, setFontSize }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme phải được sử dụng trong ThemeProvider')
  return context
}
