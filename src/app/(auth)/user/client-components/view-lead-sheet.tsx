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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Mail, 
  Phone, 
  Building, 
  FileText, 
  MessageSquare,
  Calendar,
  Edit,
  X
} from "lucide-react"
import { Lead } from "../data/leads"
import { getAllStatus, Status } from "../data/status"

interface ViewLeadSheetProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead | null
  onEditLead?: (lead: Lead) => void
}

export default function ViewLeadSheet({ 
  isOpen, 
  onClose, 
  lead,
  onEditLead 
}: ViewLeadSheetProps) {
  const [statusList, setStatusList] = useState<Status[]>([])

  // Carregar status para exibir informações completas
  useEffect(() => {
    if (isOpen && lead) {
      const loadStatus = async () => {
        try {
          const result = await getAllStatus()
          if (!result.error) {
            setStatusList(result.status)
          }
        } catch (error) {
          console.error("Erro ao carregar status:", error)
        }
      }
      loadStatus()
    }
  }, [isOpen, lead])

  const getStatusColor = (color: string) => {
    const colorMap: Record<string, string> = {
      gray: "bg-gray-100 text-gray-800 border-gray-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      green: "bg-green-100 text-green-800 border-green-200",
      red: "bg-red-100 text-red-800 border-red-200",
    }
    return colorMap[color] || colorMap.gray
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const currentStatus = statusList.find(s => s.id === lead?.statusId)

  if (!lead) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0"
      >
        <SheetHeader className="px-6 py-6 border-b shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-xl text-left">
                {lead.name}
              </SheetTitle>
              <SheetDescription className="text-left">
                Visualização completa do lead
              </SheetDescription>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {onEditLead && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEditLead(lead)
                    onClose()
                  }}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 py-6 space-y-6">
            {/* Status */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              {currentStatus && (
                <Badge 
                  variant="outline" 
                  className={`w-fit ${getStatusColor(currentStatus.color)}`}
                >
                  {currentStatus.title}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Informações de Contato */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Informações de Contato
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">E-mail</p>
                    <p className="text-sm text-muted-foreground break-all">{lead.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Telefone</p>
                    <p className="text-sm text-muted-foreground">{lead.phone}</p>
                  </div>
                </div>

                {lead.company && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Empresa</p>
                      <p className="text-sm text-muted-foreground">{lead.company}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            {lead.observations && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {lead.observations}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Histórico de Interações */}
            {lead.interactions && lead.interactions.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Histórico de Interações ({lead.interactions.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {lead.interactions.map((interaction, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(interaction.date)}
                        </div>
                        {interaction.notes && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {interaction.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Informações do Sistema */}
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Informações do Sistema
              </h3>
              
              <div className="grid grid-cols-1 gap-3 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Criado em:</span>{' '}
                  {formatDate(lead.createdAt)}
                </div>
                <div>
                  <span className="font-medium">Última atualização:</span>{' '}
                  {formatDate(lead.updatedAt)}
                </div>
                <div>
                  <span className="font-medium">ID do lead:</span>{' '}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    {lead.id}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Rodapé com botões de ação */}
        <div className="border-t px-6 py-4 shrink-0">
          <div className="flex gap-3">
            {onEditLead && (
              <Button
                onClick={() => {
                  onEditLead(lead)
                  onClose()
                }}
                className="flex-1 gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar Lead
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Fechar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
