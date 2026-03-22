# Restaurant Management System - RBAC Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     RESTAURANT MANAGEMENT SYSTEM                  │
│                    (Role-Based Access Control)                    │
└─────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │  User Login  │
                              │  /login      │
                              └──────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
         Step 1: Email        Step 2: Select User  Step 3: Password
         /api/auth/users     (If Multiple Users)  /api/auth/login
                    │                │                │
                    └────────────────┼────────────────┘
                                     │
                    ┌────────────────▼──────────────┐
                    │  JWT Token + Role Cookie     │
                    │  - token (httpOnly)          │
                    │  - userId (httpOnly)         │
                    │  - userRole (accessible)     │
                    └────────────────┬──────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
    ┌─────────────┐         ┌──────────────┐         ┌──────────────┐
    │    ADMIN    │         │   COUNTER    │         │    CHEF      │
    │ (All Access)│         │  (POS Focus) │         │ (Kitchen)    │
    └──────┬──────┘         └───────┬──────┘         └────────┬─────┘
           │                        │                        │
           │ Role: 'admin'          │ Role: 'counter'        │ Role: 'chef'
           │                        │                        │
           ▼                        ▼                        ▼
    ┌─────────────────┐    ┌──────────────────┐    ┌──────────────┐
    │ 14 Menu Items   │    │  11 Menu Items   │    │ 2 Menu Items │
    ├─────────────────┤    ├──────────────────┤    ├──────────────┤
    │ Dashboard       │    │ Dashboard        │    │ Kitchen      │
    │ Billing         │    │ Billing          │    │ KOT Logs     │
    │ POS             │    │ POS              │    │              │
    │ Tables          │    │ Tables           │    │              │
    │ Menu Items      │    │ Menu Items       │    │              │
    │ Orders          │    │ Orders           │    │              │
    │ Kitchen Display │    │ Inventory        │    │              │
    │ Inventory       │    │ Staff            │    │              │
    │ Staff           │    │ Reservations     │    │              │
    │ Reservations    │    │ Analytics        │    │              │
    │ KOT Logs        │    │ Settings         │    │              │
    │ Analytics       │    │                  │    │              │
    │ User Mgmt ▶     │    │ ✗ Kitchen Display│    │              │
    │ Settings        │    │ ✗ User Mgmt      │    │ ✗ All others │
    └────────┬────────┘    └────────┬─────────┘    └──────────────┘
             │                      │
             │ Can Create & Manage  │ Cannot Manage
             │ Counter & Chef Users │ (View-only access)
             │                      │
             └──────────────────────┘
```

## Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     LOGIN PROCESS                             │
└─────────────────────────────────────────────────────────────┘

1. USER ENTERS EMAIL
   ├─ Call POST /api/auth/users { email }
   ├─ Check if user exists in database
   └─ If found: Show password or user selection

2. USER SELECTS PASSWORD
   ├─ Call POST /api/auth/login { userId, password }
   ├─ Verify password with bcryptjs
   └─ Generate JWT token with role & restaurant

3. SESSION CREATED
   ├─ Store token in httpOnly cookie (secure)
   ├─ Store userId in httpOnly cookie (secure)
   ├─ Store userRole in regular cookie (for UI)
   └─ Redirect to /dashboard

4. DASHBOARD LOADED
   ├─ Read userRole from cookie
   ├─ Load role-specific menu
   ├─ Load role-specific dashboard
   └─ All API calls include JWT in Authorization header


┌─────────────────────────────────────────────────────────────┐
│                     API REQUEST FLOW                          │
└─────────────────────────────────────────────────────────────┘

Frontend Request
    │
    ├─ Attach JWT token from cookie
    │  Authorization: Bearer <token>
    │
    └─► Backend API
        │
        ├─ Verify JWT signature
        ├─ Check token expiration
        ├─ Extract user role from JWT
        │
        ├─ Check if user allowed to access this resource
        │  ├─ Admin? ✓ Full access
        │  ├─ Counter? ✓ Operational features
        │  └─ Chef? ✓ Kitchen only
        │
        └─► Return response or 401/403 error
```

## Database Schema

```
┌──────────────────────────────────┐
│          USERS COLLECTION         │
├──────────────────────────────────┤
│ Field            │ Type           │
├──────────────────┼────────────────┤
│ _id              │ ObjectId       │
│ name             │ String         │
│ email            │ String         │ ← Unique Index
│ password         │ String (hash)  │
│ role             │ String         │ (admin|counter|chef)
│ restaurantName   │ String         │ ← Index for filtering
│ createdBy        │ ObjectId       │ (admin's ID)
│ createdAt        │ Date           │
└──────────────────┴────────────────┘

Indexes:
  - email (unique): Ensures no duplicate emails
  - restaurantName: Speeds up restaurant filtering
  - role: Used for queries by role
```

## API Endpoint Security

