'use client'

import React from 'react'
import Image from 'next/image'

interface ActionLoadingProps {
    message?: string
}

export default function ActionLoading({ message = "Processando..." }: ActionLoadingProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                {/* Logo animado */}
                <div className="relative">
                    <div className="absolute inset-0 animate-pulse">
                        <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                    <div className="flex items-center justify-center w-12 h-12">
                        <Image
                            src="/logo.svg"
                            alt="Logo PratiqLab"
                            width={24}
                            height={24}
                            className="w-6 h-6 transition-colors duration-200 dark:brightness-0 dark:invert"
                        />
                    </div>
                </div>

                {/* Mensagem */}
                <p className="text-sm text-muted-foreground font-medium">
                    {message}
                </p>
            </div>
        </div>
    )
} 