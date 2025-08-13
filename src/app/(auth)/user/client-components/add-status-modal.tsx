"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createStatus, updateStatus, Status } from "../data/status"
import { toast } from "sonner"

interface AddStatusModalProps {
  isOpen: boolean
  onClose: () => void
  editStatus?: Status | null
}

const colorOptions = [
  { name: 'Cinza', value: 'gray', bgClass: 'bg-[var(--color-gray)]' },
  { name: 'Azul', value: 'blue', bgClass: 'bg-[var(--color-blue)]' },
  { name: 'Amarelo', value: 'yellow', bgClass: 'bg-[var(--color-yellow)]' },
  { name: 'Laranja', value: 'orange', bgClass: 'bg-[var(--color-orange)]' },
  { name: 'Verde', value: 'green', bgClass: 'bg-[var(--color-green)]' },
  { name: 'Vermelho', value: 'red', bgClass: 'bg-[var(--color-red)]' },
]

export default function AddStatusModal({ isOpen, onClose, editStatus }: AddStatusModalProps) {
  const [title, setTitle] = useState("")
  const [selectedColor, setSelectedColor] = useState<string>("gray")
  const [isLoading, setIsLoading] = useState(false)

  const isEditing = Boolean(editStatus)

  // Effect para preencher dados na edição
  useEffect(() => {
    if (editStatus && isOpen) {
      setTitle(editStatus.title)
      setSelectedColor(editStatus.color)
    } else if (!editStatus && isOpen) {
      // Reset form for new status
      setTitle("")
      setSelectedColor("gray")
    }
  }, [editStatus, isOpen])

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Título é obrigatório")
      return
    }

    setIsLoading(true)
    
    try {
      if (isEditing && editStatus) {
        // Modo edição
        const result = await updateStatus(editStatus.id, {
          title: title.trim(),
          color: selectedColor
        })

        if (result.success) {
          toast.success("Status atualizado com sucesso!")
          handleCancel()
        } else {
          toast.error(result.error || "Erro ao atualizar status")
        }
      } else {
        // Modo criação
        const result = await createStatus({
          title: title.trim(),
          color: selectedColor
        })

        if (result.success) {
          toast.success("Status criado com sucesso!")
          handleCancel()
        } else {
          toast.error(result.error || "Erro ao criar status")
        }
      }
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} status:`, error)
      toast.error(`Erro inesperado ao ${isEditing ? 'atualizar' : 'criar'} status`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onClose()
    setTitle("")
    setSelectedColor("gray")
  }

  const selectedColorBg = colorOptions.find(color => color.value === selectedColor)?.bgClass || 'bg-[var(--color-gray)]'

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className={`${selectedColorBg} border-t transition-colors duration-200 sm:max-w-md sm:mx-auto sm:rounded-t-lg`}
      >
        <div className="bg-background rounded-lg mx-4 mt-4 mb-6 p-6 sm:p-8">
          <SheetHeader className="space-y-3">
            <SheetTitle className="text-xl">
              {isEditing ? "Editar Status" : "Novo Status"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Edite as informações do status."
                : "Crie um novo status para organizar seus itens."
              }
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Campo de Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Digite o título do status"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Seleção de Cor */}
            <div className="space-y-3">
              <Label>Cor</Label>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`
                      relative aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105
                      ${color.bgClass}
                      ${selectedColor === color.value 
                        ? 'border-foreground shadow-lg ring-2 ring-ring ring-offset-2 ring-offset-background' 
                        : 'border-border hover:border-foreground/50'
                      }
                    `}
                    aria-label={`Selecionar cor ${color.name}`}
                  >
                    <span className="sr-only">{color.name}</span>
                    {selectedColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-background rounded-full border-2 border-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Cor selecionada: {colorOptions.find(c => c.value === selectedColor)?.name}
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || isLoading}
                className="sm:w-auto"
              >
                {isLoading 
                  ? (isEditing ? "Atualizando..." : "Criando...") 
                  : (isEditing ? "Atualizar Status" : "Criar Status")
                }
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
