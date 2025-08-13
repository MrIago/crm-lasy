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
import { revalidateTag } from 'next/cache'

export interface InteractionHistory {
  date: Date
  notes: string
}

// Interface para dados do Firestore (com timestamp do Firestore)
interface FirestoreInteraction {
  date?: { toDate(): Date }
  notes: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  observations: string
  statusId: string
  interactions: InteractionHistory[]
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateLeadData {
  name: string
  email: string
  phone: string
  company: string
  observations: string
  statusId: string
  interactions: InteractionHistory[]
}

// Tags de revalidação
const LEADS_TAG = 'leads'
const KANBAN_TAG = 'kanban'

// Helper para gerar próxima ordem dentro de um status específico
async function getNextOrderInStatus(userId: string, statusId: string): Promise<number> {
  try {
    const leadsRef = adminDb
      .collection('kanbans')
      .doc(userId)
      .collection('status')
      .doc(statusId)
      .collection('leads')
      .orderBy('order', 'desc')
      .limit(1)

    const snapshot = await leadsRef.get()
    
    if (snapshot.empty) {
      return DEFAULT_ORDER_START // Primeira ordem no status
    }

    const lastLead = snapshot.docs[0].data()
    return getNextOrderFromLast(lastLead.order)
  } catch (error) {
    console.error('Erro ao calcular próxima ordem do lead:', error)
    return DEFAULT_ORDER_START
  }
}

export async function createLead(data: CreateLeadData): Promise<{ success: boolean; error?: string; lead?: Lead }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Validações básicas
    if (!data.name.trim()) {
      return { success: false, error: 'Nome é obrigatório' }
    }

    if (!data.email.trim()) {
      return { success: false, error: 'E-mail é obrigatório' }
    }

    if (!data.phone.trim()) {
      return { success: false, error: 'Telefone é obrigatório' }
    }

    if (!data.statusId) {
      return { success: false, error: 'Status é obrigatório' }
    }

    // Gera ID baseado no nome + timestamp para evitar duplicatas
    const baseId = normalizeTitle(data.name)
    const timestamp = Date.now()
    const leadId = `${baseId}-${timestamp}`

    // Verifica se o status existe
    const statusRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .doc(data.statusId)

    const statusDoc = await statusRef.get()
    if (!statusDoc.exists) {
      return { success: false, error: 'Status não encontrado' }
    }

    // Referência para o lead
    const leadRef = statusRef.collection('leads').doc(leadId)

    const order = await getNextOrderInStatus(user.uid, data.statusId)
    const now = new Date()
    
