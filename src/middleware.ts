import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decryptUserData } from '@/mr-auth/utils/crypto'

export async function middleware(request: NextRequest) {
    try {
        // Pega os cookies
        const sessionCookie = request.cookies.get('auth-session')?.value
        const userCookie = request.cookies.get('auth-user')?.value

        // Se não tiver cookies, redireciona para login
        if (!sessionCookie || !userCookie) {
            return NextResponse.redirect(new URL('/entrar', request.url))
        }

        // Descriptografa os dados do usuário
        const userData = await decryptUserData(userCookie)

        // Exemplo de proteção de rota baseada em role
        if (request.nextUrl.pathname.startsWith('/admin') && userData.role !== 'admin') {
            return NextResponse.redirect(new URL('/acesso-negado', request.url))
        }

        return NextResponse.next()
    } catch {
        // Se der erro na descriptografia ou validação, redireciona para login
        return NextResponse.redirect(new URL('/entrar', request.url))
    }
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/user/:path*'
    ]
}
