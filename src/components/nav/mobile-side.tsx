"use client"

import React from "react"
import { UserBtn } from "@/mr-auth"

export function MobileSide() {
  return (
    <div className="flex h-full flex-col">
      {/* Título no topo */}
      <div className="border-b p-6">
        <h2 className="text-lg font-semibold">Lasy CRM</h2>
      </div>

      {/* Conteúdo principal (pode expandir no futuro) */}
      <div className="flex-1 p-6">
        {/* Aqui podem ser adicionados links de navegação, menu items, etc */}
      </div>

      {/* UserBtn no bottom */}
      <div className="border-t p-6">
        <UserBtn />
      </div>
    </div>
  )
}