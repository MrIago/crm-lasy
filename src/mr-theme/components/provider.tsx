/**
 * MR-THEME Provider
 * 
 * Provider React SSR-safe com inicialização automática do tema.
 * Copy-paste friendly para qualquer projeto Next.js.
 */

"use client"

import * as React from "react"
import { useThemeStore } from "../store/store"
import type { ThemeProviderProps } from "../types/types"

export function ThemeProvider({
    children,
    attribute = "class",
    defaultTheme = "system",
    enableSystem = true,
    disableTransitionOnChange = false
}: ThemeProviderProps) {
    const { isLoading, initializeTheme, setThemeConfig } = useThemeStore()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)

        // Configura as opções do tema na store
        setThemeConfig({
            attribute,
            defaultTheme,
            enableSystem
        })

        // Inicializa o tema no cliente
        if (typeof window !== 'undefined') {
            const cleanup = initializeTheme()
            return cleanup
        }
    }, [initializeTheme, setThemeConfig, attribute, defaultTheme, enableSystem])

    React.useEffect(() => {
        // Previne transições durante mudanças de tema se habilitado
        if (disableTransitionOnChange && mounted) {
            const style = document.createElement('style')
            style.innerHTML = `
                *, *::before, *::after {
                    transition: none !important;
                    animation: none !important;
                }
            `
            document.head.appendChild(style)

            // Remove após um frame para permitir transições normais
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    document.head.removeChild(style)
                })
            })
        }
    }, [disableTransitionOnChange, mounted])

    // Previne flash durante hidratação - mostra conteúdo apenas quando:
    // 1. Componente foi montado no cliente
    // 2. Tema foi inicializado (não está mais carregando)
    if (!mounted || isLoading) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>
    }

    return <>{children}</>
} 