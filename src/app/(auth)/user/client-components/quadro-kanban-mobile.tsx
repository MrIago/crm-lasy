"use client"

import { useState, useEffect, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"
import { getAllStatus, Status } from "../data/status"
import { getLeadsByStatus, Lead, moveLeadToStatus, deleteLead } from "../data/leads"
import CardLeadMobile from "./card-lead-mobile"
import MoveItensMobile from "./move-itens-mobile"

interface QuadroKanbanMobileProps {
  onAddLead?: () => void
}

export default function QuadroKanbanMobile({ onAddLead }: QuadroKanbanMobileProps) {
  const [allStatus, setAllStatus] = useState<Status[]>([])
  const [selectedStatusId, setSelectedStatusId] = useState<string>("")
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [isLoadingLeads, setIsLoadingLeads] = useState(false)
  const [isReorderMode, setIsReorderMode] = useState(false)

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

  const getColumnBackgroundColor = (color: string) => {
    const backgroundColorMap: Record<string, string> = {
      gray: "bg-gray-50/50",
      blue: "bg-blue-50/50",
      yellow: "bg-yellow-50/50",
      orange: "bg-orange-50/50",
      green: "bg-green-50/50",
      red: "bg-red-50/50",
    }
    return backgroundColorMap[color] || backgroundColorMap.gray
  }

  // Carrega todos os status
  const loadStatus = useCallback(async () => {
    setIsLoadingStatus(true)
    try {
      const result = await getAllStatus()
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      setAllStatus(result.status)
      
      // Seleciona o primeiro status por padrão
      if (result.status.length > 0 && !selectedStatusId) {
        setSelectedStatusId(result.status[0].id)
      }
      
    } catch {
      toast.error("Erro ao carregar status")
    } finally {
      setIsLoadingStatus(false)
    }
  }, [selectedStatusId])

  // Carrega leads do status selecionado
  const loadLeads = useCallback(async (statusId: string) => {
    if (!statusId) return
    
    setIsLoadingLeads(true)
    try {
      const result = await getLeadsByStatus(statusId)
      if (result.error) {
        toast.error(result.error)
        return
      }

      setLeads(result.leads)
    } catch {
      toast.error("Erro ao carregar leads")
    } finally {
      setIsLoadingLeads(false)
    }
  }, [])

  // Carrega dados iniciais
  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  // Carrega leads quando o status selecionado muda
  useEffect(() => {
    if (selectedStatusId) {
      loadLeads(selectedStatusId)
    }
  }, [selectedStatusId, loadLeads])

  // Navegação entre status
  const navigateToStatus = (direction: "prev" | "next") => {
    const currentIndex = allStatus.findIndex(s => s.id === selectedStatusId)
    if (currentIndex === -1) return

    let newIndex: number
    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allStatus.length - 1
    } else {
      newIndex = currentIndex < allStatus.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedStatusId(allStatus[newIndex].id)
  }

  // Manipula mudança de status via dropdown
  const handleMoveToStatus = async (leadId: string, newStatusId: string) => {
    const currentLead = leads.find(lead => lead.id === leadId)
    if (!currentLead) {
      toast.error("Lead não encontrado")
      return
    }

    if (currentLead.statusId === newStatusId) return

    try {
      const result = await moveLeadToStatus(currentLead.statusId, newStatusId, leadId)
      if (result.success) {
        // Se o lead foi movido para fora do status atual, remove da lista
        if (newStatusId !== selectedStatusId) {
          setLeads(prev => prev.filter(lead => lead.id !== leadId))
        }
        toast.success("Lead movido com sucesso!")
      } else {
        toast.error(result.error || "Erro ao mover lead")
      }
    } catch {
      toast.error("Erro ao mover lead")
    }
  }

  // Manipula exclusão de lead
  const handleDeleteLead = async (leadId: string, statusId: string) => {
    if (!confirm("Tem certeza que deseja deletar este lead? Esta ação não pode ser desfeita.")) {
      return
    }

    try {
      const result = await deleteLead(statusId, leadId)
      if (result.success) {
        setLeads(prev => prev.filter(lead => lead.id !== leadId))
        toast.success("Lead deletado com sucesso!")
      } else {
        toast.error(result.error || "Erro ao deletar lead")
      }
    } catch {
      toast.error("Erro ao deletar lead")
    }
  }

  // Handlers do modo de reordenação
  const handleEnterReorderMode = () => {
    if (leads.length <= 1) {
      toast.info("É necessário ter pelo menos 2 leads para reordenar")
      return
    }
    setIsReorderMode(true)
  }

  const handleExitReorderMode = () => {
    setIsReorderMode(false)
  }

  const handleLeadsReordered = (newLeads: Lead[]) => {
    setLeads(newLeads)
    setIsReorderMode(false)
  }

  const currentStatus = allStatus.find(s => s.id === selectedStatusId)

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando kanban...</div>
      </div>
    )
  }

  if (allStatus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-muted-foreground text-center">
          Nenhum status encontrado
        </div>
        <Button variant="outline" size="sm">
          Criar primeiro status
        </Button>
      </div>
    )
  }

  return (
    <div className={`w-full h-full space-y-4 p-4 rounded-lg ${currentStatus ? getColumnBackgroundColor(currentStatus.color) : 'bg-muted/30'}`}>
      {/* Seletor de status */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToStatus("prev")}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex-1">
          <Select value={selectedStatusId} onValueChange={setSelectedStatusId}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {currentStatus && (
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={`${getStatusColor(currentStatus.color)} text-xs`}
                    >
                      {currentStatus.title}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {leads.length}
                    </Badge>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {allStatus.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={`${getStatusColor(status.color)} text-xs`}
                    >
                      {status.title}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToStatus("next")}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Botão de reordenar */}
        {leads.length > 1 && !isReorderMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnterReorderMode}
            className="h-8 w-8 p-0"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        )}

        {onAddLead && (
          <Button
            variant="default"
            size="sm"
            onClick={onAddLead}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Lista de leads ou modo de reordenação */}
      <div className="flex-1">
        {isReorderMode ? (
          <MoveItensMobile
            leads={leads}
            statusId={selectedStatusId}
            onLeadsReordered={handleLeadsReordered}
            onCancel={handleExitReorderMode}
          />
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-3 pr-2">
              {isLoadingLeads ? (
                <div className="text-sm text-foreground/70 text-center py-8">
                  Carregando leads...
                </div>
              ) : leads.length === 0 ? (
                <div className="text-sm text-foreground/70 text-center py-12 border-2 border-dashed border-border/50 rounded-lg">
                  <div className="space-y-2">
                    <div>Nenhum lead neste status</div>
                    {onAddLead && (
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={onAddLead}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar primeiro lead
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                leads.map((lead) => (
                  <CardLeadMobile
                    key={lead.id}
                    lead={lead}
                    allStatus={allStatus}
                    onMoveToStatus={handleMoveToStatus}
                    onDeleteLead={handleDeleteLead}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
