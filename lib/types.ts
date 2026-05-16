// ==================== SUBSCRIPTION TYPES ====================

export type SubscriptionType = 'MONTHLY' | 'YEARLY'

export type SubscriptionStatus = 'ACTIVE' | 'GRACE' | 'RESTRICTED'

export interface Subscription {
  _id?: string
  business_id: string
  user_name: string
  subscription_type: SubscriptionType
  subscription_start_date: Date
  subscription_expiry_date: Date
  grace_period_days: number
  status: SubscriptionStatus
  last_payment_date?: Date
  last_login_time?: Date
  is_unlocked_by_code: boolean
  temporary_unlock_expiry?: Date
  created_at: Date
  updated_at: Date
}

// ==================== USER / ROLE TYPES ====================

export type UserRole = 'admin' | 'chef' | 'cashier'

export interface User {
  _id?: string
  username: string
  email: string
  password: string
  name: string
  restaurantName: string
  restaurantUsername?: string  // unique slug derived from restaurant name
  restaurantId: string
  role: UserRole
  isAdmin: boolean
  isActive: boolean
  isFirstLogin?: boolean
  tablesCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface RoleAccount {
  _id?: string
  name: string
  email: string
  password: string
  role: 'chef' | 'cashier'
  restaurantId: string
  restaurantName: string
  isActive: boolean
  pushSubscription?: PushSubscription
  createdAt: Date
  updatedAt: Date
}

// ==================== TABLE TYPES ====================

export interface Table {
  _id?: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved' | 'on-hold'
  tableName: string
  userId: string
  restaurantId: string
  createdAt: Date
  updatedAt: Date
}

// ==================== MENU TYPES ====================

export interface MenuItem {
  _id?: string
  name: string
  price: number
  category: string
  description?: string
  available: boolean
  userId: string
  restaurantId: string
  createdAt: Date
  updatedAt: Date
}

// ==================== ORDER TYPES ====================

export interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  sentToKOT: boolean
  qty?: number
  _id?: string
  lastSentQty?: number
}

export interface Order {
  _id?: string
  id?: string
  userId: string
  tableId: string
  tableNumber?: number | null
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  roundOff: number
  total: number
  paymentMode: 'cash' | 'card' | 'upi' | 'split'
  cashAmount?: number
  onlineAmount?: number
  status: 'pending' | 'preparing' | 'ready' | 'completed'
  kotStatus?: 'pending' | 'preparing' | 'done' | 'cancelled'
  isDone?: boolean
  kotNumber?: number
  kotCount?: number
  restaurantId: string
  createdAt: Date
  updatedAt: Date
}

export interface KOTLog {
  id: string
  kotNumber: number
  tableNumber: number | null
  items: OrderItem[]
  timestamp: string
  kotCount: number
  isNew?: boolean
  kotStatus?: 'pending' | 'preparing' | 'done' | 'cancelled'
  isDone?: boolean
  restaurantId: string
  orderId?: string
}

// ==================== RESERVATION TYPES ====================

export interface Reservation {
  _id?: string
  userId: string
  restaurantId: string
  customerName: string
  customerPhone: string
  guestCount: number
  reservationTime: Date
  tableNumber?: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  checkInTime?: Date
  checkOutTime?: Date
  createdAt: Date
  updatedAt: Date
}

// ==================== STAFF / PAYROLL / EXPENSE TYPES ====================

export interface Staff {
  _id?: string
  restaurantId: string
  name: string
  role: string
  phone: string
  salary: number
  joiningDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Expense {
  _id?: string
  restaurantId: string
  category: string
  amount: number
  description: string
  date: Date
  paymentMode: string
  createdAt: Date
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface SubscriptionCheckResult {
  isValid: boolean
  status: SubscriptionStatus
  daysRemaining: number
  subscription: Subscription | null
  message?: string
}

// ==================== COMPONENT PROP TYPES ====================

export interface SubscriptionBannerProps {
  subscription: Subscription
  onRenewClick: () => void
}

export interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: Subscription | null
  onUnlock: (code: string) => Promise<void>
}

export interface RestrictedActionProps {
  action: string
  onSubscriptionRequired: () => void
  children: React.ReactNode
}

// ==================== AUTH TYPES ====================

export interface DecodedToken {
  userId: string
  email: string
  username: string
  role: UserRole
  restaurantName: string
  restaurantId: string
  restaurantUsername?: string
  isAdmin: boolean
  isRoleAccount?: boolean
  iat: number
  exp: number
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}