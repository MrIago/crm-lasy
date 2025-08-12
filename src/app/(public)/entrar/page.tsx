"use client"

import React from "react"
import { LoginBtn } from "@/mr-auth"

export default function EntrarPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
        <p className="text-sm text-muted-foreground text-center">
          Use sua conta para acessar o painel.
        </p>
        <LoginBtn className="w-full" />
      </div>
    </div>
  )
}


