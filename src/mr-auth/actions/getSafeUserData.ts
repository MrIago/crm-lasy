'use server'

import 'server-only'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/firebase/firebase-admin'
import { AuthUser, UserRole, ROLE } from '../types/auth-types'

type FirestoreUserData = {
    plan: string
    role: UserRole
}

/**
 * Versão segura para obter dados do usuário autenticado.
 * - Valida o session cookie (revogado ou não) via Firebase Admin.
 * - Lê os dados do usuário no Firestore (role/plan) usando o uid do token.
 * - Monta o objeto de usuário a partir de claims + Firestore.
 *
 * Use esta função apenas em contexto de servidor para operações críticas.
 */
export async function getSafeUserData(): Promise<{ user: AuthUser | null; uid: string | null }> {
    try {
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get('auth-session')?.value

        if (!sessionCookie) {
            return { user: null, uid: null }
        }

        // Valida cookie de sessão e checa revogação
        let decoded
        try {
            decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
        } catch {
            // Cookie inválido ou revogado
            return { user: null, uid: null }
        }

        // Busca dados do usuário no Firestore
        const userDoc = await adminDb.collection('users').doc(decoded.uid).get()

        let firestoreData: FirestoreUserData | null = null
        if (userDoc.exists) {
            const data = userDoc.data() as Partial<FirestoreUserData>
            if (data && typeof data.plan === 'string' && typeof data.role === 'string') {
                firestoreData = { plan: data.plan, role: data.role as UserRole }
            }
        }

        // Fallback seguro caso documento não exista ou esteja mal formatado
        if (!firestoreData) {
            firestoreData = { plan: 'free', role: ROLE.USER }
        }

        const user: AuthUser = {
            uid: decoded.uid,
            role: firestoreData.role,
            plan: firestoreData.plan,
            name: decoded.name ?? '',
            email: decoded.email ?? '',
            photo: (decoded as { picture?: string }).picture ?? ''
        }

        return { user, uid: decoded.uid }
    } catch (error) {
        console.error('Erro em getSafeUserData:', error)
        return { user: null, uid: null }
    }
}


