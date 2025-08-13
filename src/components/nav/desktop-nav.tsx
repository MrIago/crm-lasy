"use client"

import React from "react"
import { ThemeToggle } from "@/mr-theme"
import { UserBtn, LoginBtn, useAuthStore } from "@/mr-auth"

export function DesktopNav() {
  const { user } = useAuthStore()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo/Título no canto esquerdo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-foreground">
            Lasy CRM
          </h1>
        </div>

        {/* Controles no canto direito */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && <UserBtn />}
          {!user && <LoginBtn />}
        </div>
      </div>
    </nav>
  )
}