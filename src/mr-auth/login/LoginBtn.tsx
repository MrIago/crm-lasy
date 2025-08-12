'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '../rbac/MrAuth'
import { clientLogin } from './login'

interface LoginBtnProps {
    className?: string
    onLogin?: () => Promise<void> | void
    redirectPath?: string
}

export default function LoginBtn({ className, onLogin, redirectPath }: LoginBtnProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { setIsActionLoading } = useAuthStore()

    // Desativa o actionLoading quando o LoginBtn monta (útil após logout)
    useEffect(() => {
        setIsActionLoading(false)
    }, [setIsActionLoading])

    const handleLogin = async () => {
        if (isLoading) return

        setIsLoading(true)
        setIsActionLoading(true, 'Entrando...')
        try {
            if (onLogin) {
                await onLogin()
            } else {
                // Usa a função de login padrão
                const result = await clientLogin()
                if (result.success && result.role) {
                    console.log('Login realizado com sucesso! Role:', result.role)
                    // Redireciona para a página de origem ou para a página do role
                    const targetPath = redirectPath || `/${result.role}`

                    // Força um reload completo da página para garantir que os cookies sejam lidos
                    window.location.href = targetPath
                } else {
                    console.error('Falha no login:', result.error)
                    setIsLoading(false)
                    setIsActionLoading(false)
                }
            }
        } catch (error) {
            console.error('Erro no login:', error)
            setIsLoading(false)
            setIsActionLoading(false)
        }
    }

    return (
        <Button
            onClick={handleLogin}
            disabled={isLoading}
            className={`flex items-center gap-3 px-6 py-3 ${className} cursor-pointer`}
            size="lg"
        >
            {isLoading ? (
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="font-logo">Entrando...</span>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <span className="font-logo">Entrar</span>
                </div>
            )}
        </Button>
    )
}
