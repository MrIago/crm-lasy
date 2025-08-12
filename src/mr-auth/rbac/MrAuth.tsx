'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { AuthUser } from '../types/auth-types'
import { create } from 'zustand'
import AuthLoading from '../components/AuthLoading'
import ActionLoading from '../components/ActionLoading'
import { getUserData } from '../actions/getUserData'

// Tempo mínimo para mostrar o loading (evita flash)
const MIN_LOADING_TIME = 1000 // 1 segundo

interface AuthState {
    user: AuthUser | null
    isAuthLoading: boolean
    isActionLoading: boolean
    actionLoadingMessage: string
    setUser: (user: AuthUser | null) => void
    setIsAuthLoading: (loading: boolean) => void
    setIsActionLoading: (loading: boolean, message?: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthLoading: true,
    isActionLoading: false,
    actionLoadingMessage: 'Processando...',
    setUser: (user) => set({ user }),
    setIsAuthLoading: (loading) => set({ isAuthLoading: loading }),
    setIsActionLoading: (loading, message = 'Processando...') => set({
        isActionLoading: loading,
        actionLoadingMessage: message
    })
}))

interface MrAuthProps {
    children: React.ReactNode
}

export default function MrAuth({ children }: MrAuthProps) {
    const { setUser, setIsAuthLoading, setIsActionLoading, isAuthLoading, isActionLoading, actionLoadingMessage } = useAuthStore()
    const pathname = usePathname()

    const fetchUser = React.useCallback(async () => {
        const startTime = Date.now()

        try {
            // Chama a server action ao invés da API route
            const result = await getUserData()
            setUser(result.user)
        } catch (error) {
            console.error('Erro ao buscar usuário:', error)
            setUser(null)
        } finally {
            // Garantir que o loading seja mostrado por pelo menos MIN_LOADING_TIME
            const elapsedTime = Date.now() - startTime

            if (elapsedTime < MIN_LOADING_TIME) {
                setTimeout(() => {
                    setIsAuthLoading(false)
                    // Desativa actionLoading quando auth loading termina e há usuário autenticado
                    setIsActionLoading(false)
                }, MIN_LOADING_TIME - elapsedTime)
            } else {
                setIsAuthLoading(false)
                // Desativa actionLoading quando auth loading termina e há usuário autenticado
                setIsActionLoading(false)
            }
        }
    }, [setUser, setIsAuthLoading, setIsActionLoading])

    // Carrega o usuário na primeira montagem
    React.useEffect(() => {
        fetchUser()
    }, [fetchUser])

    // Revalida usuário a cada mudança de rota para sincronizar com cookies (ex.: pós-logout)
    React.useEffect(() => {
        fetchUser()
    }, [pathname, fetchUser])

    if (isAuthLoading) {
        return <AuthLoading />
    }

    return (
        <>
            {children}
            {isActionLoading && <ActionLoading message={actionLoadingMessage} />}
        </>
    )
} 