```
┌─────────────────────────────────────────────────────┐
│            API ENDPOINT PROTECTION                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│ POST /api/users (Create User)                       │
│ ├─ Requires: x-admin-id header                      │
│ ├─ Check: Admin exists & matches restaurant        │
│ ├─ Validate: role in ['admin','counter','chef']    │
│ └─ Hash: password with bcryptjs before saving      │
│                                                      │
│ PATCH /api/users/[id] (Update User)                 │
│ ├─ Requires: x-admin-id header                      │
│ ├─ Check: Admin owns this user's restaurant        │
│ ├─ Validate: All fields (if provided)              │
│ └─ Hash: password if provided                       │
│                                                      │
│ DELETE /api/users/[id] (Delete User)                │
│ ├─ Requires: x-admin-id header                      │
│ ├─ Check: Admin owns this user's restaurant        │
│ └─ Verify: Cannot delete self                       │
│                                                      │
│ GET /api/users (List Users)                         │
│ ├─ Requires: x-admin-id header                      │
│ ├─ Check: Admin exists                              │
│ ├─ Filter: Only users in same restaurant            │
│ └─ Never: Return passwords                          │
│                                                      │
│ POST /api/auth/users (Email Lookup)                 │
│ ├─ No auth required (for login flow)               │
│ ├─ Input: email                                     │
│ ├─ Return: User list without passwords              │
│ └─ Prevents: User enumeration (partial)             │
│                                                      │
│ POST /api/auth/login (Authenticate)                 │
│ ├─ Input: email+password OR userId+password        │
│ ├─ Verify: Password matches hash with bcryptjs    │
│ ├─ Create: JWT with role & restaurantName          │
│ └─ Set: Three cookies (token, userId, userRole)   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Role-Based Menu Structure

```
                         SIDEBAR NAVIGATION
                              │
                 ┌────────────┼────────────┐
                 │            │            │
              ADMIN        COUNTER       CHEF
           (14 items)    (11 items)   (2 items)
                 │            │            │
    ┌────────────┴┬───────┐   │            │
    │ Dashboard   │ ...   │   │            │
    │ Billing ✓   │ Settings│ │            │
    │ POS ✓       │       │   │            │
    │ Tables ✓    │ User   │   │            │
    │ Menu ✓      │ Mgmt ✓ │   │            │
    │ Orders ✓    │       │   │            │
    │ Kitchen ✓   │       │   │            │
    │ Inventory ✓ │       │   │            │
    │ Staff ✓     │       │   │            │
    │ Reserv. ✓   │       │   │            │
    │ KOT Logs ✓  │       │   │            │
    │ Analytics ✓ │       │   │            │
    │ Settings ✓  │       │   │            │
    │ User Mgmt ✓ │       │   │            │
    └────────────┴───────┘   │            │
                              │            │
    ┌─────────────────────┐   │            │
    │ Dashboard ✓         │   │            │
    │ Billing ✓           │   │            │
    │ POS ✓               │   │            │
    │ Tables ✓            │   │            │
    │ Menu ✓              │   │            │
    │ Orders ✓            │   │            │
    │ Inventory ✓         │   │            │
    │ Staff ✓             │   │            │
    │ Reservations ✓      │   │            │
    │ Analytics ✓         │   │            │
    │ Settings ✓          │   │            │
    │ Kitchen ✗           │   │            │
    │ KOT Logs ✗          │   │            │
    │ User Mgmt ✗         │   │            │
    └─────────────────────┘   │            │
                              │            │
                ┌─────────────┴┐           │
                │ Dashboard ✓  │           │
                │ Billing ✗    │           │
                │ POS ✗        │           │
                │ ... others ✗ │           │
                │ Kitchen ✓    │           │
                │ KOT Logs ✓   │           │
                └──────────────┘           │
                                           │
                   ┌──────────────────────┴┐
                   │ Kitchen Display ✓     │
                   │ KOT Logs ✓            │
                   │ Everything else ✗     │
                   └───────────────────────┘
```

## Authentication Token Structure

```
JWT Token Payload (Base64 Decoded)
┌──────────────────────────────────┐
│ {                                │
│   "userId": "ObjectId(...)",     │
│   "email": "admin@rest.com",     │
│   "role": "admin",               │
│   "restaurantName": "My Rest",   │
│   "iat": 1704067200,             │
│   "exp": 1704153600              │
│ }                                │
└──────────────────────────────────┘
   ▲
   │
   └─ Signed with JWT_SECRET
      (Server can verify authenticity)

