'use server'

import { adminDb } from '@/firebase/firebase-admin'
import { getUserData } from '@/mr-auth/actions/getUserData'
import { normalizeTitle } from '../helpers/useNormalizeId'
import { 
  getNextOrderFromLast, 
  calculateOrderBetween, 
  ordersAreTooClose,
  generateRebalancedOrders,
  DEFAULT_ORDER_START,
  DEFAULT_ORDER_INCREMENT
} from '../helpers/useOrder'

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
      return DEFAULT_ORDER_START // Primeira ordem
    }

    const lastStatus = snapshot.docs[0].data()
    return getNextOrderFromLast(lastStatus.order)
  } catch (error) {
    console.error('Erro ao calcular próxima ordem:', error)
    return DEFAULT_ORDER_START
  }
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

    const updateData: {
      updatedAt: Date
      title?: string
      color?: string
    } = {
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

export async function reorderStatus(id: string, newPosition: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Busca todos os status ordenados
    const allStatusRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .orderBy('order', 'asc')

    const allStatusSnapshot = await allStatusRef.get()
    const allStatus = allStatusSnapshot.docs

    if (newPosition < 0 || newPosition >= allStatus.length) {
      return { success: false, error: 'Posição inválida' }
    }

    // Encontra o status que será movido
    const targetStatusIndex = allStatus.findIndex(doc => doc.id === id)
    if (targetStatusIndex === -1) {
      return { success: false, error: 'Status não encontrado' }
    }

    // Se a posição não mudou, não faz nada
    if (targetStatusIndex === newPosition) {
      return { success: true }
    }

    // Extrai todas as ordens atuais
    const allOrders = allStatus.map(doc => doc.data().order || DEFAULT_ORDER_START)
    
    let newOrder: number

    if (newPosition === 0) {
      // Movendo para o início
      const firstOrder = allOrders[0] || DEFAULT_ORDER_START
      newOrder = firstOrder - DEFAULT_ORDER_INCREMENT
    } else if (newPosition === allStatus.length - 1) {
      // Movendo para o final
      const lastOrder = allOrders[allOrders.length - 1] || DEFAULT_ORDER_START
      newOrder = lastOrder + DEFAULT_ORDER_INCREMENT
    } else {
      // Movendo para o meio - calcula a ordem entre os dois vizinhos
      const beforeOrder = allOrders[newPosition - 1] || DEFAULT_ORDER_START
      const afterOrder = allOrders[newPosition] || DEFAULT_ORDER_START + DEFAULT_ORDER_INCREMENT
      newOrder = calculateOrderBetween(beforeOrder, afterOrder)
      
      // Se a diferença for muito pequena, reorganiza os números
      if (ordersAreTooClose(beforeOrder, afterOrder)) {
        return await rebalanceOrders(user.uid, id, newPosition)
      }
    }

    const statusRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .doc(id)

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

// Helper para rebalancear as ordens quando os números ficam muito próximos
async function rebalanceOrders(userId: string, targetId: string, newPosition: number): Promise<{ success: boolean; error?: string }> {
  try {
    const allStatusRef = adminDb
      .collection('kanbans')
      .doc(userId)
      .collection('status')
      .orderBy('order', 'asc')

    const allStatusSnapshot = await allStatusRef.get()
    const allStatus = allStatusSnapshot.docs

    // Gera ordens rebalanceadas
    const rebalancedOrders = generateRebalancedOrders(allStatus.length)
    const batch = adminDb.batch()
    
    allStatus.forEach((doc, index) => {
      if (doc.id === targetId) return // Pula o item que está sendo movido
      
      let newIndex = index
      if (index >= newPosition) {
        newIndex = index + 1 // Desloca os itens após a nova posição
      }
      
      const newOrder = rebalancedOrders[newIndex]
      batch.update(doc.ref, { order: newOrder, updatedAt: new Date() })
    })

    // Atualiza o item que está sendo movido
    const targetRef = adminDb
      .collection('kanbans')
      .doc(userId)
      .collection('status')
      .doc(targetId)
    
    batch.update(targetRef, { 
      order: rebalancedOrders[newPosition], 
      updatedAt: new Date() 
    })

    await batch.commit()
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao rebalancear ordens:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}
