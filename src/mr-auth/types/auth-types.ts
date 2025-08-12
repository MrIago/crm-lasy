// Fonte única de verdade para roles em tempo de compilação e execução
export const USER_ROLES = ['admin', 'user'] as const
export type UserRole = typeof USER_ROLES[number]

// Constantes nomeadas para evitar strings soltas no código
export const ROLE = {
  ADMIN: 'admin' as UserRole,
  USER: 'user' as UserRole
} as const

interface AuthUser {
    uid: string;
    role: UserRole;
    plan: string;
    name: string;
    email: string;
    photo: string;
}

interface AuthState {
    user: AuthUser | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
}

export type { AuthUser, AuthState };