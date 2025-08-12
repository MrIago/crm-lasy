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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { getAllStatus, Status } from "../data/status"

interface InteractionHistory {
  id: string
  date: Date
  notes: string
}

interface LeadFormData {
  name: string
  email: string
  phone: string
  company: string
  observations: string
  statusId: string
  interactions: InteractionHistory[]
}

interface AddLeadSheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddLeadSheet({ isOpen, onClose }: AddLeadSheetProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [statusList, setStatusList] = useState<Status[]>([])
  const [loadingStatus, setLoadingStatus] = useState(false)
  
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    observations: "",
    statusId: "",
    interactions: []
  })

  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({})

  // Carregar status disponíveis
  useEffect(() => {
    if (isOpen) {
      loadStatus()
    }
  }, [isOpen])

  const loadStatus = async () => {
    setLoadingStatus(true)
    try {
      const result = await getAllStatus()
      if (result.error) {
        toast.error(result.error)
      } else {
        setStatusList(result.status)
        // Selecionar o primeiro status por padrão
        if (result.status.length > 0 && !formData.statusId) {
          setFormData(prev => ({ ...prev, statusId: result.status[0].id }))
        }
      }
    } catch (error) {
      toast.error("Erro ao carregar status")
    } finally {
      setLoadingStatus(false)
    }
  }

  // Máscara para telefone brasileiro
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4')
    }
    return value
  }

  // Validações
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '')
    return numbers.length === 11 && numbers.startsWith('9', 2)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LeadFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "E-mail inválido"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório"
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Telefone deve ter 11 dígitos e começar com 9"
    }

    if (!formData.statusId) {
      newErrors.statusId = "Status é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    handleInputChange('phone', formatted)
  }

  const addInteraction = () => {
    const newInteraction: InteractionHistory = {
      id: Date.now().toString(),
      date: new Date(),
      notes: ""
    }
    setFormData(prev => ({
      ...prev,
      interactions: [...prev.interactions, newInteraction]
    }))
  }

  const updateInteraction = (id: string, notes: string) => {
    setFormData(prev => ({
      ...prev,
      interactions: prev.interactions.map(interaction =>
        interaction.id === id ? { ...interaction, notes } : interaction
      )
    }))
  }

  const removeInteraction = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interactions: prev.interactions.filter(interaction => interaction.id !== id)
    }))
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário")
      return
    }

    setIsLoading(true)
    
    try {
      // TODO: Implementar criação de lead
      console.log("Criando lead:", formData)
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Lead criado com sucesso!")
      handleCancel()
    } catch (error) {
      console.error("Erro ao criar lead:", error)
      toast.error("Erro inesperado ao criar lead")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      observations: "",
      statusId: "",
      interactions: []
    })
    setErrors({})
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0"
      >
        <SheetHeader className="px-6 py-6 border-b shrink-0">
          <SheetTitle className="text-xl">Novo Lead</SheetTitle>
          <SheetDescription>
            Adicione um novo lead ao seu pipeline.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 py-6 space-y-6">
              {/* Campo Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Campo E-mail */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Campo Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  placeholder="(11) 9 9999-9999"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  maxLength={16}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              {/* Campo Empresa */}
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  placeholder="Nome da empresa"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>

              {/* Campo Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                {loadingStatus ? (
                  <div className="h-10 bg-muted animate-pulse rounded-md" />
                ) : (
                  <Select
                    value={formData.statusId}
                    onValueChange={(value) => handleInputChange('statusId', value)}
                  >
                    <SelectTrigger className={errors.statusId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusList.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: `var(--color-${status.color})` }}
                            />
                            {status.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.statusId && (
                  <p className="text-sm text-destructive">{errors.statusId}</p>
                )}
              </div>

              {/* Campo Observações */}
              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  placeholder="Adicione observações sobre o lead..."
                  rows={3}
                  value={formData.observations}
                  onChange={(e) => handleInputChange('observations', e.target.value)}
                />
              </div>

              {/* Histórico de Interações */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Histórico de Interações</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInteraction}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Adicionar
                  </Button>
                </div>
                
                {formData.interactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma interação adicionada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {formData.interactions.map((interaction) => (
                      <div key={interaction.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {interaction.date.toLocaleDateString('pt-BR')} às{' '}
                            {interaction.date.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInteraction(interaction.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Descreva a interação..."
                          rows={2}
                          value={interaction.notes}
                          onChange={(e) => updateInteraction(interaction.id, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
        </ScrollArea>

        {/* Botões de Ação */}
        <div className="border-t px-6 py-4 shrink-0">
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Criando..." : "Criar Lead"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="w-full"
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
