"use client"

import { useState } from "react"
import AddStatusBtn from "./add-status-btn"
import AddStatusModal from "./add-status-modal"

export default function UserDashboardClient() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <AddStatusBtn onOpenModal={handleOpenModal} />
      <AddStatusModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  )
}
