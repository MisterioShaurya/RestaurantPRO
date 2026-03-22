/**
 * Example: How to integrate offline sync and auto-print in your POS form
 * This shows how to use the new features in your order creation flow
 */

import { offlineSyncManager } from '@/lib/offline-sync';
import { printBill } from '@/lib/print-utils';
import { useOnlineStatus } from '@/hooks/use-online-status';

// Example function to create an order with auto-print
export async function createOrderWithAutoPrint(orderData: {
  tableNumber?: number;
  customerName?: string;
  items: Array<{ name: string; qty: number; price: number }>;
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  paymentMode: string;
  autoprint?: boolean;
}) {
  try {
    // Calculate values
    const discount = orderData.discount || 0;
    const subtotal = orderData.subtotal;
    const tax = orderData.tax;
    const total = orderData.total;

    // Create the order via API
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableNumber: orderData.tableNumber,
        customerName: orderData.customerName,
        items: orderData.items.map((item) => ({
          itemName: item.name,
          quantity: item.qty,
          price: item.price,
        })),
        subtotal,
        tax,
        discount,
        total,
        paymentMethod: orderData.paymentMode,
        status: 'pending',
        autoprint: true, // Always autom-print bills
      }),
    });

    if (response.ok) {
      const { order, autoprint } = await response.json();

      // If autoprint is enabled, print the bill
      if (autoprint) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay
        printBill({
          billNumber: `BILL-${order.orderNumber}`,
          tableNumber: orderData.tableNumber,
          customerName: orderData.customerName,
          items: orderData.items,
          subtotal,
          discount,
          tax,
          total,
          paymentMode: orderData.paymentMode,
        });
      }

      // If offline, add to sync queue
      if (!navigator.onLine) {
        await offlineSyncManager.addToSyncQueue({
          type: 'bill',
          action: 'create',
          endpoint: '/api/billing',
          data: {
            tableNumber: orderData.tableNumber,
            customerName: orderData.customerName,
            items: orderData.items,
            subtotal,
            discount,
            tax,
            total,
            paymentMode: orderData.paymentMode,
          },
          timestamp: Date.now(),
          maxRetries: 3,
        });
      }

      return { success: true, order };
    }

    throw new Error('Failed to create order');
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Save to offline queue if network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      await offlineSyncManager.addToSyncQueue({
        type: 'order',
        action: 'create',
        endpoint: '/api/orders',
        data: orderData,
        timestamp: Date.now(),
        maxRetries: 5,
      });
      
      return {
        success: true,
        offline: true,
        message: 'Order saved locally. Will sync when online.',
      };
    }
    
    throw error;
  }
}

// Example component showing online status
export function OrderFormWithOfflineStatus() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        />
        <span className="text-sm font-medium">
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>

      {!isOnline && (
        <div className="bg-amber-50 border-l-4 border-l-amber-500 p-3 mb-4 rounded">
          <p className="text-xs text-amber-800 font-medium">
            📡 You're in offline mode. All data will be saved locally and synced when you're back online.
          </p>
        </div>
      )}

      {/* Rest of your form */}
    </div>
  );
}

// Example of manual print without order creation
export async function printSavedBill(billData: any) {
  printBill({
    billNumber: billData.billNumber,
    tableNumber: billData.tableNumber,
    customerName: billData.customerName,
    customerPhone: billData.customerPhone,
    items: billData.items,
    subtotal: billData.subtotal,
    discount: billData.discount,
    tax: billData.tax,
    total: billData.total,
    paymentMode: billData.paymentMode,
  });
}

// Example of handling print queue
export async function handlePrintQueue() {
  // View pending prints from offline-sync manager
  const printItems = await offlineSyncManager.getPrintQueue(); // If method exists
  
  // Or manually add to print queue
  try {
    const printId = await offlineSyncManager.addToPrintQueue('bill', {
      tableNumber: 5,
      items: [{ name: 'Biriyani', qty: 2, price: 250 }],
      total: 500,
    });
    
    console.log('Added to print queue:', printId);
  } catch (error) {
    console.error('Failed to add to print queue:', error);
  }
}

// Example: Force sync all pending items
export async function syncAllPendingData() {
  try {
    // This is called automatically, but you can manually trigger it
    await (offlineSyncManager as any).syncAll();
    console.log('Sync completed');
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

/**
 * Usage in React Component:
 * 
 * const handleSubmitOrder = async (e) => {
 *   e.preventDefault();
 *   
 *   const result = await createOrderWithAutoPrint({
 *     tableNumber: formData.table,
 *     customerName: formData.customerName,
 *     items: cartItems,
 *     subtotal: calculateSubtotal(),
 *     tax: calculateTax(),
 *     discount: formData.discount,
 *     total: calculateTotal(),
 *     paymentMode: formData.paymentMode,
 *   });
 *   
 *   if (result.success) {
 *     alert('Order created successfully!');
 *     clearForm();
 *   }
 * };
 */
