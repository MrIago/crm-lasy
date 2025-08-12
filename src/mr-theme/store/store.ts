/**
 * MR-THEME Store
 * 
 * Zustand store para gerenciamento de tema.
 * Copy-paste friendly, zero-config, performático.
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Theme, ThemeStore, ThemeConfig } from '../types/types'

export const useThemeStore = create<ThemeStore>()(
    devtools(
        persist(
            (set, get) => ({
                // Estado inicial
                theme: 'system' as Theme,
                resolvedTheme: 'light' as 'light' | 'dark',
                isLoading: true,
                config: {
                    attribute: 'class',
                    defaultTheme: 'system' as Theme,
                    enableSystem: true
                },

                // Configura opções do tema
                setThemeConfig: (newConfig: Partial<ThemeConfig>) => {
                    set((state) => ({
                        config: { ...state.config, ...newConfig }
                    }), false, 'setThemeConfig')
                },

                // Seta tema e atualiza favicon
                setTheme: (theme: Theme) => {
                    const { config } = get()

                    // Se system está desabilitado e tentou usar system, usa defaultTheme
                    const actualTheme = (!config.enableSystem && theme === 'system')
                        ? config.defaultTheme
                        : theme

                    set({ theme: actualTheme }, false, 'setTheme')

                    // Aplica tema no documento
                    const root = document.documentElement

                    if (config.attribute === 'class') {
                        root.classList.remove('light', 'dark')
                    } else {
                        root.removeAttribute(`data-${config.attribute}`)
                    }

                    let resolvedTheme: 'light' | 'dark'

                    if (actualTheme === 'system') {
                        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                        resolvedTheme = systemTheme

                        if (config.attribute === 'class') {
                            root.classList.add(systemTheme)
                        } else {
                            root.setAttribute(`data-${config.attribute}`, systemTheme)
                        }
                    } else {
                        resolvedTheme = actualTheme

                        if (config.attribute === 'class') {
                            root.classList.add(actualTheme)
                        } else {
                            root.setAttribute(`data-${config.attribute}`, actualTheme)
                        }
                    }

                    // Atualiza estado resolvido e favicon
                    get().updateResolvedTheme(resolvedTheme)
                    get().updateFavicon(resolvedTheme)
                },

                // Alterna entre light/dark (ignora system)
                toggleTheme: () => {
                    const { theme, resolvedTheme, config } = get()

                    if (!config.enableSystem && theme === 'system') {
                        // Se system está desabilitado, alterna baseado no tema resolvido
                        const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
                        get().setTheme(newTheme)
                    } else {
                        const newTheme = theme === 'system'
                            ? (resolvedTheme === 'light' ? 'dark' : 'light')
                            : (theme === 'light' ? 'dark' : 'light')

                        get().setTheme(newTheme)
                    }
                },

                // Atualiza tema resolvido (usado internamente)
                updateResolvedTheme: (resolved: 'light' | 'dark') => {
                    set({ resolvedTheme: resolved }, false, 'updateResolvedTheme')
                },

                // Atualiza favicon baseado no tema
                updateFavicon: (theme: 'light' | 'dark') => {
                    // Remove favicons existentes
                    const existingFavicons = document.querySelectorAll('link[rel="icon"]')
                    existingFavicons.forEach(favicon => favicon.remove())

                    // Adiciona favicon correto
                    const favicon = document.createElement('link')
                    favicon.rel = 'icon'
                    favicon.type = 'image/x-icon'

                    // 🎨 CUSTOMIZE: Altere aqui os caminhos dos favicons
                    favicon.href = theme === 'dark' ? '/favicon-dark.ico' : '/favicon.ico'
                    favicon.href += `?v=${Date.now()}` // Cache bust

                    document.head.appendChild(favicon)
                },

                // Inicialização (detecta tema do sistema, aplica classes)
                initializeTheme: () => {
                    const { theme, config } = get()

                    // Usa tema padrão se não houver tema persistido ou se system estiver desabilitado
                    const initialTheme = theme || config.defaultTheme
                    const actualTheme = (!config.enableSystem && initialTheme === 'system')
                        ? config.defaultTheme
                        : initialTheme

                    // Detecta preferência do sistema
                    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
                    const systemTheme = mediaQuery.matches ? 'dark' : 'light'

                    // Resolve tema atual
                    const resolvedTheme = actualTheme === 'system' ? systemTheme : actualTheme

                    // Aplica classes CSS ou data attributes
                    const root = document.documentElement

                    if (config.attribute === 'class') {
                        root.classList.remove('light', 'dark')
                        root.classList.add(resolvedTheme)
                    } else {
                        root.removeAttribute(`data-${config.attribute}`)
                        root.setAttribute(`data-${config.attribute}`, resolvedTheme)
                    }

                    // Atualiza estado
                    set({
                        theme: actualTheme,
                        resolvedTheme,
                        isLoading: false
                    }, false, 'initializeTheme')

                    // Atualiza favicon
                    get().updateFavicon(resolvedTheme)

                    // Escuta mudanças no tema do sistema (apenas se system estiver habilitado)
                    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
                        if (config.enableSystem && get().theme === 'system') {
                            const newSystemTheme = e.matches ? 'dark' : 'light'

                            if (config.attribute === 'class') {
                                root.classList.remove('light', 'dark')
                                root.classList.add(newSystemTheme)
                            } else {
                                root.removeAttribute(`data-${config.attribute}`)
                                root.setAttribute(`data-${config.attribute}`, newSystemTheme)
                            }

                            get().updateResolvedTheme(newSystemTheme)
                            get().updateFavicon(newSystemTheme)
                        }
                    }

                    if (config.enableSystem) {
                        mediaQuery.addEventListener('change', handleSystemThemeChange)
                    }

                    // Cleanup function
                    return () => {
                        if (config.enableSystem) {
                            mediaQuery.removeEventListener('change', handleSystemThemeChange)
                        }
                    }
                }
            }),
            {
                // 🎨 CUSTOMIZE: Altere a chave do localStorage
                name: 'mr-theme-store',
                partialize: (state) => ({
                    theme: state.theme,
                    config: state.config
                })
            }
        ),
        {
            name: 'mr-theme-store'
        }
    )
) 