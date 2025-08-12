"use client"

import React from "react"
import { Menu } from "lucide-react"
import { ThemeToggle } from "@/mr-theme"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { MobileSide } from "./mobile-side"

export function MobileNav() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Menu hamburger no canto esquerdo */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <MobileSide />
          </SheetContent>
        </Sheet>

        {/* Toggle no canto direito */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}