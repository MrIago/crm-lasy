// Utilitários para gerenciamento de ordenação

// Ordem inicial padrão
export const DEFAULT_ORDER_START = 1000

// Incremento padrão entre ordens
export const DEFAULT_ORDER_INCREMENT = 1000

// Helper para calcular ordem entre dois itens
export function calculateOrderBetween(orderBefore: number, orderAfter: number): number {
  return Math.floor((orderBefore + orderAfter) / 2)
}

// Helper para gerar próxima ordem baseada na última ordem
export function getNextOrderFromLast(lastOrder?: number): number {
  return (lastOrder || 0) + DEFAULT_ORDER_INCREMENT
}

// Helper para verificar se duas ordens estão muito próximas para inserção
export function ordersAreTooClose(orderBefore: number, orderAfter: number): boolean {
  return Math.abs(orderAfter - orderBefore) < 2
}

// Helper para rebalancear ordens sequenciais
export function generateRebalancedOrders(itemCount: number): number[] {
  const orders: number[] = []
  for (let i = 0; i < itemCount; i++) {
    orders.push((i + 1) * DEFAULT_ORDER_INCREMENT)
  }
  return orders
}

// Helper para calcular nova ordem baseada na posição desejada
export function calculateNewOrder(
  position: number,
  allOrders: number[]
): number {
  if (position === 0) {
    // Movendo para o início
    const firstOrder = allOrders[0] || DEFAULT_ORDER_START
    return firstOrder - DEFAULT_ORDER_INCREMENT
  }
  
  if (position >= allOrders.length - 1) {
    // Movendo para o final
    const lastOrder = allOrders[allOrders.length - 1] || DEFAULT_ORDER_START
    return lastOrder + DEFAULT_ORDER_INCREMENT
  }
  
  // Movendo para o meio
  const beforeOrder = allOrders[position - 1] || DEFAULT_ORDER_START
  const afterOrder = allOrders[position] || DEFAULT_ORDER_START + DEFAULT_ORDER_INCREMENT
  return calculateOrderBetween(beforeOrder, afterOrder)
}
