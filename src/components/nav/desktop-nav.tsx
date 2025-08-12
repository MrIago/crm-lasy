"use client"

import React from "react"
import { ThemeToggle } from "@/mr-theme"
import { UserBtn } from "@/mr-auth"

export function DesktopNav() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo/Título no canto esquerdo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-foreground">
            Lasy CRM
          </h1>
        </div>

        {/* Controles no canto direito */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserBtn />
        </div>
      </div>
    </nav>
  )
}