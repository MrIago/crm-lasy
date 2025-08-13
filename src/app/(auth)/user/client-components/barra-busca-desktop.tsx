"use client"

import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BarraBuscaDesktopProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  placeholder?: string
}

export default function BarraBuscaDesktop({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Buscar leads por nome, email, empresa..." 
}: BarraBuscaDesktopProps) {
  const handleClearSearch = () => {
    onSearchChange("")
  }

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-10 h-10"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearSearch}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
          title="Limpar busca"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
