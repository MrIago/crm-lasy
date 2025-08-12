import React from "react"
import { Navbar } from "@/components/nav"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}