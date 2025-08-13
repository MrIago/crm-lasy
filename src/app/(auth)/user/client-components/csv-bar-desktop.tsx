"use client"

import { Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface CsvBarDesktopProps {
  onImportCsv?: () => void
  onExportCsv?: () => void
}

export default function CsvBarDesktop({ onImportCsv, onExportCsv }: CsvBarDesktopProps) {
  const handleImport = () => {
    if (onImportCsv) {
      onImportCsv()
    } else {
      toast.info("Funcionalidade de importar CSV em desenvolvimento")
    }
  }

  const handleExport = () => {
    if (onExportCsv) {
      onExportCsv()
    } else {
      toast.info("Funcionalidade de exportar CSV em desenvolvimento")
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
        title="Exportar leads para CSV"
      >
        <Download className="h-4 w-4" />
        Exportar CSV
      </Button>
    </div>
  )
}