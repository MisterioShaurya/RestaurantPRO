/**
 * Order Service - Handles order and KOT creation with database integration
 */

export interface OrderServiceItem {
  _id?: string
  name: string
  price: number
  qty: number
  quantity?: number
  lastSentQty?: number
  sentToKOT?: boolean
  itemName?: string
}

interface OrderServiceOptions {
  tableNumber?: number
  customerName?: string
  items: OrderServiceItem[]
  subtotal?: number
  tax?: number
  discount?: number
  total?: number
}

class OrderService {
  /**
   * Create order with items and KOT
   */
  async createOrderWithKOT(
    options: OrderServiceOptions
  ): Promise<{ order: any; kot: any | null }> {
    const {
      tableNumber,
      customerName,
      items,
      subtotal = 0,
      tax = 0,
      discount = 0,
    } = options

    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create order
    const order = {
      id: orderId,
      tableNumber,
      customerName,
      items,
      subtotal,
      tax,
      discount,
      total: subtotal + tax - discount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    // Create KOT
    const kot = {
      id: `kot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      tableNumber,
      items,
      createdAt: new Date().toISOString(),
    }

    try {
      // Save order to database
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })

      if (!orderRes.ok) {
        throw new Error('Failed to save order')
      }

      // Save KOT to database
      const kotRes = await fetch('/api/kot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kot),
      })

      if (!kotRes.ok) {
        throw new Error('Failed to save KOT')
      }

      return { order, kot }
    } catch (error) {
      console.error('Error creating order with KOT:', error)
      throw error
    }
  }

  /**
   * Send additional items to KOT
   */
  async sendAdditionalItemsToKOT(orderId: string, items: OrderServiceItem[]): Promise<any> {
    const kot = {
      id: `kot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      items,
      createdAt: new Date().toISOString(),
    }

    try {
      const res = await fetch('/api/kot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kot),
      })

      if (!res.ok) {
        throw new Error('Failed to save additional KOT')
      }

      return kot
    } catch (error) {
      console.error('Error sending additional items to KOT:', error)
      throw error
    }
  }

  private generateOrderNumber(): string {
    return `ORD-${Date.now()}`
  }
}

export const orderService = new OrderService()
