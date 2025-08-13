import UserDashboardClient from "./client-components/user-dashboard-client"
import { createKanban } from "./data/kanban"

export default async function UserDashboardPage() {
  // Inicializa o kanban do usuário se ainda não existir
  await createKanban()

  return (
    <div className="min-h-screen p-4 sm:p-6 flex flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        <UserDashboardClient />
      </div>
    </div>
  )
}


