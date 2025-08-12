"use client"

import React from "react"
import { UserBtn } from "@/mr-auth"
import { ThemeToggle } from "@/mr-theme"

export default function UserDashboardPage() {
  return (
    <div className="min-h-screen p-6 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard do Usuário</h1>
        <div className="flex items-center gap-3">
          <UserBtn />
          <ThemeToggle />
        </div>
      </header>

      <div className="text-sm text-muted-foreground">
        Conteúdo inicial do dashboard do usuário.
      </div>
    </div>
  )
}


