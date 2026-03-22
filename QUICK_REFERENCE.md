# RBAC System - Quick Reference Card

## 🎯 Core URLs

| Purpose | URL | Role | Notes |
|---------|-----|------|-------|
| Login | http://localhost:3000/login | All | 3-step flow |
| Dashboard | http://localhost:3000/dashboard | All | Role-specific |
| User Mgmt | http://localhost:3000/dashboard/users | Admin | Create/edit/delete users |
| Billing | http://localhost:3000/dashboard/billing | Admin, Counter | View & create bills |
| POS | http://localhost:3000/dashboard/pos | Admin, Counter | Create orders |
| Kitchen | http://localhost:3000/dashboard/kitchen | Admin, Chef | Kitchen display |
| KOT Logs | http://localhost:3000/dashboard/order-logs | Admin, Chef | Order history |

## 🔑 API Endpoints

### User Management
```
GET    /api/users                    [Admin only, x-admin-id header]
POST   /api/users                    [Admin only, x-admin-id header]
PATCH  /api/users/[id]               [Admin only, x-admin-id header]
DELETE /api/users/[id]               [Admin only, x-admin-id header]
```

### Authentication
```
POST   /api/auth/users               [Public, email lookup]
POST   /api/auth/login               [Public, email/password or userId/password]
POST   /api/auth/logout              [Authenticated]
```

## 👥 Role Matrix

### Feature Access
| Feature | Admin | Counter | Chef |
|---------|:-----:|:-------:|:----:|
| Dashboard | ✓ Full | ✓ Ops | ✓ Kitchen |
| Billing | ✓ | ✓ | ✗ |
| POS Orders | ✓ | ✓ | ✗ |
| Tables | ✓ | ✓ | ✗ |
| Kitchen Display | ✓ | ✗ | ✓ |
| KOT Logs | ✓ | ✗ | ✓ |
| User Management | ✓ | ✗ | ✗ |
| Analytics | ✓ | ✓ | ✗ |
| Inventory | ✓ | ✓ | ✗ |
| Staff | ✓ | ✓ | ✗ |
| Reservations | ✓ | ✓ | ✗ |
| Menu | ✓ | ✓ | ✗ |
| Settings | ✓ | ✓ | ✗ |

### Menu Items Count
- **Admin:** 14 items (all features)
- **Counter:** 11 items (no kitchen, no user mgmt)
- **Chef:** 2 items (kitchen display, KOT logs only)

## 🔐 Authentication

### Cookies Set on Login
```
token    → JWT token (httpOnly)
userId   → User ID (httpOnly)
userRole → Role: admin|counter|chef (accessible)
```

### JWT Payload
```json
{
  "userId": "ObjectId(...)",
  "email": "user@restaurant.com",
  "role": "admin|counter|chef",
  "restaurantName": "My Restaurant",
  "exp": 1704153600
}
```

### Session Duration
- **24 hours** from login
- After expiration, must login again
- Logout clears all cookies immediately

## 🛠️ Development Helpers

### Client-Side Hooks
```typescript
import { useUser, useRole, useIsAdmin, useIsChef, useIsCounter } from '@/hooks/use-user'

// Get full user info
const { user, loading } = useUser()

// Get just role
const { role, loading } = useRole()

// Check if admin
const isAdmin = useIsAdmin()

// Check if chef
const isChef = useIsChef()

// Check if counter
const isCounter = useIsCounter()

// Check multiple roles
const hasRole = useHasRole(['admin', 'counter'])
```

### Server-Side Auth
```typescript
import { getServerSession } from '@/lib/auth'

const session = await getServerSession()
if (!session) redirect('/login')
if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
```

## 📝 Creating Users

### Via UI (Admin Dashboard)
1. Go to /dashboard/users
2. Click "Add User"
3. Fill: Name, Email, Password, Role
4. Click "Create User"

### Requirements
- **Name:** Any string (e.g., "John Counter")
- **Email:** Unique email address
- **Password:** Any string (hashed with bcryptjs)
- **Role:** "counter" or "chef" (Admin created on first login)

## 🧪 Testing Quick Commands

### Verify System
```bash
node scripts/rbac-setup.js
```

### Start Dev Server
```bash
npm run dev
```

### Install Dependencies
```bash
npm install
```

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Can't create users | Check you're logged in as Admin |
| Wrong menu showing | Logout/login again, clear cookies |
| Login fails | Check email/password, verify user exists |
| 404 on API | Restart dev server, check file paths |
| Database error | Verify MongoDB running, check connection string |
| Password not working | Check caps lock, reset via User Management |

