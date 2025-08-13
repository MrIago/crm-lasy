"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Construction, Users, ArrowRight, Settings, BarChart3, Shield } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Painel de controle para gerenciamento avançado do sistema CRM
          </p>
        </div>

        {/* Status Card */}
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Construction className="h-12 w-12 text-orange-500" />
              <Badge variant="outline" className="px-4 py-2 text-sm">
                Em Desenvolvimento
              </Badge>
            </div>
            <CardTitle className="text-2xl">Área em Construção</CardTitle>
            <CardDescription className="text-base">
              O dashboard administrativo está sendo desenvolvido e estará disponível em breve
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-muted/30">
                <Users className="h-6 w-6 text-blue-500" />
                <span className="font-medium">Gerenciamento de Usuários</span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-muted/30">
                <BarChart3 className="h-6 w-6 text-green-500" />
                <span className="font-medium">Relatórios & Analytics</span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-muted/30">
                <Settings className="h-6 w-6 text-purple-500" />
                <span className="font-medium">Configurações Avançadas</span>
              </div>
            </div>

            <div className="pt-4">
              <Button size="lg" asChild>
                <Link href="/user">
                  <Users className="mr-2 h-4 w-4" />
                  Acessar Dashboard do Usuário
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recursos Planejados</CardTitle>
            <CardDescription>
              Funcionalidades que estarão disponíveis no dashboard administrativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Gestão de Usuários
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                  <li>• Visualizar todos os usuários do sistema</li>
                  <li>• Gerenciar permissões e roles</li>
                  <li>• Monitorar atividade dos usuários</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-500" />
                  Analytics & Relatórios
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                  <li>• Métricas de conversão de leads</li>
                  <li>• Relatórios de performance</li>
                  <li>• Dashboards personalizados</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


