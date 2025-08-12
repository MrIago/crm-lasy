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
      className="gap-2"
    >
      <Plus className="h-4 w-4" />
      Adicionar Lead
    </Button>
  )
}