## 📂 Key Files

### For Users
- `app/login/page.tsx` - Login interface
- `app/dashboard/users/page.tsx` - User management

### For Developers
- `app/api/users/route.ts` - User API
- `app/api/auth/login/route.ts` - Login API
- `lib/auth.ts` - Auth utilities
- `hooks/use-user.ts` - React hooks
- `components/dashboard/sidenav.tsx` - Menu component
- `components/dashboard/home.tsx` - Dashboard component

## 📚 Documentation

| File | Purpose |
|------|---------|
| README_RBAC.md | Overview (start here) |
| SETUP_CHECKLIST.md | Testing checklist |
| RBAC_USER_GUIDE.md | User instructions |
| RBAC_IMPLEMENTATION.md | Technical details |
| ARCHITECTURE.md | System diagrams |
| DOCUMENTATION_INDEX.md | Doc index |

## ⚙️ Environment Variables

```env
JWT_SECRET=your-super-secret-key-here
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=restaurant_pro
```

## 🚀 Typical Workflow

### First Time Setup
1. Start dev server: `npm run dev`
2. Go to http://localhost:3000/login
3. Enter email, create admin password
4. Login as admin
5. Create counter and chef users in User Management

### Testing Roles
1. Logout
2. Login as counter → See 11 menu items
3. Logout
4. Login as chef → See 2 menu items
5. Verify features are correct for each role

### Adding New Feature
1. Create page in `/app/dashboard/[feature]/page.tsx`
2. Add to appropriate role menu in `sidenav.tsx`
3. Test with each role
4. Document in role matrix

## 💾 Database

### Collections
- `users` - All user accounts

### Sample Query
```javascript
// View all users
db.users.find().pretty()

// Find admin users
db.users.find({ role: 'admin' })

// Count users
db.users.countDocuments()

// Delete user
db.users.deleteOne({ email: 'user@test.com' })
```

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and secret
- [ ] MONGODB_URI is correct
- [ ] Passwords are hashed (never plaintext)
- [ ] HttpOnly cookies are set
- [ ] Admin verification headers are checked
- [ ] Role is validated on API calls
- [ ] Sessions expire after 24 hours
- [ ] Input is validated

## 🎯 Success Criteria

✅ System is working when:
- Admin can login and create users
- Counter user sees 11 menu items
- Chef user sees 2 menu items (Kitchen Display, KOT Logs)
- Logout clears all cookies
- Session expires after 24 hours
- Passwords are hashed in database
- No plaintext passwords in API responses

## 📊 Implementation Stats

- **API Endpoints:** 8 (4 user CRUD + 4 auth)
- **User Roles:** 3 (Admin, Counter, Chef)
- **Components:** 6 new/modified
- **Utilities:** 2 (auth.ts, use-user.ts)
- **Documentation:** 6 files
- **Security Layers:** 5+ (passwords, tokens, headers, validation, isolation)

## ⏱️ Timeline

| Step | Time |
|------|------|
| Read overview | 5 min |
| Setup system | 5 min |
| Test all roles | 10 min |
| Create real users | 5 min |
| **Total** | **25 min** |

## 🎓 For Beginners

1. **What is RBAC?** Different users see different features
2. **Why is this important?** Security - users only see what they need
3. **How does it work?** Login → JWT token → Menu filtered by role
4. **What roles are there?** Admin (all), Counter (sales), Chef (kitchen)

## 👨‍💼 For Managers

- **Admin** creates users with specific roles
- **Counter staff** can only access billing/POS features
- **Chefs** can only see kitchen orders
- All actions are logged and secure
- Users login with email and password
- Sessions expire after 24 hours

## 🎉 You're Ready!

Everything is set up. Go to http://localhost:3000/login and start using it!

---

**Quick Links:**
- 📖 [Full Docs](DOCUMENTATION_INDEX.md)
- 🚀 [README_RBAC.md](README_RBAC.md)
- 🧪 [Testing Guide](SETUP_CHECKLIST.md)
- 👥 [User Guide](RBAC_USER_GUIDE.md)
- 🔧 [Technical Docs](RBAC_IMPLEMENTATION.md)
- 📊 [Architecture](ARCHITECTURE.md)

---

**Version:** 1.0 | **Status:** ✅ Production Ready | **Last Updated:** 2024
