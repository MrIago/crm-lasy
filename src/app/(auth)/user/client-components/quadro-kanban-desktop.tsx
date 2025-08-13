"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Plus, ChevronLeft, ChevronRight, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SortOption } from "./barra-filtros-desktop"
import { useSearchStore } from "../store/search-store"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { toast } from "sonner"
import { getAllStatus, Status, reorderStatus, deleteStatus } from "../data/status"
import { getLeadsByStatus, Lead, moveLeadToStatus, reorderLead, deleteLead } from "../data/leads"
import CardLeadDesktop from "./card-lead-desktop"
import { KanbanSkeleton } from "./status-skeleton"
import { LeadsListSkeleton } from "./leads-skeleton"

interface QuadroKanbanDesktopProps {
  onAddLead?: () => void
  onEditLead?: (lead: Lead) => void
  onViewLead?: (lead: Lead) => void
  onEditStatus?: (status: Status) => void
  onAddStatus?: () => void
  refreshTrigger?: number // Trigger para recarregar o kanban
}

interface ColumnData {
  status: Status
  leads: Lead[]
  isLoading: boolean
}

// Componente para área de drop da coluna
function DroppableColumn({ 
  statusId, 
  children 
}: { 
  statusId: string
  children: React.ReactNode 
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: statusId,
  })

  return (
    <div 
      ref={setNodeRef}
      className={`transition-colors ${isOver ? 'bg-muted/50' : ''}`}
    >
      {children}
    </div>
  )
}

