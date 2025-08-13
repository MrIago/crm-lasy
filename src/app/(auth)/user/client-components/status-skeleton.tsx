import { Skeleton } from "@/components/ui/skeleton"
import { LeadsListSkeleton } from "./leads-skeleton"

interface StatusSkeletonProps {
  variant?: "desktop" | "mobile"
  showLeads?: boolean
  leadsCount?: number
}

export function StatusSkeleton({ variant = "desktop", showLeads = true, leadsCount = 3 }: StatusSkeletonProps) {
  if (variant === "mobile") {
    return (
      <div className="w-full h-full space-y-4 p-4 rounded-lg bg-muted/50">
        {/* Seletor de status mobile */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        {/* Lista de leads */}
        {showLeads && (
          <div className="flex-1">
            <div className="space-y-3 pr-2">
              <LeadsListSkeleton variant="mobile" count={leadsCount} />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop variant - coluna individual
  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/50 rounded-lg border">
      {/* Header da coluna */}
      <div className="p-4 pb-3 border-b bg-card/50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>
      </div>

      {/* Lista de leads */}
      <div className="flex-1 min-h-0 p-4 pt-3">
        {showLeads && (
          <div className="h-full">
            <div className="space-y-3 pr-2 min-h-[200px]">
              <LeadsListSkeleton variant="desktop" count={leadsCount} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function KanbanSkeleton({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  if (variant === "mobile") {
    return <StatusSkeleton variant="mobile" showLeads={true} leadsCount={4} />
  }

  // Desktop - múltiplas colunas
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header do kanban */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="h-6 w-32 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Colunas do kanban */}
      <div className="flex-1 overflow-x-auto p-4 bg-muted/20">
        <div className="flex gap-6 h-full min-w-max">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-80 flex-shrink-0">
              <StatusSkeleton variant="desktop" showLeads={true} leadsCount={3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}