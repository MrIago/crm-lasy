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
import { MoreVertical, Mail, Phone, Building, Trash2 } from "lucide-react"
import { Lead } from "../data/leads"
import { Status } from "../data/status"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface CardLeadDesktopProps {
  lead: Lead
  allStatus: Status[]
  onMoveToStatus: (leadId: string, newStatusId: string) => void
  onDeleteLead: (leadId: string, statusId: string) => void
}

export default function CardLeadDesktop({ 
  lead, 
  allStatus, 
  onMoveToStatus,
  onDeleteLead
}: CardLeadDesktopProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${
        isDragging ? "opacity-50 scale-105 shadow-xl" : ""
      }`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header com nome e ações */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {lead.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted/50"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
              <div className="border-t my-1" />
              <DropdownMenuItem
                onClick={() => onDeleteLead(lead.id, lead.statusId)}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Deletar lead
              </DropdownMenuItem>
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
        <div className="space-y-2 text-xs text-muted-foreground">
          {lead.company && (
            <div className="flex items-center gap-2">
              <Building className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{lead.company}</span>
            </div>
          )}
          
          {lead.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          
          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{lead.phone}</span>
            </div>
          )}
        </div>

        {/* Observações */}
        {lead.observations && (
          <div className="text-xs text-muted-foreground">
            <p className="bg-muted/30 rounded p-2 leading-relaxed">
              {truncateText(lead.observations, 100)}
            </p>
          </div>
        )}

        {/* Indicador de interações */}
        {lead.interactions.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {lead.interactions.length} interaç{lead.interactions.length === 1 ? "ão" : "ões"}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
