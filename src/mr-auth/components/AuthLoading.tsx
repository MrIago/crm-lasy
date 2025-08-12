'use client'

import React from 'react'
import Image from 'next/image'

export default function AuthLoading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center">
                {/* Logo animado */}
                <div className="relative">
                    <div className="absolute inset-0 animate-pulse">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                    <div className="flex items-center justify-center w-16 h-16">
                        <Image
                            src="/logo.svg"
                            alt="Logo PratiqLab"
                            width={32}
                            height={32}
                            className="w-8 h-8 transition-colors duration-200 dark:brightness-0 dark:invert"
                        />
                    </div>
                </div>


            </div>
        </div>
    )
} 