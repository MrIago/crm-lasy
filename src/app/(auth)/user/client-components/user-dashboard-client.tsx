"use client"

import { useState } from "react"
import AddStatusBtn from "./add-status-btn"
import AddStatusModal from "./add-status-modal"
import AddLeadBtn from "./add-lead-btn"
import AddLeadSheet from "./add-lead-sheet"

export default function UserDashboardClient() {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isLeadSheetOpen, setIsLeadSheetOpen] = useState(false)

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
      <div className="flex gap-4">
        <AddStatusBtn onOpenModal={handleOpenStatusModal} />
        <AddLeadBtn onOpenModal={handleOpenLeadSheet} />
      </div>
      <AddStatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal} />
      <AddLeadSheet isOpen={isLeadSheetOpen} onClose={handleCloseLeadSheet} />
    </>
  )
}
