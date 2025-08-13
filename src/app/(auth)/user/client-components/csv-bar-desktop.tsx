"use client"

import { useState } from "react"
import { Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getAllLeads, Lead } from "../data/leads"
import { getAllStatus, Status } from "../data/status"

interface CsvBarDesktopProps {
  onImportCsv?: () => void
  onExportCsv?: () => void
}

export default function CsvBarDesktop({ onImportCsv, onExportCsv }: CsvBarDesktopProps) {
  const [isExporting, setIsExporting] = useState(false)
  
  // Função para converter dados para CSV
  const convertToCSV = (leads: Lead[], statuses: Status[]): string => {
    if (leads.length === 0) {
      return "Nome,Email,Telefone,Empresa,Status,Observações,Data de Criação,Última Atualização,Total de Interações"
    }

    // Cabeçalhos do CSV
    const headers = [
      "Nome",
      "Email", 
      "Telefone",
      "Empresa",
      "Status",
      "Observações",
      "Data de Criação",
      "Última Atualização",
      "Total de Interações"
    ]

    // Converter leads para linhas CSV
    const rows = leads.map(lead => {
      const status = statuses.find(s => s.id === lead.statusId)
      const statusName = status ? status.title : "Status não encontrado"
      
      return [
        `"${lead.name.replace(/"/g, '""')}"`, // Escapar aspas duplas
        `"${lead.email.replace(/"/g, '""')}"`,
        `"${lead.phone.replace(/"/g, '""')}"`,
        `"${lead.company.replace(/"/g, '""')}"`,
        `"${statusName.replace(/"/g, '""')}"`,
        `"${lead.observations.replace(/"/g, '""')}"`,
        `"${new Date(lead.createdAt).toLocaleDateString('pt-BR')}"`,
        `"${new Date(lead.updatedAt).toLocaleDateString('pt-BR')}"`,
        `"${lead.interactions?.length || 0}"`
      ]
    })

    // Combinar cabeçalhos e linhas
    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
  }

  // Função para fazer download do CSV
  const downloadCSV = (csvContent: string, filename: string) => {
    // Adicionar BOM para caracteres especiais (UTF-8)
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
    
    // Criar URL do blob
    const url = URL.createObjectURL(blob)
    
    // Criar elemento de download
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    
    // Adicionar ao DOM, clicar e remover
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Limpar URL do blob
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    if (onImportCsv) {
      onImportCsv()
    } else {
      toast.info("Funcionalidade de importar CSV em desenvolvimento")
    }
  }

  const handleExport = async () => {
    if (onExportCsv) {
      onExportCsv()
      return
    }

    setIsExporting(true)

    try {
      // Buscar todos os leads e status
      const [leadsResult, statusResult] = await Promise.all([
        getAllLeads(),
        getAllStatus()
      ])

      if (leadsResult.error) {
        toast.error(leadsResult.error)
        return
      }

      if (statusResult.error) {
        toast.error(statusResult.error)
        return
      }

      const leads = leadsResult.leads
      const statuses = statusResult.status

      if (leads.length === 0) {
        toast.error("Não há leads para exportar")
        return
      }

      // Converter para CSV
      const csvContent = convertToCSV(leads, statuses)
      
      // Gerar nome do arquivo com data atual
      const now = new Date()
      const dateStr = now.toLocaleDateString('pt-BR').replace(/\//g, '-')
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(/:/g, 'h')
      
      const filename = `leads_${dateStr}_${timeStr}.csv`
      
      // Fazer download
      downloadCSV(csvContent, filename)
      
      // Mostrar mensagem de sucesso
      toast.success(`${leads.length} leads exportados com sucesso!`)
      
    } catch (error) {
      console.error("Erro ao exportar CSV:", error)
      toast.error("Erro ao exportar arquivo CSV")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline"
        onClick={handleImport}
        className="gap-2"
        title="Importar leads via CSV"
      >
        <Upload className="h-4 w-4" />
        Importar CSV
      </Button>
      
      <Button 
        variant="outline"
        onClick={handleExport}
        className="gap-2"
        title="Exportar todos os leads para CSV"
        disabled={isExporting}
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Exportando..." : "Exportar CSV"}
      </Button>
    </div>
  )
}