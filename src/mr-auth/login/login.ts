'use client'

import { auth } from '@/firebase/firebase-client'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { createSession } from './createSession'

export async function clientLogin(): Promise<{
    success: boolean
    role?: string
    error?: string
}> {
    try {
        // Login com google popup
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)

        // Get token do firebase auth
        const token = await result.user.getIdToken()

        // Cria cookies: session, user, hasRole, hasPlan
        // recebe o objeto de resultado da sessão
        const sessionResult = await createSession(token)
        if (!sessionResult.success) {
            throw new Error(sessionResult.error || 'Erro ao criar sessão')
        }

        // Logout do firebase auth client
        // apaga sessão local e usa apenas o cookie a partir daí
        await signOut(auth)

        return { success: true, role: sessionResult.role }
    } catch (error) {
        console.error('Erro no login:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'Um erro desconhecido ocorreu'
        return { success: false, error: errorMessage }
    }
}