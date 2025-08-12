/**
 * MR-THEME Toggle
 * 
 * Botão para alternar tema com ícones animados.
 * Copy-paste friendly, customizável.
 */

"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useThemeStore } from "../store/store"

interface ThemeToggleProps {
    /** Tamanho do botão (padrão: "icon") */
    size?: "sm" | "icon" | "lg"
    /** Variante do botão (padrão: "outline") */
    variant?: "outline" | "ghost" | "secondary"
    /** Classe CSS adicional */
    className?: string
    /** Mostrar texto junto com ícone */
    showText?: boolean
}

export function ThemeToggle({
    size = "icon",
    variant = "outline",
    className = "",
    showText = false
}: ThemeToggleProps) {
    const { resolvedTheme, toggleTheme, isLoading } = useThemeStore()

    const getIcon = () => {
        const iconSize = "h-5 w-5 md:h-[1.2rem] md:w-[1.2rem]"; // Responsivo
        return resolvedTheme === "light" ? 
            <Sun className={iconSize} /> :
            <Moon className={iconSize} />
    }

    const getThemeLabel = () => {
        return resolvedTheme === "light" ? "Tema Claro" : "Tema Escuro"
    }

    // Base classes para o botão (customize conforme seu design system)
    const baseClasses = `
        inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md 
        text-sm font-medium transition-colors focus-visible:outline-none 
        focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none 
        disabled:opacity-50 cursor-pointer
    `

    const sizeClasses = {
        sm: "h-8 px-3 text-xs",
        icon: "h-8 w-8 md:h-9 md:w-9", // Responsivo
        lg: "h-10 px-8 md:h-11 md:px-8"
    }

    const variantClasses = {
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80"
    }

    const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`.trim()

    // Evita hidratação mismatch mostrando um placeholder até carregar
    if (isLoading) {
        return (
            <button
                disabled
                className={buttonClasses}
                aria-label="Carregando tema..."
            >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
                {showText && <span>Carregando...</span>}
            </button>
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className={buttonClasses}
            title={getThemeLabel()}
            aria-label={getThemeLabel()}
        >
            {getIcon()}
            {showText && (
                <span>
                    {resolvedTheme === "light" ? "Claro" : "Escuro"}
                </span>
            )}
        </button>
    )
}

/**
 * Toggle simples sem dependências de UI library
 * Para projetos que não usam shadcn/ui ou similar
 */
export function SimpleThemeToggle({ className = "" }: { className?: string }) {
    const { resolvedTheme, toggleTheme, isLoading } = useThemeStore()

    if (isLoading) {
        return (
            <button
                disabled
                className={`p-2 rounded-md transition-colors ${className}`}
            >
                ☀️
            </button>
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
            title={`Mudar para ${resolvedTheme === 'light' ? 'escuro' : 'claro'}`}
        >
            {resolvedTheme === 'light' ? '🌙' : '☀️'}
        </button>
    )
} 