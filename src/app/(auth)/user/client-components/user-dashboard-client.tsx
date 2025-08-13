"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import AddStatusBtn from "./add-status-btn"
import AddStatusModal from "./add-status-modal"
import AddLeadBtn from "./add-lead-btn"
import AddLeadSheet from "./add-lead-sheet"
import QuadroKanbanDesktop from "./quadro-kanban-desktop"
import QuadroKanbanMobile from "./quadro-kanban-mobile"

export default function UserDashboardClient() {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isLeadSheetOpen, setIsLeadSheetOpen] = useState(false)
  const isMobile = useIsMobile()

  const handleOpenStatusModal = () => {
    setIsStatusModalOpen(true)
  }

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false)
  }

  const handleOpenLeadSheet = () => {
    setIsLeadSheetOpen(true)
  }

  const handleCloseLeadSheet = () => {
    setIsLeadSheetOpen(false)
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
          <QuadroKanbanMobile onAddLead={handleOpenLeadSheet} />
        ) : (
          <QuadroKanbanDesktop onAddLead={handleOpenLeadSheet} />
        )}
      </div>

      {/* Modais */}
      <AddStatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal} />
      <AddLeadSheet isOpen={isLeadSheetOpen} onClose={handleCloseLeadSheet} />
    </>
  )
}
