"use client"

import React from "react"
import { ThemeToggle } from "@/mr-theme/components/toggle"
import { LoginBtn, LogoutBtn, useAuthStore, UserBtn } from "@/mr-auth"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen p-6 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Lasy CRM</h1>
        <div className="flex items-center gap-3">
          <AuthActions />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">Bem-vindo. Acesse seu painel.</p>
        <nav className="flex gap-3 text-sm">
          <Link href="/user" className="underline">Ir para User</Link>
          <Link href="/admin" className="underline">Ir para Admin</Link>
        </nav>
      </div>
    </div>
  )
}

function AuthActions() {
  const { user } = useAuthStore()
  if (!user) return <LoginBtn />
  return (
    <div className="flex items-center gap-3">
      <UserBtn />
      <LogoutBtn />
    </div>
  )
}