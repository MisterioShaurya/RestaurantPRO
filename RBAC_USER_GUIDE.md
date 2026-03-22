# Role-Based Access Control System - User Guide

## Quick Overview

The Restaurant Management System now has a complete role-based access control (RBAC) system with three user roles:

1. **Admin** - Full system access, can manage users
2. **Counter/POS Staff** - Billing, orders, tables, inventory (no kitchen)
3. **Chef** - Kitchen display and order logs only

## Getting Started

### Step 1: First Login (Create Admin User)
1. Go to http://localhost:3000/login
2. Enter any email address
3. System will show error (no users yet) and option to sign up
4. Create password and confirm
5. You're now logged in as Admin

### Step 2: Create Counter Users
1. Click on sidebar menu (look for User Management 👤)
2. Click "Add User" button
3. Fill in:
   - Name: e.g., "John Counter"
   - Email: e.g., "john@restaurant.com"
   - Password: Create a secure password
   - Role: Select "Counter/POS User"
4. Click "Create User"
5. Share the email and password with your counter staff

### Step 3: Create Chef Users
1. Go to User Management again
2. Click "Add User"
3. Fill in:
   - Name: e.g., "Chef Maria"
   - Email: e.g., "maria@restaurant.com"
   - Password: Create a secure password
   - Role: Select "Chef (Kitchen Only)"
4. Click "Create User"

### Step 4: Staff Login
Counter or Chef staff can now login:
1. Go to http://localhost:3000/login
2. Enter their email
3. If multiple accounts with same email, select the right one
4. Enter password
5. Dashboard shows only their role's features

## Feature Access by Role

### Admin Dashboard
```
📊 Dashboard (Full stats)
💵 Billing
🛒 POS
🍽️ Tables
📜 Menu Items
📋 Orders
👨‍🍳 Kitchen Display (monitoring)
📦 Inventory
👥 Staff
📅 Reservations
🧾 KOT Logs
📈 Analytics
👤 User Management ← ADMIN ONLY
⚙️ Settings
```

### Counter/POS Dashboard
```
📊 Dashboard (Operations focus)
💵 Billing ✓
🛒 POS ✓
🍽️ Tables ✓
📜 Menu Items ✓
📋 Orders ✓
📦 Inventory ✓
👥 Staff ✓
📅 Reservations ✓
📈 Analytics ✓
⚙️ Settings ✓
```
NO: Kitchen Display, KOT Logs, User Management

### Chef Dashboard
```
👨‍🍳 Kitchen Display ✓
🧾 KOT Logs ✓
```
That's it! Chef only sees kitchen-related features.

## Using User Management

### View All Users
- Go to Dashboard → User Management
- See table with all staff members and their roles

### Edit User
1. Find user in table
2. Click "Edit" button
3. Update any field:
   - Name
   - Email
   - Role
   - Password (leave blank to keep current)
4. Click "Update User"

### Delete User
1. Find user in table
2. Click "Delete" button
3. Confirm deletion
4. User will no longer be able to login

### Change User Role
1. Click "Edit" on the user
2. Change the "Role" dropdown
3. Click "Update User"
4. Next time they login, they'll see the new dashboard

## Security Notes

### Passwords
- All passwords are securely hashed
- Never share user passwords via chat/email
- Have users change password on first login (future feature)
- Use strong passwords (8+ characters, mix of upper/lower/numbers)

### Session Management
- Login sessions expire after 24 hours
- Users must login again after expiration
- Logging out clears the session
- Switching browsers requires new login

### Data Access
- Counter users cannot see user management page
- Chef users cannot access billing or admin functions
- Each user only sees their assigned restaurant's data
- Admin cannot see other restaurant's data

## Using the Hooks (For Developers)

### Check Current User Role
```tsx
import { useRole } from '@/hooks/use-user'

export function MyComponent() {
  const { role, loading } = useRole()

  if (role === 'admin') {
    return <AdminDashboard />
  } else if (role === 'counter') {
    return <CounterDashboard />
  } else {
    return <ChefDashboard />
  }
}
```

### Check if User is Admin
```tsx
import { useIsAdmin } from '@/hooks/use-user'

export function AdminPanel() {
  const isAdmin = useIsAdmin()
  
  if (!isAdmin) return <div>Access Denied</div>
  
  return <div>Admin Controls</div>
}
```

### Get Full User Info
```tsx
import { useUser } from '@/hooks/use-user'

export function Profile() {
  const { user, loading } = useUser()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not logged in</div>
  
  return <div>Hello {user.email}</div>
}
```

## Troubleshooting

### Issue: Can't create users
- **Solution**: Make sure you're logged in as Admin
- Check sidebar shows "User Management" option
- Verify JWT_SECRET is set in .env.local

### Issue: User sees wrong menu
- **Solution**: Log out and log back in
- Check that userRole cookie is set (browser DevTools → Application → Cookies)
- Clear browser cache if needed

### Issue: Password not working
- **Solution**: Check caps lock
- Reset password: Ask admin to edit user and set new password

### Issue: Email not found on login
- **Solution**: Admin must create the user first in User Management
- Check email is spelled correctly
- Admin can only create Counter and Chef roles (first admin created on first login)

## API Endpoints (For Developers)

### User Management APIs

**List Users:**
```
GET /api/users
Header: x-admin-id: [admin-user-id]
```

**Create User:**
```
POST /api/users
Header: x-admin-id: [admin-user-id]
Body: { name, email, password, role: 'counter'|'chef' }
```

**Update User:**
```
PATCH /api/users/[user-id]
Header: x-admin-id: [admin-user-id]
Body: { name?, email?, password?, role? }
```

**Delete User:**
```
DELETE /api/users/[user-id]
Header: x-admin-id: [admin-user-id]
```

**Email Lookup (for login):**
```
POST /api/auth/users
Body: { email }
```

**Login:**
```
POST /api/auth/login
Body: { userId, password } OR { email, password }
```

## Best Practices

### For Admins
1. Create strong passwords for new users
2. Communicate credentials securely
3. Have users change passwords on first login
4. Regularly review user list
5. Delete inactive users
6. Use descriptive names (include position)

### For Users
1. Change default password immediately
2. Never share your login credentials
3. Log out when leaving workstation
4. Report suspicious activity
5. Don't use same password as other systems

## FAQ

**Q: Can a Counter user create other users?**
A: No, only Admin can create users.

**Q: Can I change a user's role?**
A: Yes, Admin can edit any user and change their role.

**Q: What happens if I delete a user?**
A: They can no longer log in. Previous data they created remains.

**Q: Can Chef see who ordered what?**
A: Chef sees items to prepare but not customer details (privacy).

**Q: Is there a password reset feature?**
A: Not yet, but Admin can edit user and set new password.

**Q: Can users change their own password?**
A: Not yet, only Admin can change passwords (coming soon).

**Q: How long does session last?**
A: 24 hours. Users must login again after.

**Q: Can multiple users use same email?**
A: No, email is unique. Each user needs own email.

## Contact & Support

For technical issues:
1. Check RBAC_IMPLEMENTATION.md for detailed documentation
2. Review error messages in browser console
3. Check MongoDB connection
4. Verify JWT_SECRET is set

---

**Last Updated:** 2024
**Version:** 1.0
