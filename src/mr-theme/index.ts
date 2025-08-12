/**
 * MR-THEME
 * 
 * Sistema de tema copy-paste para React.
 * Export principal para facilitar imports.
 */

// Componentes
export { ThemeProvider } from './components/provider'
export { ThemeToggle, SimpleThemeToggle } from './components/toggle'

// Store e hook
export { useThemeStore } from './store/store'

// Tipos
export type { Theme, ThemeStore, ThemeProviderProps } from './types/types' 