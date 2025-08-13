"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AddLeadBtnProps {
  onOpenModal: () => void
}

export default function AddLeadBtn({ onOpenModal }: AddLeadBtnProps) {
  return (
    <Button 
      onClick={onOpenModal}
      className="h-9 w-9 p-0"
      title="Adicionar Lead"
    >
      <Plus className="h-4 w-4" />
    </Button>
  )
}
