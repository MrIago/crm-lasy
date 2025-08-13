"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Github, Video, ExternalLink, Users, Shield, Kanban, FileUp, Search, Download, Eye, Clock, Smartphone, Monitor, Zap, Coffee, MessageCircle, Flame, Database, Lock, Palette, Layers, Boxes } from "lucide-react"
import { useAuthStore } from "@/mr-auth"
import Link from "next/link"

export default function Home() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <Badge variant="outline" className="px-4 py-1">
              Teste Prático - Lasy.ai
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Lasy CRM
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mini CRM completo e responsivo desenvolvido com Next.js, TypeScript e Firebase. 
              Foco em usabilidade e design moderno.
            </p>
          </div>

          {user ? (
            <Button size="lg" asChild>
              <Link href="/user">
                <Users className="mr-2 h-4 w-4" />
                Acessar Dashboard
              </Link>
            </Button>
          ) : (
            <p className="text-muted-foreground">
              Faça login para acessar o dashboard
            </p>
          )}
        </div>

        {/* Video Presentation */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Video className="h-5 w-5" />
              Apresentação do Projeto
            </CardTitle>
            <CardDescription>
              Demonstração completa das funcionalidades implementadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src="https://www.youtube.com/embed/KXuJnqp8JFc"
                title="Apresentação Lasy CRM"
                className="absolute inset-0 w-full h-full"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>

        {/* Links Section */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-500" />
                Desenvolvimento - Parte 1
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full" asChild>
                <a href="https://www.loom.com/share/18767e65dac54ea38a03f43b9d79c358" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Assistir no Loom
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-500" />
                Desenvolvimento - Parte 2
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full" asChild>
                <a href="https://www.loom.com/share/10e7493bfa0c447b87b4005a3b4e6c8a" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Assistir no Loom
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Github className="h-5 w-5" />
                Código Fonte
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full" asChild>
                <a href="https://github.com/MrIago/crm-lasy" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  Ver no GitHub
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator className="max-w-4xl mx-auto" />

        {/* Requirements Check Section */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Requisitos do Teste</h2>
            <p className="text-muted-foreground">
              Todos os requisitos foram implementados com sucesso
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Core Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Funcionalidades Core</CardTitle>
                <CardDescription>Recursos principais do CRM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Autenticação de usuário
                    </p>
                    <p className="text-sm text-muted-foreground">Firebase Auth com sistema de RBAC</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Kanban className="h-4 w-4" />
                      Pipeline Kanban
                    </p>
                    <p className="text-sm text-muted-foreground">Drag & drop com colunas personalizáveis</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <FileUp className="h-4 w-4" />
                      Inserção e Importação
                    </p>
                    <p className="text-sm text-muted-foreground">Formulários e upload de CSV/XLSX</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Busca e Filtros
                    </p>
                    <p className="text-sm text-muted-foreground">Por nome, estágio, data e origem</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Exportação de dados
                    </p>
                    <p className="text-sm text-muted-foreground">Download em planilha Excel</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lead Details & UX */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Detalhes & UX</CardTitle>
                <CardDescription>Experiência do usuário aprimorada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Tela de detalhes completa
                    </p>
                    <p className="text-sm text-muted-foreground">Visualização e edição de leads</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Histórico de interações
                    </p>
                    <p className="text-sm text-muted-foreground">Timeline completa por lead</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <Smartphone className="h-4 w-4" />
                      Design Responsivo
                    </p>
                    <p className="text-sm text-muted-foreground">Interface otimizada desktop/mobile</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      UX Otimizada
                    </p>
                    <p className="text-sm text-muted-foreground">Tarefas comuns priorizadas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Validações e Máscaras</p>
                    <p className="text-sm text-muted-foreground">Campos formatados e validados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tech Stack */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Stack Tecnológica</CardTitle>
            <CardDescription>Principais tecnologias utilizadas no desenvolvimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <Badge variant="outline" className="text-sm px-3 py-1">Next.js 15</Badge>
                </div>
                <span className="text-sm text-muted-foreground text-center">Framework React</span>
              </div>
              
              <div className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-yellow-500" />
                  <Badge variant="outline" className="text-sm px-3 py-1">Firestore</Badge>
                </div>
                <span className="text-sm text-muted-foreground text-center">NoSQL Database</span>
              </div>
              
              <div className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-red-500" />
                  <Badge variant="outline" className="text-sm px-3 py-1">Firebase Auth</Badge>
                </div>
                <span className="text-sm text-muted-foreground text-center">Autenticação</span>
              </div>
              
              <div className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-blue-500" />
                  <Badge variant="outline" className="text-sm px-3 py-1">Shadcn/ui</Badge>
                </div>
                <span className="text-sm text-muted-foreground text-center">Componentes UI</span>
              </div>
              
              <div className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-cyan-500" />
                  <Badge variant="outline" className="text-sm px-3 py-1">Tailwind CSS</Badge>
                </div>
                <span className="text-sm text-muted-foreground text-center">Styling</span>
              </div>
              
              <div className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-500" />
                  <Badge variant="outline" className="text-sm px-3 py-1">Zustand</Badge>
                </div>
                <span className="text-sm text-muted-foreground text-center">State Management</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span>Feito com muito</span>
            <span className="text-red-500">❤️</span>
            <span>e</span>
            <Coffee className="h-4 w-4" />
            <span>por</span>
            <a 
              href="https://www.youtube.com/@mriago" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors underline"
            >
              Mr.IAgo
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            Com auxílio de IA, usando GitHub Copilot com Claude Sonnet 4
          </p>
          <div className="flex items-center justify-center gap-6 pt-4">
            <a 
              href="https://github.com/MrIago" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub Pessoal
            </a>
            <a 
              href="https://github.com/MrIagoUFV" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub Faculdade
            </a>
            <a 
              href="https://www.instagram.com/mriago/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Instagram
            </a>
            <a 
              href="https://wa.me/5522999675358" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}