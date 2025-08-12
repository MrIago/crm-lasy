import { AuthUser } from '../types/auth-types'

// Helper para descriptografar dados usando Web Crypto API (compatível com edge runtime)
export async function decryptUserData(encryptedData: string): Promise<AuthUser> {
    const secretKey = process.env.SECRET_USER_KEY!
    if (!secretKey) {
        throw new Error('SECRET_USER_KEY é obrigatória nas variáveis de ambiente')
    }

    try {
        // Converte a chave em ArrayBuffer
        const encoder = new TextEncoder()
        const decoder = new TextDecoder()
        const keyData = encoder.encode(secretKey.padEnd(32, '0').slice(0, 32)) // Garante 32 bytes
        
        // Importa a chave para uso com AES-GCM
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        )

        // Decodifica de base64
        const combined = new Uint8Array(
            atob(encryptedData)
                .split('')
                .map(char => char.charCodeAt(0))
        )

        // Separa IV e dados criptografados
        const iv = combined.slice(0, 12)
        const encrypted = combined.slice(12)

        // Descriptografa os dados
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            encrypted
        )

        // Converte de volta para objeto
        const decryptedText = decoder.decode(decrypted)
        return JSON.parse(decryptedText) as AuthUser
    } catch {
        throw new Error('Falha ao descriptografar dados do usuário')
    }
}

// Helper para criptografar dados usando Web Crypto API (compatível com edge runtime)
export async function encryptUserData(userData: AuthUser): Promise<string> {
    const secretKey = process.env.SECRET_USER_KEY!
    if (!secretKey) {
        throw new Error('SECRET_USER_KEY é obrigatória nas variáveis de ambiente')
    }

    // Converte a chave em ArrayBuffer
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secretKey.padEnd(32, '0').slice(0, 32)) // Garante 32 bytes
    
    // Importa a chave para uso com AES-GCM
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    )

    // Gera IV aleatório
    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    // Criptografa os dados
    const dataToEncrypt = encoder.encode(JSON.stringify(userData))
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        dataToEncrypt
    )

    // Combina IV + dados criptografados e converte para base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)
    
    return btoa(String.fromCharCode(...combined))
}
