# Role-Based Access Control System - Implementation Summary

## Overview
Complete role-based authentication and authorization system with three user roles: Admin, Counter/POS Staff, and Chef.

## System Architecture

### Three User Roles

#### 1. **Admin** (Full Access)
- Dashboard with all statistics
- User Management (create, edit, delete staff)
- Billing & Bill Logs
- POS/Orders System
- Table Management
- Menu Items Management
- Kitchen Display (monitoring)
- KOT Logs
- Inventory Management
- Staff Management
- Reservations
- Analytics & Reporting
- Settings

#### 2. **Counter/POS Staff** (Operations)
- Limited Dashboard (operations focused)
- Billing & Payment Collection
- POS (Create Orders)
- Table Management
- Menu Items (View Only)
- Orders Management
- Inventory (View Only)
- Staff Directory (View Only)
- Reservations (View/Book)
- Analytics (View Only)
- Settings (View Only)
- **NO Access**: Kitchen Display, User Management, KOT Logs

#### 3. **Chef** (Kitchen Only)
- Kitchen Display (incoming orders)
- KOT Logs (order history)
- Real-time notifications for new orders
- **NO Access**: Billing, POS, Analytics, User Management, etc.

## API Endpoints

### User Management API

#### GET /api/users
- **Purpose**: List all users for a restaurant
- **Authentication**: Requires `x-admin-id` header (admin verification)
- **Returns**: Array of users with name, email, role, createdAt
- **Filters by**: restaurantName from admin's JWT

#### POST /api/users
- **Purpose**: Create new user
- **Authentication**: Requires `x-admin-id` header
- **Body**: { name, email, password, role: 'counter'|'chef' }
- **Validation**: Role must be one of ['counter', 'chef'], password hashed with bcryptjs
- **Returns**: New user object with _id

#### PATCH /api/users/[id]
- **Purpose**: Update user details
- **Authentication**: Requires `x-admin-id` header
- **Body**: { name?, email?, role?, password? } (all optional)
- **Security**: Admin must own the user's restaurant
- **Auto-hash**: Password automatically hashed if provided

#### DELETE /api/users/[id]
- **Purpose**: Remove user from system
- **Authentication**: Requires `x-admin-id` header
- **Security**: Admin must own the user's restaurant
- **Returns**: Success message

### Authentication APIs

#### POST /api/auth/users
- **Purpose**: Email-based user lookup for login
- **Body**: { email }
- **Returns**: Array of users (name, email, role) without passwords
- **Used by**: Login page to show available users per email

#### POST /api/auth/login
- **Purpose**: Authenticate user and set session
- **Supports**: Both email/password AND userId/password flows
- **Returns**: JWT token + user info
- **Sets Cookies**:
  - `token`: JWT token (httpOnly)
  - `userId`: User ID (httpOnly)
  - `userRole`: User role (accessible from JavaScript for UI)

#### POST /api/auth/logout
- **Purpose**: Clear session
- **Clears**: All auth cookies

## Database Schema

### Users Collection
```typescript
{
  _id: ObjectId
  name: string
  email: string
  password: string (bcrypt hashed)
  role: 'admin' | 'counter' | 'chef'
  restaurantName: string
  createdBy: ObjectId (admin's ID)
  createdAt: Date
}
```

## Frontend Components

### Login Page (`app/login/page.tsx`)
**Three-Step Flow:**

1. **Step 1 (Email)**
   - User enters email
   - API call to `/api/auth/users` finds matching users
   - If 1 user → skip to password
   - If multiple users → show selection

2. **Step 2 (User Selection)**
   - Display list of users with their roles
   - User selects which account to login as
   - Shows role badge (Admin/Counter/Chef)

3. **Step 3 (Password)**
   - User enters password
   - Calls `/api/auth/login` with userId + password
   - On success: redirects to dashboard

**Features:**
- Dark theme (slate-900 base)
- Back buttons for navigation
- Loading states
- Error handling
- Shows user roles during selection

### Sidebar Navigation (`components/dashboard/sidenav.tsx`)
**Dynamic Menu Based on Role:**

```typescript
// Reads userRole from cookie
const getMenuItems = () => {
  if (userRole === 'chef') return chefMenu       // 2 items
  if (userRole === 'counter') return counterMenu // 11 items
  return adminMenu                               // 14 items
}
```

**Menu Items by Role:**
- **Admin Menu (14 items)**: All features including User Management
- **Counter Menu (11 items)**: POS, Billing, Tables, Menu, Orders, Inventory, Staff, Reservations, Analytics, Settings (NO Kitchen)
- **Chef Menu (2 items)**: Kitchen Display, KOT Logs

