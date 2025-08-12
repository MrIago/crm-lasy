'use client'

import React from 'react'
import { useAuthStore } from '../rbac/MrAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import LogoutBtn from '../logout/LogoutBtn'

export default function UserBtn() {
    const { user, isAuthLoading } = useAuthStore()

    if (isAuthLoading || !user) return null

    // Pega as iniciais do nome para o fallback do avatar
    const initials = (user.name || user.email || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="rounded-full hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer">
                    <Avatar className="w-8 h-8">
                        <AvatarImage
                            src={user.photo}
                            alt={user.name || user.email}
                        />
                        <AvatarFallback className="text-sm font-semibold bg-primary text-primary-foreground">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-72 sm:w-80 p-4 mx-2 sm:mx-0"
                align="end"
                sideOffset={12}
                alignOffset={-8}
            >
                <div className="flex flex-col gap-3">
                    {/* Nome e Email */}
                    <div className="flex flex-col gap-1">
                        <span className="text-lg font-semibold leading-tight">{user.name || user.email}</span>
                        <span className="text-sm text-muted-foreground truncate">{user.email}</span>
                    </div>

                    {/* Role e Plan */}
                    <div className="flex gap-2 flex-wrap">
                        <Badge variant="default" className="bg-accent hover:bg-accent/80 border-0 shadow-sm text-xs">
                            {user.role}
                        </Badge>
                        <Badge variant="default" className="bg-primary hover:bg-primary/80 border-0 shadow-sm text-xs">
                            {user.plan}
                        </Badge>
                    </div>

                    {/* Linha separadora */}
                    <div className="h-px bg-border" />

                    {/* Botão de Logout */}
                    <LogoutBtn className="w-full justify-center">
                        Sair da conta
                    </LogoutBtn>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
