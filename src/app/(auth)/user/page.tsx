import UserDashboardClient from "./client-components/user-dashboard-client"
import { createKanban } from "./data/kanban"

export default async function UserDashboardPage() {
  // Inicializa o kanban do usuário se ainda não existir
  await createKanban()

  return (
    <div className="min-h-screen p-4 sm:p-6 flex flex-col">
      <header className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Dashboard - CRM</h1>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <UserDashboardClient />
      </div>
    </div>
  )
}


