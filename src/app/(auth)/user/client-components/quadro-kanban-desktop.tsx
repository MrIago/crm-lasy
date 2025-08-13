"use client"

import { useState, useEffect, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { getAllStatus, Status } from "../data/status"
import { getLeadsByStatus, Lead, moveLeadToStatus, reorderLead } from "../data/leads"
import CardLeadDesktop from "./card-lead-desktop"

interface QuadroKanbanDesktopProps {
  onAddLead?: () => void
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

export default function QuadroKanbanDesktop({ onAddLead }: QuadroKanbanDesktopProps) {
  const [columns, setColumns] = useState<Record<string, ColumnData>>({})
  const [allStatus, setAllStatus] = useState<Status[]>([])
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando kanban...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full overflow-x-auto pb-4">
          {allStatus.map((status) => {
            const column = columns[status.id]
            if (!column) return null

            return (
              <div
                key={status.id}
                className="flex-shrink-0 w-80 bg-muted/30 rounded-lg p-4"
              >
                {/* Header da coluna */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={`${getStatusColor(status.color)} font-medium`}
                    >
                      {status.title}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {column.leads.length}
                    </Badge>
                  </div>
                  
                  {onAddLead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onAddLead}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
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
                          <div className="text-sm text-muted-foreground text-center py-8">
                            Carregando leads...
                          </div>
                        ) : column.leads.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg min-h-[100px] flex items-center justify-center">
                            Nenhum lead neste status
                          </div>
                        ) : (
                          column.leads.map((lead) => (
                            <CardLeadDesktop
                              key={lead.id}
                              lead={lead}
                              allStatus={allStatus}
                              onMoveToStatus={handleMoveToStatus}
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
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
