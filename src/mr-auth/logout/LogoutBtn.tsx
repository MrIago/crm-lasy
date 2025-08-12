'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '../rbac/MrAuth'
import { serverLogout } from './logout'

interface LogoutBtnProps {
    className?: string
    children?: React.ReactNode
}

export default function LogoutBtn({
    className,
    children = 'Sair'
}: LogoutBtnProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { setIsActionLoading } = useAuthStore()
    const router = useRouter()

    const handleLogout = async () => {
        if (isLoading) return

        setIsLoading(true)
        setIsActionLoading(true, 'Saindo...')
        try {
            const result = await serverLogout()
            if (result.success) {
                // Redireciona para a home após o logout
                router.push('/')
                // NÃO desativamos o loading aqui - será desativado quando o LoginBtn montar na home
            } else {
                console.error('Erro no logout:', result.error)
                setIsLoading(false)
                setIsActionLoading(false)
            }
        } catch (error) {
            console.error('Erro inesperado durante o logout:', error)
            setIsLoading(false)
            setIsActionLoading(false)
        }
    }

    return (
        <Button
            onClick={handleLogout}
            disabled={isLoading}
            className={className}
            variant="destructive"
        >
            {isLoading ? 'Saindo...' : children}
        </Button>
    )
}
