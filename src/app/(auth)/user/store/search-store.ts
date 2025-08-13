import { create } from 'zustand'
import { SortOption } from '../client-components/barra-filtros-desktop'

interface SearchState {
  searchTerm: string
  sortBy: SortOption
  totalLeads: number
  filteredLeads: number
  setSearchTerm: (term: string) => void
  setSortBy: (sort: SortOption) => void
  setStats: (total: number, filtered: number) => void
}

export const useSearchStore = create<SearchState>((set) => ({
  searchTerm: "",
  sortBy: 'none',
  totalLeads: 0,
  filteredLeads: 0,
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setStats: (total, filtered) => set({ totalLeads: total, filteredLeads: filtered }),
}))
