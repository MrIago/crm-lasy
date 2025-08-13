"use client"

import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Filter, 
  ArrowUpAZ, 
  ArrowDownAZ, 
  Calendar, 
  CalendarDays,
  RotateCcw
} from "lucide-react"
import { useSearchStore } from "../store/search-store"

export type SortOption = 'name-asc' | 'name-desc' | 'date-newest' | 'date-oldest' | 'none'

export default function BarraFiltrosDesktop() {
  const { sortBy, setSortBy, totalLeads, filteredLeads } = useSearchStore()
  
  const getSortLabel = (sort: SortOption): string => {
    switch (sort) {
      case 'name-asc':
        return 'Nome A-Z'
      case 'name-desc':
        return 'Nome Z-A'
      case 'date-newest':
        return 'Mais recentes'
      case 'date-oldest':
        return 'Mais antigos'
      default:
        return 'Ordenação'
    }
  }

  const getSortIcon = (sort: SortOption) => {
    switch (sort) {
      case 'name-asc':
        return <ArrowUpAZ className="h-3 w-3" />
      case 'name-desc':
        return <ArrowDownAZ className="h-3 w-3" />
      case 'date-newest':
        return <Calendar className="h-3 w-3" />
      case 'date-oldest':
        return <CalendarDays className="h-3 w-3" />
      default:
        return <Filter className="h-3 w-3" />
    }
  }

  const handleResetSort = () => {
    setSortBy('none')
  }

  const isFiltered = sortBy !== 'none'
  const hasResults = filteredLeads < totalLeads

  return (
    <div className="flex items-center gap-3">
      {/* Contador de resultados */}
      {hasResults && (
        <div className="text-sm text-muted-foreground">
          {filteredLeads} de {totalLeads} leads
        </div>
      )}

      {/* Botão de reset quando há filtros ativos */}
      {isFiltered && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetSort}
          className="h-9 px-3"
          title="Limpar filtros"
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          Limpar
        </Button>
      )}

      {/* Dropdown de ordenação */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isFiltered ? "default" : "outline"}
            size="sm"
            className="h-9 px-3"
          >
            {getSortIcon(sortBy)}
            <span className="ml-2">{getSortLabel(sortBy)}</span>
            {isFiltered && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                1
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs font-medium">
            Ordenar por
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Ordenação por nome */}
          <DropdownMenuItem
            onClick={() => setSortBy('name-asc')}
            className="cursor-pointer"
          >
            <ArrowUpAZ className="h-3 w-3 mr-2" />
            Nome (A-Z)
            {sortBy === 'name-asc' && (
              <Badge variant="secondary" className="ml-auto h-4 w-4 p-0 flex items-center justify-center">
                ✓
              </Badge>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => setSortBy('name-desc')}
            className="cursor-pointer"
          >
            <ArrowDownAZ className="h-3 w-3 mr-2" />
            Nome (Z-A)
            {sortBy === 'name-desc' && (
              <Badge variant="secondary" className="ml-auto h-4 w-4 p-0 flex items-center justify-center">
                ✓
              </Badge>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          {/* Ordenação por data */}
          <DropdownMenuItem
            onClick={() => setSortBy('date-newest')}
            className="cursor-pointer"
          >
            <Calendar className="h-3 w-3 mr-2" />
            Mais recentes
            {sortBy === 'date-newest' && (
              <Badge variant="secondary" className="ml-auto h-4 w-4 p-0 flex items-center justify-center">
                ✓
              </Badge>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => setSortBy('date-oldest')}
            className="cursor-pointer"
          >
            <CalendarDays className="h-3 w-3 mr-2" />
            Mais antigos
            {sortBy === 'date-oldest' && (
              <Badge variant="secondary" className="ml-auto h-4 w-4 p-0 flex items-center justify-center">
                ✓
              </Badge>
            )}
          </DropdownMenuItem>

          {isFiltered && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleResetSort}
                className="cursor-pointer text-muted-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                Remover ordenação
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
