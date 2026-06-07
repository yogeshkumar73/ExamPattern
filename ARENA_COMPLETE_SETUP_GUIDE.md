# Arena Approval System - Complete Setup & Testing Guide

## System Overview

The Arena Approval System works as follows:
1. **User Registration** → Automatically creates pending arena request
2. **Admin Login** → Can view and manage arena approvals
3. **Admin Actions** → Approve/Reject users for arena access
4. **User Access** → Approved users can enter Battle Arena

---

## Step 1: Initialize Admin Account

### Create First Admin User

```bash
# POST to create admin account
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d {
    "email": "admin@example.com",
    "password": "admin123",
    "name": "Admin User"
  }
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Check Admin Status

```bash
curl http://localhost:3000/api/admin/init
```

**Response:**
```json
{
  "success": true,
  "adminCount": 1,
  "totalUsers": 5,
  "adminExists": true,
  "message": "1 admin(s) found in database"
}
```

---

## Step 2: Register New Users

### User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210"
  }
```

**Response:**
```json
{
  "message": "Registration successful! Please set up your academic profile.",
  "userId": "507f1f77bcf86cd799439012"
}
```

**Database Updated:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "status": "Active",
  "profileComplete": false,
  "isLabApproved": true,
  
  // Arena Fields - NEW USER DEFAULTS
  "arenaApprovalStatus": "pending",
  "arenaAccessRequestedAt": "2026-06-07T10:30:00Z",
  "arenaApprovalReason": "",
  "arenaApprovedBy": "",
  "arenaApprovedAt": null,
  "arenaRejectedAt": null
}
```

---

## Step 3: Login & Check Arena Status

### User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d {
    "email": "john@example.com",
    "password": "password123"
  }
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    ...
    "arenaApprovalStatus": "pending",
    "arenaCanAccess": false
  }
}
```

### Frontend Logic
```typescript
// User logs in
if (!user.arenaCanAccess) {
  // Show: "Pending Admin Approval"
  // Arena button disabled/hidden
} else {
  // Show: "Enter Battle Arena"
  // Arena button enabled/clickable
}
```

---

## Step 4: Admin Views Pending Approvals

### Admin Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d {
    "email": "admin@example.com",
    "password": "admin123"
  }
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    ...
  }
}
```

### Admin Opens Admin Panel → Arena Services Tab

The component:
1. Reads `aura_session` from localStorage (set by login)
2. Parses the session JSON
3. Checks if `user.role === 'admin'`
4. If admin: Fetches real data from `/api/admin/arena-approvals`
5. If not admin: Shows demo data

### Fetch Pending Approvals

```bash
curl "http://localhost:3000/api/admin/arena-approvals?status=pending&page=1&limit=50" \
  -H "x-session-user: %7B%22role%22:%22admin%22,%22id%22:%22507f1f77bcf86cd799439011%22%7D"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "photoUrl": "",
      "arenaApprovalStatus": "pending",
      "arenaApprovalReason": "",
      "arenaAccessRequestedAt": "2026-06-07T10:30:00Z",
      "arenaApprovedAt": null,
      "arenaRejectedAt": null
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "photoUrl": "",
      "arenaApprovalStatus": "pending",
      "arenaApprovalReason": "",
      "arenaAccessRequestedAt": "2026-06-07T11:00:00Z",
      "arenaApprovedAt": null,
      "arenaRejectedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2,
    "pages": 1
  }
}
```

**Admin UI Shows:**
- ✓ John Doe - john@example.com - [Approve] [Reject]
- ✓ Alice Smith - alice@example.com - [Approve] [Reject]

---

## Step 5: Admin Approves User

### Single Approve

```bash
curl -X POST http://localhost:3000/api/admin/arena-approvals \
  -H "Content-Type: application/json" \
  -H "x-session-user: %7B%22role%22:%22admin%22,%22id%22:%22507f1f77bcf86cd799439011%22%7D" \
  -d {
    "userId": "507f1f77bcf86cd799439012",
    "action": "approve"
  }
```

**Response:**
```json
{
  "success": true,
  "message": "Arena access approved for John Doe",
  "data": {
    "userId": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com",
    "arenaApprovalStatus": "approved",
    "arenaApprovedAt": "2026-06-07T11:15:00Z",
    "arenaRejectedAt": null,
    "arenaApprovalReason": ""
  }
}
```

**Database Updated:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "arenaApprovalStatus": "approved",      // Changed from "pending"
  "arenaApprovedAt": "2026-06-07T11:15:00Z",
  "arenaApprovedBy": "Admin User",        // Set to approving admin's name
  "arenaRejectedAt": null
}
```

---

## Step 6: User Logs In Again → Has Access

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d {
    "email": "john@example.com",
    "password": "password123"
  }
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "arenaApprovalStatus": "approved",
    "arenaCanAccess": true              // NOW TRUE!
  }
}
```

**Frontend Logic:**
```typescript
if (user.arenaCanAccess) {
  // Arena button is NOW ENABLED
  <button onClick={() => navigate('/battle-arena')}>
    ⚡ Enter Battle Arena
  </button>
}
```

---

## Alternative: Admin Rejects User

### Single Reject

```bash
curl -X POST http://localhost:3000/api/admin/arena-approvals \
  -H "Content-Type: application/json" \
  -H "x-session-user: %7B%22role%22:%22admin%22%7D" \
  -d {
    "userId": "507f1f77bcf86cd799439013",
    "action": "reject",
    "reason": "Need more profile completion before arena access"
  }
