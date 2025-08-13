"use client"

import { Tag } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AddStatusBtnProps {
  onOpenModal: () => void
}

export default function AddStatusBtn({ onOpenModal }: AddStatusBtnProps) {
  return (
    <Button 
      onClick={onOpenModal}
      className="h-9 w-9 p-0"
      title="Adicionar Status"
    >
      <Tag className="h-4 w-4" />
    </Button>
  )
}