    const leadData = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      company: data.company.trim(),
      observations: data.observations.trim(),
      statusId: data.statusId,
      interactions: data.interactions,
      order,
      createdAt: now,
      updatedAt: now
    }

    await leadRef.set(leadData)

    const newLead: Lead = {
      id: leadId,
      ...leadData
    }

    // Revalidar tags
    revalidateTag(LEADS_TAG)
    revalidateTag(KANBAN_TAG)
    revalidateTag(`leads-${data.statusId}`)
    
    return { success: true, lead: newLead }
  } catch (error) {
    console.error('Erro ao criar lead:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

export async function getAllLeads(): Promise<{ leads: Lead[]; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { leads: [], error: 'Usuário não autenticado' }
    }

    // Busca todos os status
    const statusRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')

    const statusSnapshot = await statusRef.get()
    const allLeads: Lead[] = []

    // Para cada status, busca os leads
    for (const statusDoc of statusSnapshot.docs) {
      const leadsRef = statusDoc.ref
        .collection('leads')
        .orderBy('order', 'asc')

      const leadsSnapshot = await leadsRef.get()
      
      const statusLeads: Lead[] = leadsSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          observations: data.observations,
          statusId: statusDoc.id,
          interactions: data.interactions?.map((interaction: FirestoreInteraction) => ({
            date: interaction.date?.toDate() || new Date(),
            notes: interaction.notes
          })) || [],
          order: data.order,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        }
      })
      
      allLeads.push(...statusLeads)
    }
    
    return { leads: allLeads }
  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    return { 
      leads: [], 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

export async function getLeadsByStatus(statusId: string): Promise<{ leads: Lead[]; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { leads: [], error: 'Usuário não autenticado' }
    }

    const leadsRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .doc(statusId)
      .collection('leads')
      .orderBy('order', 'asc')

    const snapshot = await leadsRef.get()
    
    const leads: Lead[] = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        observations: data.observations,
        statusId: statusId,
        interactions: data.interactions?.map((interaction: FirestoreInteraction) => ({
          date: interaction.date?.toDate() || new Date(),
          notes: interaction.notes
        })) || [],
        order: data.order,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      }
    })
    
    return { leads }
  } catch (error) {
    console.error('Erro ao buscar leads por status:', error)
    return { 
      leads: [], 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

export async function readLead(statusId: string, id: string): Promise<{ lead: Lead | null; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { lead: null, error: 'Usuário não autenticado' }
    }

    const leadRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .doc(statusId)
      .collection('leads')
      .doc(id)

    const leadDoc = await leadRef.get()
    
    if (!leadDoc.exists) {
      return { lead: null, error: 'Lead não encontrado' }
    }

    const data = leadDoc.data()!
    const lead: Lead = {
      id: leadDoc.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      observations: data.observations,
      statusId: statusId,
      interactions: data.interactions?.map((interaction: FirestoreInteraction) => ({
        date: interaction.date?.toDate() || new Date(),
        notes: interaction.notes
      })) || [],
      order: data.order,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    }
    
    return { lead }
  } catch (error) {
    console.error('Erro ao buscar lead:', error)
    return { 
      lead: null, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

export async function updateLead(statusId: string, id: string, data: Partial<CreateLeadData>): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const leadRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .doc(statusId)
      .collection('leads')
      .doc(id)

    const existingLead = await leadRef.get()
    if (!existingLead.exists) {
      return { success: false, error: 'Lead não encontrado' }
    }

    const updateData: {
      updatedAt: Date
      name?: string
      email?: string
      phone?: string
      company?: string
      observations?: string
      interactions?: InteractionHistory[]
    } = {
      updatedAt: new Date()
    }

    // Atualiza apenas os campos fornecidos
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.email !== undefined) updateData.email = data.email.trim()
    if (data.phone !== undefined) updateData.phone = data.phone.trim()
    if (data.company !== undefined) updateData.company = data.company.trim()
    if (data.observations !== undefined) updateData.observations = data.observations.trim()
    if (data.interactions !== undefined) updateData.interactions = data.interactions

    await leadRef.update(updateData)

    // Revalidar tags
    revalidateTag(LEADS_TAG)
    revalidateTag(KANBAN_TAG)
    revalidateTag(`leads-${statusId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

export async function deleteLead(statusId: string, id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const leadRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .doc(statusId)
      .collection('leads')
      .doc(id)

    const existingLead = await leadRef.get()
    if (!existingLead.exists) {
      return { success: false, error: 'Lead não encontrado' }
    }

    await leadRef.delete()

    // Revalidar tags
    revalidateTag(LEADS_TAG)
    revalidateTag(KANBAN_TAG)
    revalidateTag(`leads-${statusId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar lead:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

export async function deleteAllLeadsFromStatus(statusId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const leadsRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .doc(statusId)
      .collection('leads')

    // Busca todos os leads do status
    const leadsSnapshot = await leadsRef.get()
    
    if (leadsSnapshot.empty) {
      return { success: true } // Não há leads para deletar
    }

    // Deletar em lotes para otimizar performance
    const batch = adminDb.batch()
    leadsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })

    await batch.commit()

    // Revalidar tags
    revalidateTag(LEADS_TAG)
    revalidateTag(KANBAN_TAG)
    revalidateTag(`leads-${statusId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar leads do status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

export async function reorderLead(statusId: string, leadId: string, newPosition: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Busca todos os leads do status ordenados
    const allLeadsRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .doc(statusId)
      .collection('leads')
      .orderBy('order', 'asc')

    const allLeadsSnapshot = await allLeadsRef.get()
    const allLeads = allLeadsSnapshot.docs

    if (newPosition < 0 || newPosition >= allLeads.length) {
      return { success: false, error: 'Posição inválida' }
    }

    // Encontra o lead que será movido
    const targetLeadIndex = allLeads.findIndex(doc => doc.id === leadId)
    if (targetLeadIndex === -1) {
      return { success: false, error: 'Lead não encontrado' }
    }

    // Se a posição não mudou, não faz nada
    if (targetLeadIndex === newPosition) {
      return { success: true }
    }

    // Extrai todas as ordens atuais
    const allOrders = allLeads.map(doc => doc.data().order || DEFAULT_ORDER_START)
    
    let newOrder: number

    if (newPosition === 0) {
      // Movendo para o início
      const firstOrder = allOrders[0] || DEFAULT_ORDER_START
      newOrder = firstOrder - DEFAULT_ORDER_INCREMENT
    } else if (newPosition === allLeads.length - 1) {
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
        return await rebalanceLeadOrders(user.uid, statusId, leadId, newPosition)
      }
    }

    const leadRef = adminDb
      .collection('kanbans')
      .doc(user.uid)
      .collection('status')
      .doc(statusId)
      .collection('leads')
      .doc(leadId)

    await leadRef.update({
      order: newOrder,
      updatedAt: new Date()
    })

    // Revalidar tags
    revalidateTag(LEADS_TAG)
    revalidateTag(KANBAN_TAG)
    revalidateTag(`leads-${statusId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao reordenar lead:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

export async function moveLeadToStatus(fromStatusId: string, toStatusId: string, leadId: string, newPosition?: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUserData()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Verifica se os status existem
    const fromStatusRef = adminDb.collection('kanbans').doc(user.uid).collection('status').doc(fromStatusId)
    const toStatusRef = adminDb.collection('kanbans').doc(user.uid).collection('status').doc(toStatusId)
    
    const [fromStatusDoc, toStatusDoc] = await Promise.all([
      fromStatusRef.get(),
      toStatusRef.get()
    ])

    if (!fromStatusDoc.exists) {
      return { success: false, error: 'Status de origem não encontrado' }
    }

    if (!toStatusDoc.exists) {
      return { success: false, error: 'Status de destino não encontrado' }
    }

    // Busca o lead atual
    const leadRef = fromStatusRef.collection('leads').doc(leadId)
    const leadDoc = await leadRef.get()

    if (!leadDoc.exists) {
      return { success: false, error: 'Lead não encontrado' }
    }

    const leadData = leadDoc.data()!

    // Calcula nova ordem no status de destino
    let newOrder: number
    if (newPosition !== undefined) {
      // Busca todos os leads do status de destino
      const targetLeadsRef = toStatusRef.collection('leads').orderBy('order', 'asc')
      const targetLeadsSnapshot = await targetLeadsRef.get()
      const targetLeads = targetLeadsSnapshot.docs

      if (newPosition === 0) {
        // Inserindo no início
        const firstOrder = targetLeads[0]?.data().order || DEFAULT_ORDER_START
        newOrder = firstOrder - DEFAULT_ORDER_INCREMENT
      } else if (newPosition >= targetLeads.length) {
        // Inserindo no final
        const lastOrder = targetLeads[targetLeads.length - 1]?.data().order || DEFAULT_ORDER_START
        newOrder = lastOrder + DEFAULT_ORDER_INCREMENT
      } else {
        // Inserindo no meio
        const beforeOrder = targetLeads[newPosition - 1].data().order || DEFAULT_ORDER_START
        const afterOrder = targetLeads[newPosition].data().order || DEFAULT_ORDER_START + DEFAULT_ORDER_INCREMENT
        newOrder = calculateOrderBetween(beforeOrder, afterOrder)
      }
    } else {
      // Se não especificou posição, adiciona no final
      newOrder = await getNextOrderInStatus(user.uid, toStatusId)
    }

    // Usa transação para mover o lead
    await adminDb.runTransaction(async (transaction) => {
      // Remove do status antigo
      transaction.delete(leadRef)

      // Adiciona no novo status
      const newLeadRef = toStatusRef.collection('leads').doc(leadId)
      transaction.set(newLeadRef, {
        ...leadData,
        statusId: toStatusId,
        order: newOrder,
        updatedAt: new Date()
      })
    })

    // Revalidar tags
    revalidateTag(LEADS_TAG)
    revalidateTag(KANBAN_TAG)
    revalidateTag(`leads-${fromStatusId}`)
    revalidateTag(`leads-${toStatusId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao mover lead entre status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

// Helper para rebalancear as ordens dos leads quando os números ficam muito próximos
async function rebalanceLeadOrders(userId: string, statusId: string, targetId: string, newPosition: number): Promise<{ success: boolean; error?: string }> {
  try {
    const allLeadsRef = adminDb
      .collection('kanbans')
      .doc(userId)
      .collection('status')
      .doc(statusId)
      .collection('leads')
      .orderBy('order', 'asc')

    const allLeadsSnapshot = await allLeadsRef.get()
    const allLeads = allLeadsSnapshot.docs

    // Gera ordens rebalanceadas
    const rebalancedOrders = generateRebalancedOrders(allLeads.length)
    const batch = adminDb.batch()
    
    allLeads.forEach((doc, index) => {
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
      .doc(statusId)
      .collection('leads')
      .doc(targetId)
    
    batch.update(targetRef, { 
      order: rebalancedOrders[newPosition], 
      updatedAt: new Date() 
    })

    await batch.commit()
    
    return { success: true }
  } catch (error) {
    console.error('Erro ao rebalancear ordens dos leads:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}