export default function QuadroKanbanDesktop({ 
  onAddLead, 
  onEditLead, 
  onViewLead, 
  onEditStatus, 
  onAddStatus,
  refreshTrigger
}: QuadroKanbanDesktopProps) {
  const [columns, setColumns] = useState<Record<string, ColumnData>>({})
  const [allStatus, setAllStatus] = useState<Status[]>([])
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

  const { searchTerm, sortBy, setStats } = useSearchStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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

  // Função para filtrar leads por busca
  const filterLeadsBySearch = useCallback((leads: Lead[], term: string): Lead[] => {
    if (!term.trim()) return leads
    
    const searchTerm = term.toLowerCase()
    return leads.filter(lead => 
      lead.name.toLowerCase().includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm) ||
      lead.company.toLowerCase().includes(searchTerm) ||
      lead.phone.includes(searchTerm) ||
      lead.observations.toLowerCase().includes(searchTerm)
    )
  }, [])

  // Função para ordenar leads
  const sortLeads = useCallback((leads: Lead[], sortOption: SortOption): Lead[] => {
    if (sortOption === 'none') return leads

    const sorted = [...leads]
    
    switch (sortOption) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case 'date-newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'date-oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      default:
        return sorted
    }
  }, [])

  // Aplicar filtros e ordenação aos leads
  const filteredColumns = useMemo(() => {
    const result: Record<string, ColumnData> = {}
    
    Object.entries(columns).forEach(([statusId, column]) => {
      const filtered = filterLeadsBySearch(column.leads, searchTerm)
      const sorted = sortLeads(filtered, sortBy)
      
      result[statusId] = {
        ...column,
        leads: sorted
      }
    })
    
    return result
  }, [columns, searchTerm, sortBy, filterLeadsBySearch, sortLeads])

  // Calcular estatísticas para os filtros
  const { totalLeads, filteredLeads } = useMemo(() => {
    const total = Object.values(columns).reduce((sum, col) => sum + col.leads.length, 0)
    const filtered = Object.values(filteredColumns).reduce((sum, col) => sum + col.leads.length, 0)
    return { totalLeads: total, filteredLeads: filtered }
  }, [columns, filteredColumns])

  // Notificar mudanças nas estatísticas
  useEffect(() => {
    setStats(totalLeads, filteredLeads)
  }, [totalLeads, filteredLeads, setStats])

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
      
      // Inicializa as colunas
      const initialColumns: Record<string, ColumnData> = {}
      result.status.forEach(status => {
        initialColumns[status.id] = {
          status,
          leads: [],
          isLoading: false
        }
      })
      setColumns(initialColumns)
      
    } catch {
      toast.error("Erro ao carregar status")
    } finally {
      setIsLoadingStatus(false)
    }
  }, [])

  // Carrega leads de um status específico
  const loadLeadsForStatus = useCallback(async (statusId: string) => {
    setColumns(prev => ({
      ...prev,
      [statusId]: {
        ...prev[statusId],
        isLoading: true
      }
    }))

    try {
      const result = await getLeadsByStatus(statusId)
      if (result.error) {
        toast.error(result.error)
        return
      }

      setColumns(prev => ({
        ...prev,
        [statusId]: {
          ...prev[statusId],
          leads: result.leads,
          isLoading: false
        }
      }))
    } catch {
      toast.error(`Erro ao carregar leads do status`)
    }
  }, [])

  // Carrega dados iniciais
  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  // Recarrega quando refreshTrigger mudar
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadStatus()
    }
  }, [refreshTrigger, loadStatus])

  // Carrega leads quando os status são carregados
  useEffect(() => {
    if (allStatus.length > 0) {
      allStatus.forEach(status => {
        loadLeadsForStatus(status.id)
      })
    }
  }, [allStatus, loadLeadsForStatus])

  // Manipula mudança de status via dropdown
  const handleMoveToStatus = async (leadId: string, newStatusId: string) => {
    const currentLead = Object.values(columns)
      .flatMap(col => col.leads)
      .find(lead => lead.id === leadId)

    if (!currentLead) {
      toast.error("Lead não encontrado")
      return
    }

    if (currentLead.statusId === newStatusId) return

    try {
      const result = await moveLeadToStatus(currentLead.statusId, newStatusId, leadId)
      if (result.success) {
        // Atualiza as duas colunas afetadas
        await Promise.all([
          loadLeadsForStatus(currentLead.statusId),
          loadLeadsForStatus(newStatusId)
        ])
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
        await loadLeadsForStatus(statusId)
        toast.success("Lead deletado com sucesso!")
      } else {
        toast.error(result.error || "Erro ao deletar lead")
      }
    } catch {
      toast.error("Erro ao deletar lead")
    }
  }

  // Manipula exclusão de status
  const handleDeleteStatus = async (statusId: string, statusTitle: string) => {
    const column = columns[statusId]
    const leadsCount = column?.leads.length || 0
    
    const confirmMessage = leadsCount > 0 
      ? `Tem certeza que deseja deletar o status "${statusTitle}"?\n\nEsta ação irá deletar PERMANENTEMENTE:\n• O status\n• Todos os ${leadsCount} leads neste status\n\nEsta ação não pode ser desfeita.`
      : `Tem certeza que deseja deletar o status "${statusTitle}"?\n\nEsta ação não pode ser desfeita.`

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const result = await deleteStatus(statusId)
      if (result.success) {
        // Recarrega todos os status (isso vai recriar as colunas e carregar os leads automaticamente)
        await loadStatus()
        toast.success("Status deletado com sucesso!")
      } else {
        toast.error(result.error || "Erro ao deletar status")
      }
    } catch {
      toast.error("Erro ao deletar status")
    }
  }

  // Manipula reordenação de status
  const handleReorderStatus = async (statusId: string, direction: 'left' | 'right') => {
    const currentIndex = allStatus.findIndex(s => s.id === statusId)
    if (currentIndex === -1) return

    let newPosition: number
    if (direction === 'left') {
      if (currentIndex === 0) return // Já está na primeira posição
      newPosition = currentIndex - 1
    } else {
      if (currentIndex === allStatus.length - 1) return // Já está na última posição
      newPosition = currentIndex + 1
    }

    try {
      const result = await reorderStatus(statusId, newPosition)
      if (result.success) {
        await loadStatus() // Recarrega todos os status para atualizar a ordem
        toast.success("Status reordenado com sucesso!")
      } else {
        toast.error(result.error || "Erro ao reordenar status")
      }
    } catch {
      toast.error("Erro ao reordenar status")
    }
  }

  // Manipula início do drag
  const handleDragStart = (event: DragStartEvent) => {
    const lead = Object.values(columns)
      .flatMap(col => col.leads)
      .find(lead => lead.id === event.active.id)
    
    setActiveLead(lead || null)
  }

  // Manipula fim do drag
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLead(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Encontra o lead ativo
    const activeLead = Object.values(columns)
      .flatMap(col => col.leads)
      .find(lead => lead.id === activeId)

    if (!activeLead) return

    // Se o over é um status (coluna), move para o final desse status
    const targetStatus = allStatus.find(s => s.id === overId)
    if (targetStatus) {
      if (activeLead.statusId !== targetStatus.id) {
        try {
          const result = await moveLeadToStatus(activeLead.statusId, targetStatus.id, activeId)
          if (result.success) {
            await Promise.all([
              loadLeadsForStatus(activeLead.statusId),
              loadLeadsForStatus(targetStatus.id)
            ])
            toast.success("Lead movido com sucesso!")
          } else {
            toast.error(result.error || "Erro ao mover lead")
          }
        } catch {
          toast.error("Erro ao mover lead")
        }
      }
      return
    }

    // Se o over é outro lead, determina se é reordenação ou mudança de status
    const overLead = Object.values(columns)
      .flatMap(col => col.leads)
      .find(lead => lead.id === overId)

    if (!overLead) return

    if (activeLead.statusId === overLead.statusId) {
      // Reordenação dentro do mesmo status
      const statusLeads = columns[activeLead.statusId].leads
      const activeIndex = statusLeads.findIndex(lead => lead.id === activeId)
      const overIndex = statusLeads.findIndex(lead => lead.id === overId)

      if (activeIndex !== overIndex) {
        try {
          const result = await reorderLead(activeLead.statusId, activeId, overIndex)
          if (result.success) {
            await loadLeadsForStatus(activeLead.statusId)
            toast.success("Lead reordenado com sucesso!")
          } else {
            toast.error(result.error || "Erro ao reordenar lead")
          }
        } catch {
          toast.error("Erro ao reordenar lead")
        }
      }
    } else {
      // Mudança entre status
      const overStatusLeads = columns[overLead.statusId].leads
      const newPosition = overStatusLeads.findIndex(lead => lead.id === overId)

      try {
        const result = await moveLeadToStatus(
          activeLead.statusId, 
          overLead.statusId, 
          activeId, 
          newPosition
        )
        if (result.success) {
          await Promise.all([
            loadLeadsForStatus(activeLead.statusId),
            loadLeadsForStatus(overLead.statusId)
          ])
          toast.success("Lead movido com sucesso!")
        } else {
          toast.error(result.error || "Erro ao mover lead")
        }
      } catch {
        toast.error("Erro ao mover lead")
      }
    }
  }

  if (isLoadingStatus) {
    return <KanbanSkeleton variant="desktop" />
  }

  if (allStatus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-muted-foreground text-center">
          Nenhum status encontrado
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onAddStatus}
          className="gap-2"
        >
          Crie seu primeiro status em
          <Tag className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Kanban */}
      <div className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
        <div className="flex gap-6 h-full overflow-x-auto pb-4">
          {allStatus.map((status, index) => {
            const column = filteredColumns[status.id]
            if (!column) return null

            return (
              <div
                key={status.id}
                className={`flex-shrink-0 w-80 rounded-lg p-4 ${getColumnBackgroundColor(status.color)}`}
              >
                {/* Header da coluna */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorderStatus(status.id, 'left')}
                        disabled={index === 0}
                        className="h-6 w-6 p-0 mr-1"
                        title="Mover para esquerda"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      
                      <Badge 
                        variant="outline"
                        className={`${getStatusColor(status.color)} font-medium cursor-pointer hover:opacity-80 transition-opacity`}
                        onClick={() => onEditStatus?.(status)}
                        title="Clique para editar este status"
                      >
                        {status.title}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorderStatus(status.id, 'right')}
                        disabled={index === allStatus.length - 1}
                        className="h-6 w-6 p-0 ml-1"
                        title="Mover para direita"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">
                      {column.leads.length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {onAddLead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onAddLead}
                        className="h-8 w-8 p-0"
                        title="Adicionar lead"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStatus(status.id, status.title)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Deletar status e todos os seus leads"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Lista de leads */}
                <DroppableColumn statusId={status.id}>
                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    <SortableContext 
                      items={column.leads.map(lead => lead.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3 pr-2 min-h-[200px]">
                        {column.isLoading ? (
                          <LeadsListSkeleton variant="desktop" count={3} />
                        ) : column.leads.length === 0 ? (
                          <div className="text-sm text-foreground/70 text-center py-12 border-2 border-dashed border-border/50 rounded-lg">
                            <div className="space-y-2">
                              <div>Nenhum lead neste status</div>
                              {onAddLead && (
                                <Button
                                  variant="ghost" 
                                  size="sm"
                                  onClick={onAddLead}
                                  className="mt-2 gap-2"
                                >
                                  Adicionar primeiro lead em
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          column.leads.map((lead) => (
                            <CardLeadDesktop
                              key={lead.id}
                              lead={lead}
                              allStatus={allStatus}
                              onMoveToStatus={handleMoveToStatus}
                              onDeleteLead={handleDeleteLead}
                              onEditLead={onEditLead}
                              onViewLead={onViewLead}
                            />
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </ScrollArea>
                </DroppableColumn>
              </div>
            )
          })}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeLead ? (
            <CardLeadDesktop
              lead={activeLead}
              allStatus={allStatus}
              onMoveToStatus={() => {}}
              onDeleteLead={() => {}}
              onEditLead={onEditLead}
              onViewLead={onViewLead}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      </div>
    </div>
  )
}
