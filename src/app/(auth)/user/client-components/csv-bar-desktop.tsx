"use client"

import { useState, useRef } from "react"
import { Upload, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { getAllLeads, Lead, createLead, CreateLeadData } from "../data/leads"
import { getAllStatus, Status } from "../data/status"

interface CsvBarDesktopProps {
  onImportCsv?: () => void
  onExportCsv?: () => void
  onLeadChange?: () => void // Callback para quando leads forem criados via CSV
}

interface CsvRow {
  nome?: string
  email?: string
  telefone?: string
  empresa?: string
  status?: string
  observacoes?: string
}

export default function CsvBarDesktop({ onImportCsv, onExportCsv, onLeadChange }: CsvBarDesktopProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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

  // Função para validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // Função para formatar telefone brasileiro
  const formatPhone = (phone: string): string => {
    const numbers = phone.replace(/\D/g, '')
    if (numbers.length === 11 && numbers.startsWith('9', 2)) {
      return numbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4')
    }
    return phone
  }

  // Função para validar telefone brasileiro
  const validatePhone = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '')
    return numbers.length === 11 && numbers.startsWith('9', 2)
  }

  // Função para processar CSV
  const parseCsv = (csvText: string): CsvRow[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length === 0) return []
    
    // Primeiro linha são os cabeçalhos
    const headers = lines[0].split(',').map(header => 
      header.replace(/"/g, '').trim().toLowerCase()
    )
    
    // Mapear cabeçalhos para campos conhecidos
    const fieldMap: Record<string, keyof CsvRow> = {
      'nome': 'nome',
      'name': 'nome',
      'email': 'email',
      'e-mail': 'email',
      'telefone': 'telefone',
      'phone': 'telefone',
      'celular': 'telefone',
      'empresa': 'empresa',
      'company': 'empresa',
      'status': 'status',
      'observacoes': 'observacoes',
      'observações': 'observacoes',
      'notes': 'observacoes',
      'notas': 'observacoes'
    }
    
    const rows: CsvRow[] = []
    
    // Processar cada linha de dados
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => 
        value.replace(/"/g, '').trim()
      )
      
      const row: CsvRow = {}
      
      headers.forEach((header, index) => {
        const field = fieldMap[header]
        if (field && values[index]) {
          row[field] = values[index]
        }
      })
      
      // Só adiciona se tem pelo menos nome e email
      if (row.nome && row.email) {
        rows.push(row)
      }
    }
    
    return rows
  }

  // Função para processar arquivo CSV
  const processCSVFile = (file: File): Promise<CsvRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string
          const rows = parseCsv(csvText)
          resolve(rows)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsText(file, 'UTF-8')
    })
  }

  // Função para importar leads do CSV
  const importLeadsFromCSV = async (csvRows: CsvRow[], statuses: Status[]) => {
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []
    
    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i]
      
      try {
        // Validar dados obrigatórios
        if (!row.nome?.trim()) {
          errors.push(`Linha ${i + 2}: Nome é obrigatório`)
          errorCount++
          continue
        }
        
        if (!row.email?.trim()) {
          errors.push(`Linha ${i + 2}: Email é obrigatório`)
          errorCount++
          continue
        }
        
        if (!validateEmail(row.email)) {
          errors.push(`Linha ${i + 2}: Email inválido (${row.email})`)
          errorCount++
          continue
        }
        
        if (!row.telefone?.trim()) {
          errors.push(`Linha ${i + 2}: Telefone é obrigatório`)
          errorCount++
          continue
        }
        
        const formattedPhone = formatPhone(row.telefone)
        if (!validatePhone(formattedPhone)) {
          errors.push(`Linha ${i + 2}: Telefone inválido (${row.telefone})`)
          errorCount++
          continue
        }
        
        // Encontrar status
        let statusId = statuses[0]?.id // Status padrão (primeiro)
        
        if (row.status?.trim()) {
          const foundStatus = statuses.find(s => 
            s.title.toLowerCase() === row.status?.toLowerCase().trim()
          )
          if (foundStatus) {
            statusId = foundStatus.id
          }
        }
        
        // Criar lead data
        const leadData: CreateLeadData = {
          name: row.nome.trim(),
          email: row.email.trim(),
          phone: formattedPhone,
          company: row.empresa?.trim() || '',
          observations: row.observacoes?.trim() || '',
          statusId: statusId,
          interactions: []
        }
        
        // Criar lead
        const result = await createLead(leadData)
        
        if (result.success) {
          successCount++
        } else {
          errors.push(`Linha ${i + 2}: ${result.error || 'Erro ao criar lead'}`)
          errorCount++
        }
        
      } catch (error) {
        errors.push(`Linha ${i + 2}: Erro inesperado - ${error}`)
        errorCount++
      }
    }
    
    return { successCount, errorCount, errors }
  }

  // Função para gerar template CSV
  const generateTemplate = () => {
    const templateContent = `Nome,Email,Telefone,Empresa,Status,Observações
"João Silva","joao@exemplo.com","(11) 9 9999-9999","Empresa XYZ","Novo Lead","Interessado em nossos serviços"
"Maria Santos","maria@exemplo.com","(21) 9 8888-8888","Tech Corp","Qualificado","Reunião agendada para próxima semana"
"Pedro Oliveira","pedro@exemplo.com","(85) 9 7777-7777","StartupABC","Em Negociação","Proposta enviada"`

    const now = new Date()
    const dateStr = now.toLocaleDateString('pt-BR').replace(/\//g, '-')
    const filename = `template-leads_${dateStr}.csv`
    
    downloadCSV(templateContent, filename)
    toast.success("Template CSV baixado com sucesso!")
  }

  const handleImport = () => {
    if (onImportCsv) {
      onImportCsv()
    } else {
      // Trigger file input
      fileInputRef.current?.click()
    }
  }

  // Função para processar arquivo selecionado
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Verificar se é um arquivo CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error("Por favor, selecione um arquivo CSV")
      return
    }
    
    setIsImporting(true)
    
    try {
      // Buscar status disponíveis
      const statusResult = await getAllStatus()
      if (statusResult.error) {
        toast.error(statusResult.error)
        return
      }
      
      const statuses = statusResult.status
      if (statuses.length === 0) {
        toast.error("Nenhum status encontrado. Crie um status primeiro.")
        return
      }
      
      // Processar arquivo CSV
      const csvRows = await processCSVFile(file)
      
      if (csvRows.length === 0) {
        toast.error("Nenhum dado válido encontrado no arquivo CSV")
        return
      }
      
      toast.info(`Processando ${csvRows.length} leads...`)
      
      // Importar leads
      const result = await importLeadsFromCSV(csvRows, statuses)
      
      // Mostrar resultado
      if (result.successCount > 0) {
        toast.success(`${result.successCount} leads importados com sucesso!`)
        onLeadChange?.() // Chama o callback para recarregar o kanban
      }
      
      if (result.errorCount > 0) {
        const errorMessage = `${result.errorCount} erros encontrados:\n${result.errors.slice(0, 5).join('\n')}${result.errors.length > 5 ? '\n...' : ''}`
        toast.error(errorMessage, { duration: 10000 })
        console.error("Erros de importação:", result.errors)
      }
      
      if (result.successCount === 0 && result.errorCount > 0) {
        toast.error("Nenhum lead foi importado devido a erros")
      }
      
    } catch (error) {
      console.error("Erro ao importar CSV:", error)
      toast.error("Erro ao processar arquivo CSV")
    } finally {
      setIsImporting(false)
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
    <>
      {/* Input oculto para seleção de arquivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline"
              className="h-9 w-9 p-0"
              disabled={isImporting}
              title="Importar CSV"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleImport} className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Importar Arquivo CSV
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={generateTemplate} className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Baixar Template CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="outline"
          onClick={handleExport}
          className="h-9 w-9 p-0"
          title="Exportar CSV"
          disabled={isExporting || isImporting}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
}