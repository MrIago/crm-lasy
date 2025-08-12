'use server'

import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/firebase/firebase-admin'
import { AuthUser, UserRole, ROLE } from '../types/auth-types'
import { encryptUserData } from '../utils/crypto'

// Tipos para os dados do Firestore
type FirestoreUserData = {
    plan: string;
    role: UserRole;
}

// Configuração padrão de cookies seguros
const COOKIE_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000 // 5 dias

const getSecureCookieConfig = (maxAge: number) => ({
    maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/'
})

// Helper para setar cookie com configuração segura
async function setSecureCookie(name: string, value: string, maxAge: number = COOKIE_EXPIRES_IN) {
    const cookieStore = await cookies()
    cookieStore.set(name, value, getSecureCookieConfig(maxAge))
}

// Helper para buscar ou criar dados do usuário no Firestore
async function getOrCreateUserData(uid: string): Promise<FirestoreUserData> {
    const userDocRef = adminDb.collection("users").doc(uid)
    const userDoc = await userDocRef.get()

    if (!userDoc.exists) {
        const defaultData: FirestoreUserData = {
            plan: "free",
            role: ROLE.USER
        }
        await userDocRef.set(defaultData)
        return defaultData
    }

    const userData = userDoc.data() as FirestoreUserData
    return {
        plan: userData.plan,
        role: userData.role as UserRole
    }
}

export async function createSession(token: string): Promise<{
    success: boolean
    role?: UserRole
    error?: string
}> {
    try {
        // Verifica se o token é válido
        const decodedToken = await adminAuth.verifyIdToken(token)

        // Busca ou cria dados do usuário no Firestore
        const userPermissions = await getOrCreateUserData(decodedToken.uid)

        // Cria o cookie de sessão do Firebase
        const sessionCookie = await adminAuth.createSessionCookie(token, {
            expiresIn: COOKIE_EXPIRES_IN
        })

        // Seta cookie de sessão
        await setSecureCookie('auth-session', sessionCookie)

        // Monta dados do usuário
        const userData: AuthUser = {
            uid: decodedToken.uid,
            role: userPermissions.role,
            plan: userPermissions.plan,
            name: decodedToken.name || "",
            email: decodedToken.email || "",
            photo: decodedToken.picture || ""
        }

        // Criptografa e seta cookie do usuário
        const encryptedUserData = await encryptUserData(userData)
        await setSecureCookie('auth-user', encryptedUserData)

        return { success: true, role: userPermissions.role }
    } catch (error) {
        console.error('Erro ao criar sessão:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'Um erro desconhecido ocorreu'
        return { success: false, error: errorMessage }
    }
}
