"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import AddStatusBtn from "./add-status-btn"
import AddStatusModal from "./add-status-modal"
import AddLeadBtn from "./add-lead-btn"
import AddLeadSheet from "./add-lead-sheet"
import ViewLeadSheet from "./view-lead-sheet"
import QuadroKanbanDesktop from "./quadro-kanban-desktop"
import QuadroKanbanMobile from "./quadro-kanban-mobile"
import { Lead } from "../data/leads"

export default function UserDashboardClient() {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isLeadSheetOpen, setIsLeadSheetOpen] = useState(false)
  const [isViewLeadSheetOpen, setIsViewLeadSheetOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [viewingLead, setViewingLead] = useState<Lead | null>(null)
  const isMobile = useIsMobile()

  const handleOpenStatusModal = () => {
    setIsStatusModalOpen(true)
  }

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false)
  }

  const handleOpenLeadSheet = () => {
    setEditingLead(null) // Limpa qualquer lead em edição
    setIsLeadSheetOpen(true)
  }

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead)
    setIsLeadSheetOpen(true)
  }

  const handleViewLead = (lead: Lead) => {
    setViewingLead(lead)
    setIsViewLeadSheetOpen(true)
  }

  const handleCloseLeadSheet = () => {
    setIsLeadSheetOpen(false)
    setEditingLead(null) // Limpa o lead em edição ao fechar
  }

  const handleCloseViewLeadSheet = () => {
    setIsViewLeadSheetOpen(false)
    setViewingLead(null) // Limpa o lead em visualização ao fechar
  }

  return (
    <>
      {/* Header com botões de ação */}
      <div className="flex gap-4 mb-6">
        <AddStatusBtn onOpenModal={handleOpenStatusModal} />
        <AddLeadBtn onOpenModal={handleOpenLeadSheet} />
      </div>

      {/* Quadro Kanban responsivo */}
      <div className="flex-1 h-full">
        {isMobile ? (
          <QuadroKanbanMobile 
            onAddLead={handleOpenLeadSheet}
            onEditLead={handleEditLead}
            onViewLead={handleViewLead}
          />
        ) : (
          <QuadroKanbanDesktop 
            onAddLead={handleOpenLeadSheet}
            onEditLead={handleEditLead}
            onViewLead={handleViewLead}
          />
        )}
      </div>

      {/* Modais */}
      <AddStatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal} />
      <AddLeadSheet 
        isOpen={isLeadSheetOpen} 
        onClose={handleCloseLeadSheet}
        editLead={editingLead}
      />
      <ViewLeadSheet
        isOpen={isViewLeadSheetOpen}
        onClose={handleCloseViewLeadSheet}
        lead={viewingLead}
        onEditLead={handleEditLead}
      />
    </>
  )
}
