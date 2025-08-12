'use server'

import { cookies } from 'next/headers'
import { AuthUser } from '../types/auth-types'
import { decryptUserData } from '../utils/crypto'

export async function getUserData(): Promise<{ user: AuthUser | null }> {
    try {
        const cookieStore = await cookies()
        const userCookie = cookieStore.get('auth-user')?.value

        if (!userCookie) {
            return { user: null }
        }

        try {
            // Descriptografa os dados do usuário
            const userData: AuthUser = await decryptUserData(userCookie)
            return { user: userData }
        } catch (error) {
            // Cookie user inválido ou erro na descriptografia
            console.log('Erro ao descriptografar dados do usuário:', error instanceof Error ? error.message : 'Erro desconhecido')
            return { user: null }
        }
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error)
        return { user: null }
    }
}
