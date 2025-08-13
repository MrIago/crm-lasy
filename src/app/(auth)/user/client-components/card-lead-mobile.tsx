"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Mail, Phone, Building, GripVertical } from "lucide-react"
import { Lead } from "../data/leads"
import { Status } from "../data/status"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"

interface CardLeadMobileProps {
  lead: Lead
  allStatus: Status[]
  onMoveToStatus: (leadId: string, newStatusId: string) => void
}

export default function CardLeadMobile({ 
  lead, 
  allStatus, 
  onMoveToStatus 
}: CardLeadMobileProps) {
  const [isDragging, setIsDragging] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isKitDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const currentStatus = allStatus.find(s => s.id === lead.statusId)
  const availableStatus = allStatus.filter(s => s.id !== lead.statusId)

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

  // Handlers para touch/hold
  const handleTouchStart = () => {
    // Delay para ativar o drag no mobile
    setTimeout(() => {
      setIsDragging(true)
    }, 500) // 500ms hold para ativar DnD
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 hover:shadow-md ${
        isKitDragging || isDragging ? "opacity-50 scale-105 shadow-xl" : ""
      } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header com nome, drag handle e ações */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div 
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab active:cursor-grabbing touch-manipulation"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
              {lead.name}
            </h3>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted/50 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Mover para:
              </div>
              {availableStatus.map((status) => (
                <DropdownMenuItem
                  key={status.id}
                  onClick={() => onMoveToStatus(lead.id, status.id)}
                  className="cursor-pointer"
                >
                  <Badge 
                    variant="outline"
                    className={`text-xs mr-2 ${getStatusColor(status.color)}`}
                  >
                    {status.title}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status atual */}
        {currentStatus && (
          <Badge 
            variant="outline" 
            className={`text-xs w-fit ${getStatusColor(currentStatus.color)}`}
          >
            {currentStatus.title}
          </Badge>
        )}

        {/* Informações principais */}
        <div className="space-y-2.5 text-sm">
          {lead.company && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">{lead.company}</span>
            </div>
          )}
          
          {lead.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate text-xs">{lead.email}</span>
            </div>
          )}
          
          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">{lead.phone}</span>
            </div>
          )}
        </div>

        {/* Observações */}
        {lead.observations && (
          <div className="text-sm text-muted-foreground">
            <p className="bg-muted/30 rounded p-3 leading-relaxed">
              {truncateText(lead.observations, 100)}
            </p>
          </div>
        )}

        {/* Indicador de interações */}
        {lead.interactions.length > 0 && (
          <div className="flex justify-end">
            <Badge variant="secondary" className="text-xs">
              {lead.interactions.length} interaç{lead.interactions.length === 1 ? "ão" : "ões"}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
