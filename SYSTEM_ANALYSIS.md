# Restaurant Management System - Comprehensive Architecture Analysis

**Project**: Restaurant Management System (Next.js + MongoDB + Electron)  
**Date**: March 21, 2026  
**Analysis Scope**: Styling, Orders/Bills, Chef Users, Notifications, Offline/Sync, Dashboard

---

## 1. GREEN AND YELLOW GRADIENT STYLING

### 1.1 Primary Color Definitions

**File**: [styles/theme.css](styles/theme.css#L104-L112)
```css
/* Food Color Palette */
:root {
  --color-fresh-green: #22c55e;      /* Green 500 */
  --color-warm-orange: #f97316;      /* Orange 500 */
  --color-tomato-red: #ef4444;        /* Red 500 */
  --color-mustard-yellow: #eab308;    /* Yellow 600 */
  --color-cream-bg: #faf8f3;          /* Cream/off-white */
  --color-light-text: #1f2937;        /* Gray 800 */
}
```

### 1.2 Gradient Usage in Components

**File**: [components/dashboard/header.tsx](components/dashboard/header.tsx#L17-L18)
```tsx
<div className="w-10 h-10 bg-gradient-to-br from-green-500 to-orange-500 rounded-full...">
  {user?.name?.charAt(0) || 'U'}
</div>
```
**Applied To**: User avatar - Green to Orange diagonal gradient

**File**: [components/chef-notifications.tsx](components/chef-notifications.tsx#L102-L107)
```tsx
<div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4...">
  <h3 className="font-semibold text-lg">Kitchen Orders</h3>
  <button onClick={() => setShowNotificationPanel(false)} ...>
    <X size={20} />
  </button>
</div>
```
**Applied To**: Notification panel header - Emerald gradient (left to right)

### 1.3 Tailwind Color Classes Used

**File**: [styles/theme.css](styles/theme.css) (Lines 4-100)

| Class | Color | Usage |
|-------|-------|-------|
| `bg-green-50`, `bg-green-100`, `bg-green-500`, `bg-green-600` | Green shades | Table status (available), success badges, primary buttons |
| `bg-yellow-50`, `bg-yellow-100`, `bg-yellow-200`, `bg-yellow-800` | Yellow shades | Table "hold" status, warning badges |
| `bg-orange-50`, `bg-orange-500`, `bg-orange-600` | Orange shades | Table occupied, secondary buttons, secondary color accent |
| `border-green-200`, `border-green-400` | Green borders | Table available hover states |
| `border-yellow-200`, `border-yellow-400` | Yellow borders | Table hold hover states |
| `border-emerald-600` | Emerald borders | Notification unread indicators |

### 1.4 Status Color Mapping

**File**: [styles/theme.css](styles/theme.css#L16-L26)
```css
.status-pending {
  @apply text-red-700 bg-red-50;
}

.status-preparing {
  @apply text-orange-700 bg-orange-50;
}

.status-ready {
  @apply text-green-700 bg-green-50;
}

.status-completed {
  @apply text-gray-700 bg-gray-50;
}
```

### 1.5 Button Styling with Colors

**File**: [styles/theme.css](styles/theme.css#L32-L42)
```css
.btn-primary {
  @apply bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95;
}

.btn-secondary {
  @apply bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95;
}
```

### 1.6 Base Theme Configuration

**File**: [styles/globals.css](styles/globals.css#L1-L20)
```css
@theme inline {
  --font-sans: 'Geist', sans-serif;
  --font-mono: 'Geist Mono', monospace;
  
  /* Premium Food App Theme */
  --color-accent: #FF6F00;           /* Deep Orange */
  --color-accent-dark: #E65100;
  --color-accent-light: #FFB366;
  --color-success: #388e3c;           /* Green */
  --color-warning: #f57c00;           /* Orange/Amber */
}
```

---

## 2. CURRENT ORDER/BILL SYSTEM STRUCTURE

### 2.1 Order API Routes

**File**: [app/api/orders/route.ts](app/api/orders/route.ts)

#### GET - Fetch All Orders
```typescript
export async function GET(req: NextRequest) {
  // Fetches from MongoDB 'orders' collection
  // Returns: { orders: [...] }
  // Limit: 200 orders, sorted by createdAt descending
  // Data normalized: _id and createdAt converted to strings
}
```

#### POST - Create New Order
```typescript
export async function POST(req: NextRequest) {
  // Accepts: items[], subtotal, discount, tax, total, paymentMethod, customerName, tableNumber, status
  // Creates order with auto-generated orderNumber (random 1000-9999)
  // Stores: orderNumber, customerName, tableNumber, items, prices, paymentMethod, status
  // Returns: { order: {...normalized} }
}
```

#### PATCH - Update Order Status
```typescript
// Dynamic route: [id]/route.ts
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // Updates: { status: string }
  // Possible statuses: 'pending', 'confirmed', 'preparing', 'ready', 'completed'
}
```

#### DELETE - Remove Order
```typescript
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Removes order from MongoDB
  // Returns: { success: true }
}
```

**Database Collection**: `restaurant_pro.orders`
```typescript
{
  _id: ObjectId,
  orderNumber: number,
  customerName: string | null,
  tableNumber: number | null,
  items: Array<{
    quantity: number,
    itemName: string
  }>,
  subtotal: number,
  discount: number,
  tax: number,
  total: number,
  paymentMethod: string | null,
  status: 'pending' | 'preparing' | 'ready' | 'completed',
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 Kitchen Display API Route

**File**: [app/api/kitchen/orders/route.ts](app/api/kitchen/orders/route.ts)

#### GET - Fetch Kitchen Orders
```typescript
export async function GET() {
  // Filters: status !== 'completed'
  // Returns: { orders: [...] }
  // Limit: 1000 orders, sorted by createdAt ascending
  // Used by: Chef Dashboard to display pending/preparing orders
}
```

**PATCH Route**: [app/api/kitchen/orders/[id]/route.ts] (referenced in [app/dashboard/kitchen/page.tsx](app/dashboard/kitchen/page.tsx#L51-L56))
```typescript
// Updates order status in kitchen-specific endpoint
// Flow: pending → preparing → ready → completed
```

### 2.3 Billing API Routes

**File**: [app/api/billing/route.ts](app/api/billing/route.ts)

#### GET - Fetch All Bills
```typescript
export async function GET() {
  // Fetches from MongoDB 'bills' collection
  // Returns: { bills: [...] }
  // Sorted by createdAt descending
  // Data normalized: _id, createdAt, updatedAt converted to strings
}
```

#### POST - Create New Bill
```typescript
export async function POST(request: NextRequest) {
  // Accepts:
  // - tableNumber (optional)
  // - items (required): Array<{ foodItemId, name, price, quantity, total }>
  // - subtotal, tax, discount, total (required)
  // - taxRate, discountPercent (for tracking)
  // - paymentMode: 'cash' | 'card' | 'upi' | 'cheque'
  // - customerName, customerPhone (optional)

  // Business Logic:
  // 1. Generates billNumber sequentially: "BILL-00001", "BILL-00002", etc.
  // 2. Marks bill as 'paid' automatically on creation
  // 3. Stores all calculation details

  // Returns: { bill: {...normalized} }
}
```

**Database Collection**: `restaurant_pro.bills`
```typescript
{
  _id: ObjectId,
  billNumber: string,           // "BILL-00001"
  tableNumber: number | null,
  customerName: string | null,
  customerPhone: string | null,
  items: Array<{
    foodItemId: string,
    name: string,
    price: number,
    quantity: number,
    total: number
  }>,
  subtotal: number,
  tax: number,
  discount: number,
  total: number,
  taxRate: number,              // e.g. 0.1 for 10%
  discountPercent: number,      // e.g. 5 for 5%
  status: 'pending' | 'paid' | 'cancelled',
  paymentMode: string,          // 'cash', 'card', 'upi', 'cheque'
  paymentMethod: string,        // duplicate of paymentMode
  createdAt: Date,
  updatedAt: Date
}
```

### 2.4 Order Creation Flow - Frontend

**File**: [app/dashboard/billing/page.tsx](app/dashboard/billing/page.tsx)

```typescript
// Step 1: Add items to cart
addItemToCart(item: MenuItem) {
  // Adds or increments item quantity
  // Calculates item total: quantity × price
}

// Step 2: Calculate totals
subtotal = cartItems.reduce((sum, item) => sum + item.total, 0)
discount = subtotal * (discountPercent / 100)
taxableAmount = subtotal - discount
tax = taxableAmount * taxRate
total = taxableAmount + tax

// Step 3: Create bill via API
handleCreateBill() {
  fetch('/api/billing', {
    method: 'POST',
    body: JSON.stringify({
      tableNumber,
      items: cartItems,
      subtotal, tax, discount, total,
      taxRate, discountPercent,
      paymentMode,
      customerName, customerPhone
    })
  })
  // Bill created with auto-generated billNumber
  // Marked as 'paid' by default
}
```

### 2.5 Bill Printing System

**File**: [app/dashboard/tables/page.tsx](app/dashboard/tables/page.tsx#L485-L520)

```typescript
const printBill = (billData: {
  items: OrderItem[],
  subtotal: number,
  discount: number,
  tax: number,
  roundOff: number,
  total: number,
  paymentMode: string,
  tableNumber?: number | null,
  customerName?: string,
  customerPhone?: string
}) => {
  const billContent = `
========== RESTAURANT BILL ==========
Date: ${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN')}
${billData.tableNumber ? `Table: ${billData.tableNumber}` : `Type: Walk-in`}
${billData.customerName ? `Customer: ${billData.customerName}` : ''}
${billData.customerPhone ? `Phone: ${billData.customerPhone}` : ''}
======================================
${billData.items.map((item) => 
  `${item.name.substring(0, 25).padEnd(25)} x${item.qty} ₹${(item.price * item.qty).toFixed(2).padStart(7)}`
).join('\n')}
======================================
Subtotal...................... ₹${billData.subtotal.toFixed(2).padStart(7)}
${billData.discount > 0 ? `Discount..................... -₹${billData.discount.toFixed(2).padStart(7)}\n` : ''}
Tax (10%).................... ₹${billData.tax.toFixed(2).padStart(7)}
${billData.roundOff !== 0 ? `Round Off.................... ${billData.roundOff > 0 ? '+' : '-'}₹${Math.abs(billData.roundOff).toFixed(2).padStart(7)}\n` : ''}
======================================
TOTAL......................... ₹${billData.total.toFixed(2).padStart(7)}
======================================
Payment Mode: ${billData.paymentMode.toUpperCase()}
   **Thank You! Visit Again**
======================================
`
  
  // Open print window with monospace font formatting
  const printWindow = window.open('', '', 'height=700,width=420')
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Courier New', monospace; margin: 10px; }
          pre { font-size: 12px; line-height: 1.5; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <pre>${billContent}</pre>
      </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }
}
```

**Printing Features**:
- Opens new window with monospace font (Courier New)
- Formats as thermal printer receipt (80-character width)
- Displays: Date, Table number, Customer info, Items with quantities
- Shows: Subtotal, Discount, Tax, Round-off, Total
- Includes payment mode and thank-you message
- Print dimensions: 420px width for thermal printer compatibility

### 2.6 KOT (Kitchen Order Ticket) System

**File**: [app/dashboard/tables/page.tsx](app/dashboard/tables/page.tsx#L1190-L1230)

```typescript
interface KOTLog {
  kotNumber: number,
  tableNumber: string,
  items: OrderItem[],
  timestamp: Date
}

// KOT Print Content
const kotPrintContent = {
  kotNumber: 123,
  items: [
    { name: "Butter Chicken", qty: 2 },
    { name: "Naan", qty: 4 }
  ],
  timestamp: new Date(),
  tableNumber: "5"
}

// KOT Print HTML Template
const kotPrintHTML = `
┌─────────────────────────────────────┐
│         ORDER TICKET (KOT)          │
│            Kitchen Display          │
│─────────────────────────────────────│
│ KOT #: ${kotNumber}                  │
│ Table: ${tableNumber}                │
│ Time: ${timestamp.toLocaleTimeString()}    │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│ ITEMS:                              │
│ • Butter Chicken          x 2       │
│ • Naan                    x 4       │
├─────────────────────────────────────┤
│       PLEASE PREPARE                │
└─────────────────────────────────────┘
`
```

---

## 3. CHEF USER SYSTEM

### 3.1 User Role Definitions

**File**: [RBAC_IMPLEMENTATION.md](RBAC_IMPLEMENTATION.md#L1-L30)

#### Three-Tier Role Structure
```typescript
type UserRole = 'admin' | 'counter' | 'chef'

// Chef Role Capabilities
const chefPermissions = {
  dashboardAccess: ['kitchen', 'order-logs'],
  features: [
    'Kitchen Display (incoming orders)',
    'KOT Logs (order history)',
    'Real-time notifications for new orders'
  ],
  restrictions: [
    'NO Access: Billing',
    'NO Access: POS',
    'NO Access: Analytics',
    'NO Access: User Management',
    'NO Access: Menu Items (view-only elsewhere)'
  ]
}
```

### 3.2 Chef User Creation

**File**: [app/api/users/route.ts](app/api/users/route.ts#L40-L60)

#### POST - Create New User
```typescript
export async function POST(request: NextRequest) {
  const { name, email, password, role } = await request.json()
  
  // Validation
  if (!['admin', 'counter', 'chef'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Authorization - only admins can create users
  const admin = await users.findOne({ 
    _id: new ObjectId(adminId), 
    role: 'admin' 
  })
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Create user with bcrypt-hashed password
  const hashedPassword = await bcrypt.hash(password, 10)
  const result = await users.insertOne({
    name,
    email,
    password: hashedPassword,
    role,  // 'chef'
    restaurantName: admin.restaurantName,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}
```

**Database Collection**: `restaurant_pro.users`
```typescript
{
  _id: ObjectId,
  name: string,            // e.g., "Chef Maria"
  email: string,           // e.g., "maria@restaurant.com"
  password: string,        // bcrypt hashed
  role: 'admin' | 'counter' | 'chef',
  restaurantName: string,  // Multi-tenancy support
  createdAt: Date,
  updatedAt: Date
}
```

### 3.3 Chef Login System

**File**: [app/api/auth/login/route.ts](app/api/auth/login/route.ts)

```typescript
export async function POST(req: NextRequest) {
  const { email, password, userId } = await req.json()

  let user: any

  // Two-step login:
  // Step 1: Email entry shows all users with that email
  if (!userId) {
    user = await users.findOne({ email })
  }
  
  // Step 2: Password verification for selected user
  if (userId) {
    user = await users.findOne({ _id: new ObjectId(userId) })
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }

  // Generate JWT token with role
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,  // 'chef'
      restaurantName: user.restaurantName
    },
    JWT_SECRET
  )

  // Set cookies: token, userId, userRole
  response.cookies.set('token', token, { httpOnly: true })
  response.cookies.set('userRole', user.role, { httpOnly: false })

  return response
}
```

### 3.4 Chef Role Access Control

**File**: [components/dashboard/sidenav.tsx](components/dashboard/sidenav.tsx#L37-L44)

```typescript
// Chef menu - ONLY kitchen display
const chefMenu = [
  { label: 'Kitchen Display', href: '/dashboard/kitchen', icon: '👨‍🍳', color: 'red' },
  { label: 'KOT Logs', href: '/dashboard/order-logs', icon: '🧾', color: 'teal' },
]

// Role-based menu rendering
const getMenuItems = () => {
  if (userRole === 'chef') return chefMenu    // Limited menu
  if (userRole === 'counter') return counterMenu
  return adminMenu
}
```

### 3.5 Chef Dashboard Home

**File**: [components/dashboard/home.tsx](components/dashboard/home.tsx#L68-L75)

```typescript
// Chef view - show only kitchen-related items
if (userRole === 'chef') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 sm:p-6 lg:p-8">
      {/* Chef-only dashboard: Kitchen Display + KOT Logs */}
      {/* NO Stats, NO Billing, NO Orders, NO Analytics */}
    </div>
  )
}
```

---

## 4. NOTIFICATION SYSTEM

### 4.1 Chef Notifications Component

**File**: [components/chef-notifications.tsx](components/chef-notifications.tsx)

#### Data Structure
```typescript
interface NotificationData {
  id: string,
  orderId: string,
  tableNumber: string,
  items: string[],           // e.g., ["2x Butter Chicken", "1x Naan"]
  timestamp: Date,
  read: boolean
}
```

#### Notification State Management
```typescript
const [notifications, setNotifications] = useState<NotificationData[]>([])
const [showNotificationPanel, setShowNotificationPanel] = useState(false)
const [unreadCount, setUnreadCount] = useState(0)
```

### 4.2 Polling Mechanism

**File**: [components/chef-notifications.tsx](components/chef-notifications.tsx#L23-L60)

```typescript
useEffect(() => {
  const fetchNewOrders = async () => {
    try {
      // Fetch new orders every 10 seconds
      const response = await fetch('/api/orders?status=new', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) return

      const data = await response.json()
      const orders = data.orders || []

      if (orders.length > 0) {
        const newNotifications = orders.map((order: any) => ({
          id: `notif-${Date.now()}-${order._id}`,
          orderId: order._id,
          tableNumber: order.tableNumber || 'Unknown',
          items: order.items?.map((item: any) => 
            `${item.quantity}x ${item.itemName}`
          ) || [],
          timestamp: new Date(order.createdAt),
          read: false,
        }))

        setNotifications((prev) => {
          // Deduplication by orderId
          const existingIds = new Set(prev.map((n) => n.orderId))
          const filtered = newNotifications.filter(
            (n: NotificationData) => !existingIds.has(n.orderId)
          )
          // Keep only last 10 notifications
          return [filtered[0], ...prev].filter((_, i) => i < 10)
        })
      }
    } catch (error) {
      console.error('Failed to fetch new orders:', error)
    }
  }

  const interval = setInterval(fetchNewOrders, 10000)  // Poll every 10 seconds
  fetchNewOrders()  // Initial fetch

  return () => clearInterval(interval)
}, [])
```

**Polling Configuration**:
- **Interval**: 10 seconds (configurable, can be reduced to 3-5 for real-time feel)
- **Endpoint**: `/api/orders?status=new`
- **Deduplication**: By order ID to prevent duplicate notifications
- **Storage**: Last 10 notifications kept in state
- **Cleanup**: Interval cleared on component unmount

### 4.3 Notification UI

**File**: [components/chef-notifications.tsx](components/chef-notifications.tsx#L81-L175)

```typescript
return (
  <div className="fixed bottom-6 right-6 z-50">
    {/* Notification Bell Button */}
    <button
      className="relative bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg transition"
      title="Notifications"
    >
      <Bell size={24} />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold 
                        rounded-full w-6 h-6 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>

    {/* Notification Panel */}
    {showNotificationPanel && (
      <div className="absolute bottom-20 right-0 w-96 max-h-96 bg-white border border-slate-200 
                      rounded-lg shadow-xl overflow-hidden flex flex-col">
        
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 
                        flex items-center justify-between">
          <h3 className="font-semibold text-lg">Kitchen Orders</h3>
          <button onClick={() => setShowNotificationPanel(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p>No new orders</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`border-b border-slate-200 p-4 cursor-pointer transition 
                  ${notif.read 
                    ? 'bg-slate-50' 
                    : 'bg-emerald-50 border-l-4 border-l-emerald-600'
                  } hover:bg-slate-100`}
                onClick={() => markAsRead(notif.id)}
              >
                {/* Notification Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Table {notif.tableNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {notif.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      dismissNotification(notif.id)
                    }}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Items List */}
                <div className="bg-white p-2 rounded border border-slate-200">
                  {notif.items.length > 0 ? (
                    <ul className="text-sm text-slate-700 space-y-1">
                      {notif.items.slice(0, 3).map((item, i) => (
                        <li key={i} className="truncate">
                          • {item}
                        </li>
                      ))}
                      {notif.items.length > 3 && (
                        <li className="text-slate-500 italic">
                          +{notif.items.length - 3} more
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">No items</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer - Unread Count */}
        {notifications.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600">
            {unreadCount} unread order{unreadCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    )}
  </div>
)
```

### 4.4 Notification Integration

**File**: [app/dashboard/kitchen/page.tsx](app/dashboard/kitchen/page.tsx#L1-L10)

```typescript
import { ChefNotifications } from '@/components/chef-notifications'

export default function KitchenPage() {
  // ... orders state and fetching

  return (
    <>
      {/* Kitchen Display Component */}
      {/* Orders table display */}
      
      {/* ChefNotifications rendered at bottom-right */}
      <ChefNotifications />
    </>
  )
}
```

### 4.5 Notification Colors & Styling

| Element | Colors | Classes |
|---------|--------|---------|
| Bell Icon | Emerald | `bg-emerald-600 hover:bg-emerald-700` |
| Unread Badge | Red | `bg-red-500` |
| Panel Header | Emerald Gradient | `from-emerald-600 to-emerald-700` |
| Unread Notification | Pale Green | `bg-emerald-50 border-l-4 border-l-emerald-600` |
| Read Notification | Pale Gray | `bg-slate-50` |

### 4.6 Future Notification Enhancements

From [FEATURE_ENHANCEMENTS.md](FEATURE_ENHANCEMENTS.md#L190-L197):
- Real-time WebSocket instead of 10-second polling
- Sound alerts for new orders
- Database persistence of "Done" status (currently localStorage)
- Chef customizable notification preferences
- Order preparation time analytics
- Auto-dismiss notifications

---

## 5. OFFLINE/SYNC FUNCTIONALITY

### 5.1 Current Status

**Finding**: No existing offline or sync functionality detected in the codebase.

**Evidence**:
- Search for `offline`, `sync`, `localStorage` cache patterns - minimal usage
- No Service Worker implementation
- No IndexedDB setup
- No progressive web app (PWA) manifest
- No conflict resolution system

### 5.2 LocalStorage Usage

**File**: [app/dashboard/tables/page.tsx] (Referenced in [FEATURE_ENHANCEMENTS.md](FEATURE_ENHANCEMENTS.md#L108-L111))

```typescript
// "Done" status for KOT logs stored in localStorage
const kotLogs = localStorage.getItem('kotLogs')

// Issue: Survives page refresh but lost on browser clear
// Future: Should move to MongoDB for persistence
```

### 5.3 Recommendations for Offline Support

```typescript
// Proposed Implementation:
1. Service Worker for caching API responses
2. IndexedDB for local data persistence:
   - Orders
   - Bills
   - Menu items
   - User data

3. Sync Queue:
   - Queue operations when offline
   - Batch sync when online

4. Conflict Resolution:
   - Local vs. server state reconciliation
   - Last-write-wins strategy

5. Offline Indicators:
   - UI badge showing connectivity status
   - Disable certain operations when offline
```

---

## 6. DASHBOARD COMPONENTS AND STYLING

### 6.1 Dashboard Layout Structure

**File**: [app/dashboard/page.tsx](app/dashboard/page.tsx)

```typescript
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardHeader user={user} />
      <SideNav isOpen={sideNavOpen} />
      <DashboardHome user={user} />
    </DashboardLayout>
  )
}
```

### 6.2 Header Component

**File**: [components/dashboard/header.tsx](components/dashboard/header.tsx)

```typescript
export default function DashboardHeader({ user, onMenuToggle }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 card-shadow">
      <div className="flex items-center justify-between gap-4">
        {/* Menu Toggle */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
          {/* Mobile menu icon */}
        </button>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>

        {/* User Profile Section */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
          
          {/* User Avatar - Green to Orange Gradient */}
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-orange-500 
                          rounded-full flex items-center justify-center text-white font-bold shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
```

**Styling Applied**:
- Gradient background: `from-white to-gray-50`
- Sticky positioning: `sticky top-0 z-20`
- Shadow: `card-shadow` (0 2px 8px rgba...)
- Responsive padding: `px-4 sm:px-6 lg:px-8`
- User avatar gradient: `from-green-500 to-orange-500`

### 6.3 Sidebar Navigation

**File**: [components/dashboard/sidenav.tsx](components/dashboard/sidenav.tsx)

```typescript
export default function SideNav({ isOpen, onToggle }: SideNavProps) {
  const [userRole, setUserRole] = useState<string | null>(null)

  // Role-based menu items
  const adminMenu = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊', color: 'blue' },
    { label: 'Billing', href: '/dashboard/billing', icon: '💵', color: 'emerald' },
    { label: 'POS', href: '/dashboard/pos', icon: '🛒', color: 'purple' },
    { label: 'Tables', href: '/dashboard/tables', icon: '🍽️', color: 'orange' },
    { label: 'Menu Items', href: '/dashboard/menu', icon: '📜', color: 'amber' },
    { label: 'Orders', href: '/dashboard/orders', icon: '📋', color: 'cyan' },
    { label: 'Kitchen Display', href: '/dashboard/kitchen', icon: '👨‍🍳', color: 'red' },
    { label: 'Inventory', href: '/dashboard/inventory', icon: '📦', color: 'pink' },
    { label: 'Staff', href: '/dashboard/staff', icon: '👥', color: 'indigo' },
    { label: 'Reservations', href: '/dashboard/reservations', icon: '📅', color: 'rose' },
    { label: 'KOT Logs', href: '/dashboard/order-logs', icon: '🧾', color: 'teal' },
    { label: 'Analytics', href: '/dashboard/analytics', icon: '📈', color: 'lime' },
    { label: 'User Management', href: '/dashboard/users', icon: '👤', color: 'indigo' },
    { label: 'Settings', href: '/dashboard/settings', icon: '⚙️', color: 'slate' },
  ]

  const counterMenu = [
    // Counter/POS staff - NO Kitchen Display
  ]

  const chefMenu = [
    // Chef - ONLY Kitchen Display
  ]
}
```

### 6.4 Home Dashboard Component

**File**: [components/dashboard/home.tsx](components/dashboard/home.tsx)

```typescript
export default function DashboardHome({ user }: { user: any }) {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    tableOccupancy: 0,
  })
  const [expenses, setExpenses] = useState<number>(0)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Admin dashboard shows statistics
  if (userRole === 'admin') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stats Cards */}
        {/* Charts and Analytics */}
      </div>
    )
  }

  // Chef dashboard redirects to kitchen display
  if (userRole === 'chef') {
    return <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Kitchen-specific view */}
    </div>
  }

  // Counter dashboard shows operations
  if (userRole === 'counter') {
    return <div>{/* Counter operations view */}</div>
  }
}
```

### 6.5 Dashboard Pages

| Page | File Path | Purpose | Styling |
|------|-----------|---------|---------|
| Billing | [app/dashboard/billing/page.tsx](app/dashboard/billing/page.tsx) | Create/manage bills | Dark theme with emerald accents |
| Orders | [app/dashboard/orders/page.tsx](app/dashboard/orders/page.tsx) | View/manage orders | Status badges (red/orange/green) |
| Kitchen | [app/dashboard/kitchen/page.tsx](app/dashboard/kitchen/page.tsx) | Chef display | Emerald theme with notifications |
| Tables | [app/dashboard/tables/page.tsx](app/dashboard/tables/page.tsx) | Table management & POS | Table cards with status colors |
| Bill Logs | [app/dashboard/bill-logs/page.tsx](app/dashboard/bill-logs/page.tsx) | Bill history | Dark slate theme |
| KOT Logs | [app/dashboard/order-logs/page.tsx](app/dashboard/order-logs/page.tsx) | Kitchen ticket history | Orange/teal theme |

### 6.6 Dashboard Styling System

**File**: [styles/globals.css](styles/globals.css)

```css
/* Card shadows */
.card-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
}

.card-shadow-hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06);
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background: #FF6F00;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #E65100;
}
```

### 6.7 Responsive Design

**File**: [components/dashboard/header.tsx](components/dashboard/header.tsx#L12-L14)

```typescript
// Mobile-first responsive design
<h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
// Mobile: text-xl
// Small and up: text-2xl

<div className="hidden sm:block text-right">
  {/* Hidden on mobile, shown on small screens and up */}
</div>

<button className="md:hidden p-2 rounded-lg">
  {/* Mobile menu toggle, hidden on medium screens and up */}
</button>
```

---

## 7. TECHNOLOGY STACK

### 7.1 Frontend
- **Next.js**: 16.0.3
- **React**: 19.2.0
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form

### 7.2 Backend
- **Runtime**: Node.js with Next.js API Routes
- **Authentication**: JWT with bcryptjs
- **Database**: MongoDB
- **ORM**: Native MongoDB driver

### 7.3 Deployment
- **Desktop**: Electron with Electron Builder (NSIS installer for Windows)
- **Dev Server**: `next dev` on port 3000

---

## 8. KEY ENDPOINTS SUMMARY

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/orders` | GET | Fetch all orders |
| `/api/orders` | POST | Create new order |
| `/api/orders/[id]` | PATCH | Update order status |
| `/api/orders/[id]` | DELETE | Delete order |
| `/api/kitchen/orders` | GET | Fetch kitchen display orders |
| `/api/kitchen/orders/[id]` | PATCH | Update kitchen order status |
| `/api/billing` | GET | Fetch all bills |
| `/api/billing` | POST | Create new bill |
| `/api/users` | GET | List users (admin only) |
| `/api/users` | POST | Create user (admin only) |
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/me` | GET | Get current user info |

---

## 9. SECURITY NOTES

1. **Authentication**: JWT-based, stored in httpOnly cookies for token
2. **Password**: Bcryptjs hashing with salt rounds = 10
3. **Authorization**: Role-based access control (RBAC) at route level
4. **Multi-tenancy**: Users segregated by `restaurantName`
5. **Admin-Only Operations**: Verified via JWT role claim

---

## 10. DATABASE COLLECTIONS

```typescript
restaurant_pro.users
restaurant_pro.orders
restaurant_pro.bills
restaurant_pro.menu
restaurant_pro.inventory
restaurant_pro.tables
restaurant_pro.staff
restaurant_pro.reservations
```

---

**Generated**: March 21, 2026  
**Status**: Current as of Next.js 16.0.3 build
