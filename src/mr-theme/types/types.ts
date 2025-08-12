/**
 * MR-THEME Types
 * 
 * Tipos TypeScript para o sistema de tema.
 * Copy-paste friendly para outros projetos.
 */

export type Theme = 'light' | 'dark' | 'system'

export interface ThemeConfig {
    attribute: string
    defaultTheme: Theme
    enableSystem: boolean
}

export interface ThemeStore {
    // Estado
    theme: Theme
    resolvedTheme: 'light' | 'dark'
    isLoading: boolean
    config: ThemeConfig

    // Actions
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
    updateResolvedTheme: (resolved: 'light' | 'dark') => void
    updateFavicon: (theme: 'light' | 'dark') => void
    initializeTheme: () => (() => void) | undefined
    setThemeConfig: (config: Partial<ThemeConfig>) => void
}

export interface ThemeProviderProps {
    children: React.ReactNode
    attribute?: string
    defaultTheme?: Theme
    enableSystem?: boolean
    disableTransitionOnChange?: boolean
} 