```

**Response:**
```json
{
  "success": true,
  "message": "Arena access rejected for Alice Smith",
  "data": {
    "userId": "507f1f77bcf86cd799439013",
    "arenaApprovalStatus": "rejected",
    "arenaRejectedAt": "2026-06-07T11:20:00Z",
    "arenaApprovalReason": "Need more profile completion before arena access"
  }
}
```

### User Sees Rejection

```bash
# Alice logs in
curl -X POST http://localhost:3000/api/auth/login ...
```

**Response:**
```json
{
  "user": {
    "arenaApprovalStatus": "rejected",
    "arenaCanAccess": false,
    "arenaApprovalReason": "Need more profile completion before arena access"
  }
}
```

**Frontend Shows:**
```
❌ Arena Access Rejected
Reason: Need more profile completion before arena access
```

---

## Bulk Operations

### Bulk Approve Multiple Users

```bash
curl -X PUT http://localhost:3000/api/admin/arena-approvals \
  -H "Content-Type: application/json" \
  -H "x-session-user: %7B%22role%22:%22admin%22%7D" \
  -d {
    "userIds": [
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439014",
      "507f1f77bcf86cd799439015"
    ],
    "action": "approve"
  }
```

**Response:**
```json
{
  "success": true,
  "message": "Arena access approved for 3 users",
  "modifiedCount": 3
}
```

---

## Error Handling

### Error: Not Admin

```bash
# Non-admin trying to access admin endpoint
curl "http://localhost:3000/api/admin/arena-approvals?status=pending" \
  -H "x-session-user: %7B%22role%22:%22student%22%7D"
```

**Response:**
```json
{
  "error": "Unauthorized - Admin access required",
  "status": 401
}
```

**Component Behavior:**
- Logs warning: "User is not admin"
- Shows demo data instead (for UI testing)

### Error: Missing Required Fields

```bash
# Trying to reject without reason
curl -X POST http://localhost:3000/api/admin/arena-approvals \
  -d {
    "userId": "507f1f77bcf86cd799439012",
    "action": "reject"
    // Missing "reason"
  }
```

**Response:**
```json
{
  "error": "reason is required for rejection",
  "status": 400
}
```

---

## Complete Testing Checklist

- [ ] Create admin account: `POST /api/admin/init`
- [ ] Check admin exists: `GET /api/admin/init`
- [ ] Register User 1: `POST /api/auth/register` (John)
- [ ] Register User 2: `POST /api/auth/register` (Alice)
- [ ] Login as User 1: `POST /api/auth/login` (arenaCanAccess = false)
- [ ] Login as Admin: `POST /api/auth/login` (role = admin)
- [ ] Open Admin Panel in browser → Arena Services tab
- [ ] See John & Alice in pending list
- [ ] Click Approve on John
- [ ] Login as John again → arenaCanAccess = true
- [ ] Filter to see Approved users → John appears
- [ ] Click Reject on Alice with reason
- [ ] Login as Alice → See rejection reason
- [ ] Bulk select → Approve multiple
- [ ] Verify all changes in database

---

## Database Schema Reference

### User Arena Fields

```javascript
{
  // Status
  arenaApprovalStatus: String,  // "pending" | "approved" | "rejected"
  
  // Timestamps
  arenaAccessRequestedAt: Date,  // When user registered
  arenaApprovedAt: Date,         // When admin approved
  arenaRejectedAt: Date,         // When admin rejected
  
  // Admin Info
  arenaApprovedBy: String,       // Admin's name
  arenaApprovalReason: String,   // Rejection reason
}
```

---

## Frontend Integration Checklist

In your user profile/dashboard:

```typescript
// 1. After login, store user in localStorage
localStorage.setItem('aura_session', JSON.stringify(user));

// 2. Check arena access before showing Arena button
if (user.arenaCanAccess) {
  // Show clickable Arena button
} else if (user.arenaApprovalStatus === 'pending') {
  // Show "Pending Admin Approval"
} else if (user.arenaApprovalStatus === 'rejected') {
  // Show rejection reason
}

// 3. In Admin Panel
// Component automatically checks:
// - Is user admin? (role === 'admin')
// - If yes: Fetch real data from API
// - If no: Show demo data
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Admin panel shows demo data | Check if logged in as admin (role = 'admin') |
| Can't create admin | Check MongoDB connection, verify endpoint POST /api/admin/init |
| New users not appearing | Verify registration response includes userId, check DB for arena fields |
| Approve button doesn't work | Check admin session in localStorage, verify x-session-user header |
| User still can't access arena | Verify arenaApprovalStatus = 'approved' in database |

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/admin/init` | GET | Check admin status | None |
| `/api/admin/init` | POST | Create admin user | None |
| `/api/auth/register` | POST | Register new user | None |
| `/api/auth/login` | POST | Login (user or admin) | None |
| `/api/profile` | GET | Get user profile with arena info | None |
| `/api/admin/arena-approvals` | GET | List approvals (by status) | Admin |
| `/api/admin/arena-approvals` | POST | Single approve/reject | Admin |
| `/api/admin/arena-approvals` | PUT | Bulk approve/reject | Admin |
| `/api/user/arena-status` | GET | Check user's arena status | None |

---

## Next Steps

1. **Create Admin Account** → Run POST /api/admin/init
2. **Register Test Users** → Create 2-3 test users
3. **Login as Admin** → Open admin panel
4. **Test Arena Services** → Approve/reject users
5. **Verify as User** → Login as users and check access

All changes are automatically synced with the database! ✓

