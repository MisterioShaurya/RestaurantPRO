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

// ==================== USER TYPES ====================

export interface User {
  _id?: string
  username: string
  email: string
  password: string
  name: string
  restaurantName: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ==================== TABLE TYPES ====================

export interface Table {
  _id?: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  tableName: string
  userId: string
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
}

export interface Order {
  _id?: string
  userId: string
  tableId: string
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
  createdAt: Date
  updatedAt: Date
}

// ==================== RESERVATION TYPES ====================

export interface Reservation {
  _id?: string
  userId: string
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