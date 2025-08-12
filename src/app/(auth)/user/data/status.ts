'use server'

import { adminDb } from '@/firebase/firebase-admin'
import { getUserData } from '@/mr-auth/actions/getUserData'

export interface Status {
  id: string
  title: string
  color: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateStatusData {
  title: string
  color: string
}

// Helper para normalizar título para ID
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
    .trim()
}

// Helper para gerar ordem eficiente
async function getNextOrder(userId: string): Promise<number> {
  try {
    const statusRef = adminDb
      .collection('kanbans')
      .doc(userId)
      .collection('status')
      .orderBy('order', 'desc')
      .limit(1)

    const snapshot = await statusRef.get()
    
    if (snapshot.empty) {
      return 1000 // Primeira ordem
    }

    const lastStatus = snapshot.docs[0].data()
    return (lastStatus.order || 0) + 1000
  } catch (error) {
    console.error('Erro ao calcular próxima ordem:', error)
    return 1000
  }
}

// Helper para calcular ordem entre dois itens
function calculateOrderBetween(orderBefore: number, orderAfter: number): number {
  return Math.floor((orderBefore + orderAfter) / 2)
}

export async function createStatus(data: CreateStatusData): Promise<{ success: boolean; error?: string; status?: Status }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    if (!data.title.trim()) {
      return { success: false, error: 'Título é obrigatório' }
    }

    const normalizedId = normalizeTitle(data.title)
    
    if (!normalizedId) {
      return { success: false, error: 'Título inválido' }
    }

    const statusRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .doc(normalizedId)

    // Verifica se já existe um status com o mesmo ID
    const existingStatus = await statusRef.get()
    if (existingStatus.exists) {
      return { success: false, error: 'Já existe um status com este título' }
    }

    const order = await getNextOrder(user.uid)
    const now = new Date()
    
    const statusData = {
      title: data.title.trim(),
      color: data.color,
      order,
      createdAt: now,
      updatedAt: now
    }

    await statusRef.set(statusData)

    const newStatus: Status = {
      id: normalizedId,
      ...statusData
    }
    
    return { success: true, status: newStatus }
  } catch (error) {
    console.error('Erro ao criar status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

export async function getAllStatus(): Promise<{ status: Status[]; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { status: [], error: 'Usuário não autenticado' }
    }

    const statusRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .orderBy('order', 'asc')

    const snapshot = await statusRef.get()
    
    const status: Status[] = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        color: data.color,
        order: data.order,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      }
    })
    
    return { status }
  } catch (error) {
    console.error('Erro ao buscar status:', error)
    return { 
      status: [], 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

export async function updateStatus(id: string, data: Partial<CreateStatusData>): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const statusRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .doc(id)

    const existingStatus = await statusRef.get()
    if (!existingStatus.exists) {
      return { success: false, error: 'Status não encontrado' }
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (data.title !== undefined) {
      updateData.title = data.title.trim()
    }

    if (data.color !== undefined) {
      updateData.color = data.color
    }

    await statusRef.update(updateData)
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

export async function deleteStatus(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const statusRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .doc(id)

    const existingStatus = await statusRef.get()
    if (!existingStatus.exists) {
      return { success: false, error: 'Status não encontrado' }
    }

    await statusRef.delete()
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

export async function reorderStatus(id: string, newOrder: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const statusRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .doc(id)

    const existingStatus = await statusRef.get()
    if (!existingStatus.exists) {
      return { success: false, error: 'Status não encontrado' }
    }

    await statusRef.update({
      order: newOrder,
      updatedAt: new Date()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao reordenar status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}
