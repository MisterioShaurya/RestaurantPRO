/**
 * Local Order & KOT Management
 * Manages all order and KOT data in browser storage (no MongoDB uploads)
 */

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface LocalOrder {
  id: string;
  number: string;
  tableNumber?: number;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMode?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: string;
  kotCreated: boolean;
}

export interface LocalKOT {
  id: string;
  orderId: string;
  orderNumber: string;
  tableNumber?: number;
  items: Array<{ name: string; quantity: number }>;
  status: 'pending' | 'received' | 'preparing' | 'ready' | 'served';
  createdAt: string;
  printCount: number;
  printedAt?: string;
}

class LocalOrderManager {
  private ordersKey = '__LOCAL_ORDERS__';
  private kotsKey = '__LOCAL_KOTS__';

  /**
   * Create new order with items
   */
  createOrder(data: Omit<LocalOrder, 'id' | 'createdAt'>): LocalOrder {
    const order: LocalOrder = {
      ...data,
      id: `order-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    };

    const orders = this.getAllOrders();
    orders.push(order);
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));

    return order;
  }

  /**
   * Get all orders
   */
  getAllOrders(): LocalOrder[] {
    try {
      const data = localStorage.getItem(this.ordersKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get order by ID
   */
  getOrderById(id: string): LocalOrder | null {
    const orders = this.getAllOrders();
    return orders.find((o) => o.id === id) || null;
  }

  /**
   * Update order
   */
  updateOrder(id: string, updates: Partial<LocalOrder>): LocalOrder | null {
    const orders = this.getAllOrders();
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) return null;

    orders[index] = { ...orders[index], ...updates };
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));

    return orders[index];
  }

  /**
   * Add item to existing order (fixes duplicate issue)
   * If item with same name exists, increment qty instead of adding duplicate
   */
  addItemToOrder(orderId: string, item: Omit<OrderItem, 'id'>): LocalOrder | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    // Check if item with same name already exists
    const existingItem = order.items.find((i) => i.name === item.name);

    if (existingItem) {
      // Increment quantity instead of adding duplicate
      existingItem.qty += item.qty;
    } else {
      // Add new item
      order.items.push({
        ...item,
        id: `item-${Date.now()}-${Math.random()}`,
      });
    }

    // Recalculate totals
    order.subtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    order.tax = order.subtotal * 0.1; // Assuming 10% tax
    order.total = order.subtotal + order.tax - order.discount;

    return this.updateOrder(orderId, order);
  }

  /**
   * Remove item from order
   */
  removeItemFromOrder(orderId: string, itemId: string): LocalOrder | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    order.items = order.items.filter((i) => i.id !== itemId);

    // Recalculate totals
    order.subtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    order.tax = order.subtotal * 0.1;
    order.total = order.subtotal + order.tax - order.discount;

    return this.updateOrder(orderId, order);
  }

  /**
   * Update item quantity
   */
  updateItemQty(orderId: string, itemId: string, qty: number): LocalOrder | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const item = order.items.find((i) => i.id === itemId);
    if (!item) return null;

    if (qty <= 0) {
      return this.removeItemFromOrder(orderId, itemId);
    }

    item.qty = qty;

    // Recalculate totals
    order.subtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    order.tax = order.subtotal * 0.1;
    order.total = order.subtotal + order.tax - order.discount;

    return this.updateOrder(orderId, order);
  }

  /**
   * Delete order
   */
  deleteOrder(id: string): boolean {
    const orders = this.getAllOrders();
    const filtered = orders.filter((o) => o.id !== id);

    if (filtered.length === orders.length) return false;

    localStorage.setItem(this.ordersKey, JSON.stringify(filtered));

    // Also delete associated KOT
    this.deleteKOTByOrderId(id);

    return true;
  }

  /**
   * Create KOT from order
   */
  createKOT(orderId: string): LocalKOT | null {
    const order = this.getOrderById(orderId);
    if (!order || order.kotCreated) return null;

    const kot: LocalKOT = {
      id: `kot-${Date.now()}-${Math.random()}`,
      orderId,
      orderNumber: order.number,
      tableNumber: order.tableNumber,
      items: order.items.map((item) => ({ name: item.name, quantity: item.qty })),
      status: 'pending',
      createdAt: new Date().toISOString(),
      printCount: 0,
    };

    const kots = this.getAllKOTs();
    kots.push(kot);
    localStorage.setItem(this.kotsKey, JSON.stringify(kots));

    // Mark order as KOT created
    this.updateOrder(orderId, { kotCreated: true });

    return kot;
  }

  /**
   * Get all KOTs
   */
  getAllKOTs(): LocalKOT[] {
    try {
      const data = localStorage.getItem(this.kotsKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get KOT by ID
   */
  getKOTById(id: string): LocalKOT | null {
    const kots = this.getAllKOTs();
    return kots.find((k) => k.id === id) || null;
  }

  /**
   * Get KOTs by order ID
   */
  getKOTsByOrderId(orderId: string): LocalKOT[] {
    const kots = this.getAllKOTs();
    return kots.filter((k) => k.orderId === orderId);
  }

  /**
   * Update KOT
   */
  updateKOT(id: string, updates: Partial<LocalKOT>): LocalKOT | null {
    const kots = this.getAllKOTs();
    const index = kots.findIndex((k) => k.id === id);

    if (index === -1) return null;

    kots[index] = { ...kots[index], ...updates };
    localStorage.setItem(this.kotsKey, JSON.stringify(kots));

    return kots[index];
  }

  /**
   * Increment KOT print count
   */
  incrementKOTPrintCount(kotId: string): LocalKOT | null {
    const kot = this.getKOTById(kotId);
    if (!kot) return null;

    return this.updateKOT(kotId, {
      printCount: (kot.printCount || 0) + 1,
      printedAt: new Date().toISOString(),
    });
  }

  /**
   * Delete KOT
   */
  deleteKOT(id: string): boolean {
    const kots = this.getAllKOTs();
    const filtered = kots.filter((k) => k.id !== id);

    if (filtered.length === kots.length) return false;

    localStorage.setItem(this.kotsKey, JSON.stringify(filtered));
    return true;
  }

  /**
   * Delete KOT by order ID
   */
  deleteKOTByOrderId(orderId: string): boolean {
    const kots = this.getAllKOTs();
    const filtered = kots.filter((k) => k.orderId !== orderId);

    if (filtered.length === kots.length) return false;

    localStorage.setItem(this.kotsKey, JSON.stringify(filtered));
    return true;
  }

  /**
   * Get pending KOTs (not served)
   */
  getPendingKOTs(): LocalKOT[] {
    return this.getAllKOTs().filter((k) => k.status !== 'served');
  }

  /**
   * Clear all orders and KOTs
   */
  clearAll(): void {
    localStorage.removeItem(this.ordersKey);
    localStorage.removeItem(this.kotsKey);
  }
}

export const localOrderManager = new LocalOrderManager();
