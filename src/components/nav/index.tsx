"use client"

import React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { DesktopNav } from "./desktop-nav"
import { MobileNav } from "./mobile-nav"

export function Navbar() {
  const isMobile = useIsMobile()

  return (
    <>
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </>
  )
}