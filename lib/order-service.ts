/**
 * Order Service - Handles order and KOT creation with duplicate prevention
 * Works with localOrderManager to ensure no MongoDB uploads
 */

import { localOrderManager, LocalOrder, LocalKOT } from './local-order-manager'

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
   * Create order with items (only NEW items not previously sent to KOT)
   * Fixes the duplicate pasta issue by filtering lastSentQty
   */
  createOrderWithKOT(
    options: OrderServiceOptions
  ): { order: LocalOrder; kot: LocalKOT | null } {
    const {
      tableNumber,
      customerName,
      items,
      subtotal = 0,
      tax = 0,
      discount = 0,
    } = options

    // Filter to only NEW items or items with INCREASED quantity
    const newItems = items.filter((item) => {
      const lastQty = item.lastSentQty ?? 0
      const currentQty = item.qty || item.quantity || 0
      return currentQty > lastQty // Only include if quantity increased or new
    })

    if (newItems.length === 0) {
      throw new Error('No new items to order')
    }

    // Calculate totals from filtered items
    const calculatedSubtotal = newItems.reduce(
      (sum, item) => sum + item.price * (item.qty || item.quantity || 0),
      0
    )

    // Create order with only new items
    const order = localOrderManager.createOrder({
      number: this.generateOrderNumber(),
      tableNumber,
      customerName,
      items: newItems.map((item) => ({
        name: item.name,
        price: item.price,
        qty: item.qty || item.quantity || 0,
      })),
      subtotal: calculatedSubtotal,
      tax: calculatedSubtotal * 0.1,
      discount,
      total: calculatedSubtotal + calculatedSubtotal * 0.1 - discount,
      status: 'pending',
      kotCreated: false,
    })

    // Automatically create KOT from the order
    const kot = localOrderManager.createKOT(order.id)

    return { order, kot: kot || undefined }
  }

  /**
   * Send additional items to KOT for existing order
   * Only sends items that haven't been previously sent or have increased quantity
   */
  sendAdditionalItemsToKOT(
    orderId: string,
    newItems: OrderServiceItem[]
  ): LocalKOT | null {
    const order = localOrderManager.getOrderById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    // Check for items that need to be sent
    const itemsToAdd = newItems.filter((item) => {
      const lastQty = item.lastSentQty ?? 0
      const currentQty = item.qty || item.quantity || 0
      return currentQty > lastQty
    })

    if (itemsToAdd.length === 0) {
      console.log('No new items to add to KOT')
      return null
    }

    // Add each new item to the order
    for (const item of itemsToAdd) {
      const addedQty = (item.qty || item.quantity || 0) - (item.lastSentQty ?? 0)
      localOrderManager.addItemToOrder(orderId, {
        name: item.name,
        price: item.price,
        qty: addedQty, // Only add the DIFFERENCE
      })
    }

    // Create a new KOT with only the new items
    const existingKOTs = localOrderManager.getKOTsByOrderId(orderId)

    const kot: LocalKOT = {
      id: `kot-${Date.now()}-${Math.random()}`,
      orderId,
      orderNumber: order.number,
      tableNumber: order.tableNumber,
      items: itemsToAdd.map((item) => ({
        name: item.name,
        quantity: (item.qty || item.quantity || 0) - (item.lastSentQty ?? 0),
      })),
      status: 'pending',
      createdAt: new Date().toISOString(),
      printCount: 0,
    }

    const kots = localOrderManager.getAllKOTs()
    kots.push(kot)
    ;(localOrderManager as any).kotsKey =
      '__LOCAL_KOTS__'
    localStorage.setItem(
      '__LOCAL_KOTS__',
      JSON.stringify(kots)
    )

    return kot
  }

  /**
   * Get all pending orders for a table
   */
  getTableOrders(tableNumber: number): LocalOrder[] {
    return localOrderManager
      .getAllOrders()
      .filter(
        (o) =>
          o.tableNumber === tableNumber && o.status !== 'completed'
      )
  }

  /**
   * Get order with all associated KOTs
   */
  getOrderWithKOTs(
    orderId: string
  ): { order: LocalOrder; kots: LocalKOT[] } | null {
    const order = localOrderManager.getOrderById(orderId)
    if (!order) return null

    const kots = localOrderManager.getKOTsByOrderId(orderId)
    return { order, kots }
  }

  /**
   * Complete order and mark as paid
   */
  completeOrder(orderId: string): LocalOrder | null {
    return localOrderManager.updateOrder(orderId, { status: 'completed' })
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: string): boolean {
    return localOrderManager.deleteOrder(orderId)
  }

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }

  /**
   * Get all KOT logs (for chef view)
   */
  getAllPendingKOTs(): LocalKOT[] {
    return localOrderManager.getPendingKOTs()
  }

  /**
   * Mark KOT as received by chef
   */
  markKOTReceived(kotId: string): LocalKOT | null {
    return localOrderManager.updateKOT(kotId, { status: 'received' })
  }

  /**
   * Mark KOT as ready
   */
  markKOTReady(kotId: string): LocalKOT | null {
    return localOrderManager.updateKOT(kotId, { status: 'ready' })
  }

  /**
   * Print KOT (increment print count)
   */
  printKOT(kotId: string): LocalKOT | null {
    return localOrderManager.incrementKOTPrintCount(kotId)
  }
}

export const orderService = new OrderService()
