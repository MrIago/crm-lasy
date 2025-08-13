import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface LeadSkeletonProps {
  variant?: "desktop" | "mobile"
}

export function LeadSkeleton({ variant = "desktop" }: LeadSkeletonProps) {
  if (variant === "mobile") {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4 space-y-3">
          {/* Header com nome e ações */}
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-5 w-3/4 rounded-sm" />
            <div className="flex items-center gap-1 flex-shrink-0">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>

          {/* Status atual */}
          <Skeleton className="h-5 w-20 rounded-full" />

          {/* Informações principais */}
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-sm flex-shrink-0" />
              <Skeleton className="h-4 flex-1 max-w-[140px] rounded-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-sm flex-shrink-0" />
              <Skeleton className="h-3 flex-1 max-w-[180px] rounded-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-sm flex-shrink-0" />
              <Skeleton className="h-4 flex-1 max-w-[120px] rounded-sm" />
            </div>
          </div>

          {/* Observações */}
          <div className="text-sm">
            <div className="bg-muted/30 rounded p-3 space-y-2">
              <Skeleton className="h-3 w-full rounded-sm" />
              <Skeleton className="h-3 w-4/5 rounded-sm" />
              <Skeleton className="h-3 w-3/4 rounded-sm" />
            </div>
          </div>

          {/* Indicador de interações */}
          <div className="flex justify-end">
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Desktop variant
  return (
    <Card className="transition-all duration-200 hover:shadow-md cursor-grab">
      <CardContent className="p-4 space-y-3">
        {/* Header com nome e ações */}
        <div className="flex items-start justify-between">
          <Skeleton className="h-4 w-3/4 rounded-sm" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>

        {/* Status atual */}
        <Skeleton className="h-4 w-16 rounded-full" />

        {/* Informações principais */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-sm flex-shrink-0" />
            <Skeleton className="h-3 flex-1 max-w-[100px] rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-sm flex-shrink-0" />
            <Skeleton className="h-3 flex-1 max-w-[120px] rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-sm flex-shrink-0" />
            <Skeleton className="h-3 flex-1 max-w-[80px] rounded-sm" />
          </div>
        </div>

        {/* Observações */}
        <div className="text-xs">
          <div className="bg-muted/30 rounded p-2 space-y-1.5">
            <Skeleton className="h-3 w-full rounded-sm" />
            <Skeleton className="h-3 w-3/4 rounded-sm" />
          </div>
        </div>

        {/* Indicador de interações */}
        <div className="text-xs">
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function LeadsListSkeleton({ variant = "desktop", count = 3 }: { variant?: "desktop" | "mobile", count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <LeadSkeleton key={index} variant={variant} />
      ))}
    </div>
  )
}