### Dashboard Home (`components/dashboard/home.tsx`)
**Role-Specific Dashboards:**

**Chef View:**
- Kitchen Display quick access
- KOT Logs quick access
- Role badge notification
- Kitchen-focused layout

**Counter View:**
- Billing quick access
- POS/Create Order quick access
- Table Management quick access
- Role badge notification
- Operations-focused layout

**Admin View:**
- Full stats cards (Orders, Revenue, Active Orders, Table Occupancy, Expenses)
- Quick actions (New Order, Manage Tables, Reservations)
- Recent orders table
- All data access

### User Management Page (`app/dashboard/users/page.tsx`)
**Admin-Only Interface:**
- List all users for restaurant
- Create new user form
- Edit user details
- Delete user
- Role color coding (Admin=Red, Counter=Blue, Chef=Orange)
- Form validation
- Error/success messaging
- Loading states

## Authentication Flow

### Initial Setup (First Admin Login)
1. Admin enters email → finds no users → shows signup form
2. Signup creates first admin user
3. Admin logs in with email/password

### Creating Staff Users
1. Admin goes to User Management page
2. Clicks "Add User"
3. Fills form: Name, Email, Password, Role (Counter/Chef)
4. System creates user in database
5. User can login with email (sees admin-assigned password)

### Staff Login
1. User enters email
2. API finds user(s) with that email
3. If multiple emails → select user from list (shows role)
4. Enter password
5. System authenticates and sets cookies
6. Sidebar and dashboard dynamically show role-appropriate menu

## Security Measures

### Password Security
- All passwords hashed with bcryptjs (10 salt rounds)
- Passwords never returned in API responses
- Password validation in login endpoint

### Session Management
- JWT tokens with 24-hour expiration
- HttpOnly cookies prevent XSS attacks
- Role stored in accessible cookie for UI purposes
- Logout clears all session cookies

### Access Control
- Admin ID required in headers for user management endpoints
- User verification ensures admin owns the user
- Restaurant name filtering prevents cross-restaurant access
- Role validation in menu generation and API requests

### Error Handling
- Consistent error messages
- 401 for unauthorized access
- 404 for not found
- 400 for invalid input

## Implementation Status

✅ **Completed:**
- API endpoints for user management (GET, POST, PATCH, DELETE)
- Email-based user lookup API
- Login API with userId support
- Login page with 3-step flow
- Sidenav with dynamic role-based menus
- Dashboard with role-specific views
- User management admin page
- Password hashing with bcryptjs
- JWT authentication
- Cookie-based session management

⏳ **In Progress:**
- Testing the complete flow
- Notifications system for chef role

❌ **Future Enhancements:**
- Real-time notifications using WebSocket for chef
- Logout all sessions for admin
- Password reset flow
- Two-factor authentication
- Role-based API endpoint protection
- Activity logging for admin

## Testing Checklist

- [ ] Admin can create new counter/chef users
- [ ] Counter user sees only relevant menu items
- [ ] Chef user sees only kitchen items
- [ ] Login with email shows correct user list
- [ ] Password authentication works
- [ ] Logout clears cookies
- [ ] Sidebar updates based on role from cookie
- [ ] Dashboard shows role-specific content
- [ ] User management page allows edit/delete
- [ ] Unauthorized access prevented for kitchen display (counter)
- [ ] Unauthorized access prevented for billing (chef)

## Files Modified/Created

### New Files Created
- `/app/dashboard/users/page.tsx` - User management interface
- `/app/api/users/route.ts` - User CRUD API
- `/app/api/users/[id]/route.ts` - Individual user update/delete
- `/app/api/auth/users/route.ts` - Email lookup for login
- `/lib/auth.ts` - Auth utilities and session helpers

### Modified Files
- `/app/login/page.tsx` - Redesigned with 3-step flow
- `/app/api/auth/login/route.ts` - Added userId support, role in JWT
- `/components/dashboard/sidenav.tsx` - Dynamic menus by role
- `/components/dashboard/home.tsx` - Role-specific dashboard views

## Quick Start

### Create First Admin User
1. Start the app
2. Go to /login
3. Enter email (won't find user)
4. System shows signup form (create first admin)
5. Login and go to User Management

### Create Counter User
1. Login as admin
2. Go to Dashboard → User Management
3. Click "Add User"
4. Fill form with role = "Counter/POS User"
5. Share credentials with counter staff
6. Counter staff logs in with email

### Create Chef User
1. Same as counter, but role = "Chef (Kitchen Only)"
2. Chef logs in and sees only Kitchen Display and KOT Logs

## Environment Variables Needed
```
JWT_SECRET=your-secret-key-here
MONGODB_URI=your-mongodb-connection-string
```
