"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AddStatusBtnProps {
  onOpenModal: () => void
}

export default function AddStatusBtn({ onOpenModal }: AddStatusBtnProps) {
  return (
    <Button 
      onClick={onOpenModal}
      className="gap-2"
    >
      <Plus className="h-4 w-4" />
      Adicionar Status
    </Button>
  )
}
