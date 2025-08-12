"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AcessoNegadoPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold">Acesso negado</h1>
        <p className="text-sm text-muted-foreground">
          Você não tem permissão para acessar esta área.
        </p>
        <Button asChild className="cursor-pointer">
          <Link href="/user">Voltar para o dashboard</Link>
        </Button>
      </div>
    </div>
  )
}


