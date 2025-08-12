'use server'

import { cookies } from 'next/headers'
import { adminAuth } from '@/firebase/firebase-admin'

export async function serverLogout(): Promise<{ success: boolean; error?: string }> {
    try {
        const cookieStore = await cookies()

        // Tenta invalidar a sessão no Firebase se existir um cookie de sessão
        const sessionCookie = cookieStore.get('auth-session')?.value
        if (sessionCookie) {
            try {
                // Verifica e revoga o session cookie no Firebase
                const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
                await adminAuth.revokeRefreshTokens(decodedClaims.uid)
                console.log('Sessão invalidada no Firebase para o usuário:', decodedClaims.uid)
            } catch (sessionError) {
                // Se falhar ao invalidar a sessão, continua com a limpeza dos cookies
                console.warn('Erro ao invalidar sessão no Firebase:', sessionError)
            }
        }

        // Remove os cookies de autenticação
        cookieStore.delete('auth-session')
        cookieStore.delete('auth-user')

        console.log('Logout realizado com sucesso')
        return { success: true }
    } catch (error) {
        console.error('Erro ao fazer logout:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'Um erro desconhecido ocorreu'
        return { success: false, error: errorMessage }
    }
}
