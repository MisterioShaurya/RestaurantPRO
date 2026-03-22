/**
 * Print Utility for Bills and KOTs
 */

export interface PrintableItem {
  name: string;
  qty: number;
  price: number;
}

export interface BillPrintData {
  billNumber?: string;
  tableNumber?: number | null;
  customerName?: string;
  customerPhone?: string;
  items: PrintableItem[];
  subtotal: number;
  discount?: number;
  tax: number;
  roundOff?: number;
  total: number;
  paymentMode?: string;
  date?: Date;
}

export interface KOTPrintData {
  orderNumber: string | number;
  tableNumber?: number | null;
  items: Array<{ name: string; quantity: number }>;
  specialInstructions?: string;
  date?: Date;
}

/**
 * Generate formatted bill content for printing
 */
export function generateBillContent(data: BillPrintData): string {
  const now = data.date || new Date();
  const billNumber = data.billNumber || '';
  const discount = data.discount || 0;
  const roundOff = data.roundOff || 0;

  return `
========== RESTAURANT BILL ==========
${billNumber ? `Bill #: ${billNumber}` : ''}
Date: ${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
${data.tableNumber ? `Table: ${data.tableNumber}` : `Type: Walk-in`}
${data.customerName ? `Customer: ${data.customerName}` : ''}
${data.customerPhone ? `Phone: ${data.customerPhone}` : ''}
======================================
${data.items
  .map(
    (item) =>
      `${item.name.substring(0, 25).padEnd(25)} x${item.qty} ₹${(item.price * item.qty).toFixed(2).padStart(7)}`
  )
  .join('\n')}
======================================
Subtotal...................... ₹${data.subtotal.toFixed(2).padStart(7)}
${discount > 0 ? `Discount..................... -₹${discount.toFixed(2).padStart(7)}\n` : ''}Tax (10%).................... ₹${data.tax.toFixed(2).padStart(7)}
${roundOff !== 0 ? `Round Off.................... ${roundOff > 0 ? '+' : '-'}₹${Math.abs(roundOff).toFixed(2).padStart(7)}\n` : ''}======================================
TOTAL......................... ₹${data.total.toFixed(2).padStart(7)}
======================================
Payment Mode: ${(data.paymentMode || 'CASH').toUpperCase()}

   **Thank You! Visit Again**
      Have a Great Day!
======================================
  `.trim();
}

/**
 * Generate formatted KOT content for printing
 */
export function generateKOTContent(data: KOTPrintData): string {
  const now = data.date || new Date();

  return `
=================== KOT ===================
Date: ${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
Table: ${data.tableNumber || 'Walk-in'}
Order #${data.orderNumber}
==========================================
${data.items.map((item) => `${item.name} x${item.quantity}`).join('\n')}
${data.specialInstructions ? `
Special Instructions:
${data.specialInstructions}
` : ''}==========================================
  `.trim();
}

/**
 * Print bill to thermal printer
 */
export function printBill(data: BillPrintData): void {
  const content = generateBillContent(data);
  const printWindow = window.open('', '', 'height=700,width=420');
  
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bill</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            margin: 10px;
            background: white;
            color: #000;
          }
          pre {
            font-size: 12px;
            line-height: 1.4;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <pre>${content}</pre>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  } else {
    console.error('Failed to open print window');
  }
}

/**
 * Print KOT to kitchen display
 */
export function printKOT(data: KOTPrintData): void {
  const content = generateKOTContent(data);
  const printWindow = window.open('', '', 'height=700,width=420');
  
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>KOT</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            margin: 10px;
            background: white;
            color: #000;
          }
          pre {
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-weight: bold;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            pre {
              font-size: 12px;
            }
          }
        </style>
      </head>
      <body>
        <pre>${content}</pre>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  } else {
    console.error('Failed to open print window');
  }
}

/**
 * Print to specific printer (requires printer selection)
 */
export function printToPrinter(
  content: string,
  printerType: 'bill' | 'kot' = 'bill'
): void {
  const printWindow = window.open('', '', 'height=700,width=420');
  
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${printerType.toUpperCase()}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            margin: 10px;
            background: white;
            color: #000;
          }
          pre {
            font-size: 12px;
            line-height: 1.4;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <pre>${content}</pre>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
}