Cookies Set After Login
┌──────────────────────────────────────┐
│ Name: token                          │
│ Value: <JWT Token>                   │
│ HttpOnly: Yes  (JavaScript can't access)
│ Expires: 24 hours                    │
├──────────────────────────────────────┤
│ Name: userId                         │
│ Value: <user._id>                    │
│ HttpOnly: Yes  (JavaScript can't access)
│ Expires: 24 hours                    │
├──────────────────────────────────────┤
│ Name: userRole                       │
│ Value: "admin"|"counter"|"chef"      │
│ HttpOnly: No  (JavaScript can access)
│ Expires: 24 hours                    │
└──────────────────────────────────────┘
   ▲
   └─ Frontend reads userRole to show/hide UI
```

## Component Data Flow

```
┌──────────────────────────────────┐
│      Login Page (/login)         │
│  3-Step Authentication Flow      │
└───────────────┬──────────────────┘
                │
                ├─ Step 1: Email Input
                │  ├─ POST /api/auth/users
                │  └─ Receive: User list
                │
                ├─ Step 2: User Selection (if multiple)
                │  ├─ Show users with roles
                │  └─ User selects account
                │
                └─ Step 3: Password
                   ├─ POST /api/auth/login
                   ├─ Receive: JWT + User info
                   └─ Redirect: /dashboard
                      │
                      ▼
            ┌─────────────────────┐
            │  Dashboard Home     │
            │  /dashboard         │
            └────────┬────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │ Admin  │ │Counter │ │ Chef   │
    │View    │ │View    │ │View    │
    └────┬───┘ └────┬───┘ └────┬───┘
         │          │          │
         │ Role:    │ Role:    │ Role:
         │ 'admin'  │'counter' │'chef'
         │          │          │
         └──────────┼──────────┘
                    │
                    ▼
         ┌────────────────────┐
         │  SideNav Component │
         │ (role-based menu)  │
         └─────────┬──────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    API Calls           Link Navigation
    (with JWT)          (Protected)
    │                   │
    └───────────────────┘
         │
         ▼
    Protected Routes
    (verified on page load)
```

## Data Access Pyramid

```
                    ┌─────────────────┐
                    │      ADMIN      │
                    │   (All Access)  │
                    ├─────────────────┤
                    │ • User Management
                    │ • All Features
                    │ • System Config
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
            ┌───────────────┐  ┌───────────────┐
            │   COUNTER     │  │     CHEF      │
            │  (Operations) │  │  (Kitchen)    │
            ├───────────────┤  ├───────────────┤
            │ • Billing     │  │ • Kitchen Ops │
            │ • POS         │  │ • Orders View │
            │ • Tables      │  │ • No Business │
            │ • Orders      │  │   Logic       │
            │ • Inventory   │  │ • No Admin    │
            │ • Analytics   │  │   Functions   │
            └───────────────┘  └───────────────┘
                    │                 │
                    └────────┬────────┘
                             │
                        ┌────▼───┐
                        │Database │
                        │  users  │
                        │collection
                        └────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│            SECURITY IMPLEMENTATION LAYERS             │
├─────────────────────────────────────────────────────┤
│                                                      │
│ LAYER 1: PASSWORD SECURITY                          │
│ ├─ bcryptjs hashing (10 salt rounds)               │
│ ├─ Never store plaintext passwords                  │
│ ├─ Never return passwords in API responses          │
│ └─ Passwords compared with bcryptjs.compare()      │
│                                                      │
│ LAYER 2: SESSION MANAGEMENT                         │
│ ├─ JWT tokens with 24-hour expiration               │
│ ├─ HttpOnly cookies prevent XSS attacks             │
│ ├─ Role stored in accessible cookie for UI         │
│ └─ Logout clears all session cookies                │
│                                                      │
│ LAYER 3: API AUTHENTICATION                         │
│ ├─ Every request includes JWT token                 │
│ ├─ Server verifies JWT signature                    │
│ ├─ Check token hasn't expired                       │
│ └─ Extract user ID & role from verified token      │
│                                                      │
│ LAYER 4: AUTHORIZATION                              │
│ ├─ Check user role has permission                   │
│ ├─ Admin-only endpoints require x-admin-id         │
│ ├─ Filter data by restaurantName                    │
│ └─ Prevent cross-user/cross-restaurant access      │
│                                                      │
│ LAYER 5: INPUT VALIDATION                           │
│ ├─ Validate email format                            │
│ ├─ Validate role in ['admin','counter','chef']     │
│ ├─ Sanitize all input strings                       │
│ └─ Check required fields present                    │
│                                                      │
│ LAYER 6: RATE LIMITING (Future)                     │
│ ├─ Limit login attempts                             │
│ ├─ Prevent brute force attacks                      │
│ └─ IP-based throttling                              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Quick Reference

| Aspect | Admin | Counter | Chef |
|--------|-------|---------|------|
| **Menu Items** | 14 | 11 | 2 |
| **Can Create Users** | ✓ | ✗ | ✗ |
| **Can View Billing** | ✓ | ✓ | ✗ |
| **Can View Kitchen** | ✓ | ✗ | ✓ |
| **Can Manage Tables** | ✓ | ✓ | ✗ |
| **Can View Analytics** | ✓ | ✓ | ✗ |
| **Default Dashboard** | Full Stats | Operations | Kitchen |

---

**Last Updated:** 2024
**Version:** 1.0
