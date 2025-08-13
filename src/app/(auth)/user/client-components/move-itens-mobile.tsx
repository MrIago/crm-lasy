"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Check, X, Move } from "lucide-react"
import { Lead, reorderLead } from "../data/leads"
import { toast } from "sonner"

interface MoveItensMobileProps {
  leads: Lead[]
  statusId: string
  onLeadsReordered: (newLeads: Lead[]) => void
  onCancel: () => void
}

export default function MoveItensMobile({ 
  leads, 
  statusId, 
  onLeadsReordered, 
  onCancel 
}: MoveItensMobileProps) {
  const [localLeads, setLocalLeads] = useState<Lead[]>(leads)
  const [isSaving, setIsSaving] = useState(false)
  const [movingIds, setMovingIds] = useState<Set<string>>(new Set())

  // Move um lead para cima
  const moveUp = useCallback((leadId: string) => {
    setMovingIds(prev => new Set([...prev, leadId]))
    
    setTimeout(() => {
      setLocalLeads(prevLeads => {
        const currentIndex = prevLeads.findIndex(lead => lead.id === leadId)
        if (currentIndex <= 0) return prevLeads
        
        const newLeads = [...prevLeads]
        const temp = newLeads[currentIndex]
        newLeads[currentIndex] = newLeads[currentIndex - 1]
        newLeads[currentIndex - 1] = temp
        
        return newLeads
      })
      
      setTimeout(() => {
        setMovingIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(leadId)
          return newSet
        })
      }, 200)
    }, 100)
  }, [])

  // Move um lead para baixo
  const moveDown = useCallback((leadId: string) => {
    setMovingIds(prev => new Set([...prev, leadId]))
    
    setTimeout(() => {
      setLocalLeads(prevLeads => {
        const currentIndex = prevLeads.findIndex(lead => lead.id === leadId)
        if (currentIndex >= prevLeads.length - 1) return prevLeads
        
        const newLeads = [...prevLeads]
        const temp = newLeads[currentIndex]
        newLeads[currentIndex] = newLeads[currentIndex + 1]
        newLeads[currentIndex + 1] = temp
        
        return newLeads
      })
      
      setTimeout(() => {
        setMovingIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(leadId)
          return newSet
        })
      }, 200)
    }, 100)
  }, [])

  // Salva as alterações no banco
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    
    try {
      // Calcula apenas os leads que mudaram de posição
      const changedLeads: Array<{ leadId: string; oldIndex: number; newIndex: number }> = []
      
      localLeads.forEach((lead, newIndex) => {
        const oldIndex = leads.findIndex(originalLead => originalLead.id === lead.id)
        if (oldIndex !== newIndex) {
          changedLeads.push({
            leadId: lead.id,
            oldIndex,
            newIndex
          })
        }
      })

      if (changedLeads.length === 0) {
        toast.success("Nenhuma alteração para salvar")
        onLeadsReordered(localLeads)
        return
      }

      // Otimização: ordena por nova posição para reduzir conflitos
      changedLeads.sort((a, b) => a.newIndex - b.newIndex)
      
      let successCount = 0
      let errorCount = 0

      // Executa as reordenações em lotes pequenos para evitar conflitos
      const batchSize = 3
      for (let i = 0; i < changedLeads.length; i += batchSize) {
        const batch = changedLeads.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async ({ leadId, newIndex }) => {
          try {
            const result = await reorderLead(statusId, leadId, newIndex)
            if (result.success) {
              successCount++
            } else {
              errorCount++
              console.error(`Erro ao reordenar lead ${leadId}:`, result.error)
            }
          } catch (error) {
            errorCount++
            console.error(`Erro ao reordenar lead ${leadId}:`, error)
          }
        })

        // Aguarda o lote atual antes de processar o próximo
        await Promise.all(batchPromises)
        
        // Pequeno delay entre lotes para reduzir carga
        if (i + batchSize < changedLeads.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      if (errorCount === 0) {
        toast.success(`${successCount} leads reordenados com sucesso!`)
        onLeadsReordered(localLeads)
      } else if (successCount > 0) {
        toast.warning(`${successCount} leads salvos, ${errorCount} com erro`)
        onLeadsReordered(localLeads)
      } else {
        toast.error("Erro ao salvar reordenações")
      }

    } catch (error) {
      console.error("Erro geral ao salvar reordenações:", error)
      toast.error("Erro inesperado ao salvar")
    } finally {
      setIsSaving(false)
    }
  }, [localLeads, leads, statusId, onLeadsReordered])

  const hasChanges = JSON.stringify(localLeads.map(l => l.id)) !== JSON.stringify(leads.map(l => l.id))

  return (
    <div className="space-y-4">
      {/* Header com botões de ação */}
      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Modo reordenação</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="h-3 w-3 mr-1" />
            Cancelar
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            <Check className="h-3 w-3 mr-1" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Lista de leads com controles de movimento */}
      <div className="space-y-2">
        {localLeads.map((lead, index) => (
          <div
            key={lead.id}
            className={`flex items-center gap-3 p-3 bg-card border rounded-lg transition-all duration-300 ${
              movingIds.has(lead.id) ? "scale-105 shadow-md bg-muted/50" : ""
            }`}
          >
            {/* Controles de movimento */}
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveUp(lead.id)}
                disabled={index === 0 || isSaving || movingIds.has(lead.id)}
                className="h-8 w-8 p-0 hover:bg-muted/50"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveDown(lead.id)}
                disabled={index === localLeads.length - 1 || isSaving || movingIds.has(lead.id)}
                className="h-8 w-8 p-0 hover:bg-muted/50"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>

            {/* Informações do lead */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground font-mono">
                  #{index + 1}
                </span>
                <h4 className="font-medium text-sm truncate">{lead.name}</h4>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                {lead.company && (
                  <div className="truncate">{lead.company}</div>
                )}
                {lead.email && (
                  <div className="truncate">{lead.email}</div>
                )}
              </div>
            </div>

            {/* Indicador de movimento */}
            {movingIds.has(lead.id) && (
              <div className="text-primary animate-pulse">
                <Move className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Informações adicionais */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div>Total: {localLeads.length} leads</div>
        {hasChanges && (
          <div className="text-orange-600 dark:text-orange-400">
            ⚠️ Há alterações não salvas
          </div>
        )}
      </div>
    </div>
  )
}
