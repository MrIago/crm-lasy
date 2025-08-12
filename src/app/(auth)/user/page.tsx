import UserDashboardClient from "./client-components/user-dashboard-client"
import { createKanban } from "./data/kanban"

export default async function UserDashboardPage() {
  // Inicializa o kanban do usuário se ainda não existir
  await createKanban()

  return (
    <div className="min-h-screen p-4 sm:p-6 flex flex-col gap-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Dashboard do Usuário</h1>
        <UserDashboardClient />
      </header>

      <div className="text-sm text-muted-foreground">
        Conteúdo inicial do dashboard do usuário.
      </div>
    </div>
  )
}


