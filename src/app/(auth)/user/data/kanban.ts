'use server'

import { adminDb } from '@/firebase/firebase-admin'
import { getUserData } from '@/mr-auth/actions/getUserData'

export interface Kanban {
  id: string
  createdAt: Date
  updatedAt: Date
}

export async function createKanban(): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const kanbanRef = adminDb.collection('kanbans').doc(user.uid)
    
    // Verifica se o kanban já existe
    const kanbanDoc = await kanbanRef.get()
    if (kanbanDoc.exists) {
      return { success: true } // Kanban já existe, não precisa criar novamente
    }

    const now = new Date()
    const kanbanData = {
      createdAt: now,
      updatedAt: now
    }

    await kanbanRef.set(kanbanData)
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar kanban:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

export async function getKanban(): Promise<{ kanban: Kanban | null; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { kanban: null, error: 'Usuário não autenticado' }
    }

    const kanbanRef = adminDb.collection('kanbans').doc(user.uid)
    const kanbanDoc = await kanbanRef.get()
    
    if (!kanbanDoc.exists) {
      return { kanban: null }
    }

    const data = kanbanDoc.data()
    const kanban: Kanban = {
      id: kanbanDoc.id,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date()
    }
    
    return { kanban }
  } catch (error) {
    console.error('Erro ao buscar kanban:', error)
    return { 
      kanban: null, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}
