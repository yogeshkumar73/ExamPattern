# Quick Start - Arena Approval System Testing

## 🚀 Get Started in 5 Minutes

### Step 1: Start Your Application
```bash
npm run dev
# Server running at http://localhost:3000
```

---

### Step 2: Create Admin Account (One-Time Setup)

Open your terminal and run:

```bash
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "name": "System Admin"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "admin": {
    "id": "...",
    "email": "admin@example.com",
    "name": "System Admin",
    "role": "admin"
  }
}
```

✅ **Admin account is now ready!**

---

### Step 3: Register a Test User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'
```

**Expected Response:**
```json
{
  "message": "Registration successful! Please set up your academic profile.",
  "userId": "..."
}
```

✅ **User registered with PENDING arena status**

---

### Step 4: Login as Admin & Open Admin Panel

In your browser:

1. **Go to login page** → Enter admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

2. **Login successful** → You should see the admin panel

3. **Click "ARENA SERVICES"** tab (orange button at top)

4. **You should see:**
   - John Doe in the PENDING list
   - Approve and Reject buttons available

---

### Step 5: Approve the User

In the Admin Panel:

1. Find "John Doe" in the pending list
2. Click the **green "✓ Approve"** button
3. Status should change immediately

✅ **John Doe is now APPROVED!**

---

### Step 6: Verify User Can Access Arena

1. **Logout from admin**
2. **Login as John Doe:**
   - Email: `john@example.com`
   - Password: `password123`

3. **John's profile now shows:**
   - `arenaApprovalStatus: "approved"`
   - `arenaCanAccess: true`

4. **In your app:**
   - Arena button should be **ENABLED**
   - User can click to enter Battle Arena

✅ **Complete flow working!**

---

## 📋 What's Happening Behind the Scenes

### When User Registers:
```
Registration → Automatic Arena Fields Set:
├─ arenaApprovalStatus: "pending" ✓
├─ arenaAccessRequestedAt: [current date] ✓
└─ arenaApprovedAt: null
```

### When Admin Approves:
```
Admin Click → Database Updates:
├─ arenaApprovalStatus: "pending" → "approved" ✓
├─ arenaApprovedAt: [approval date] ✓
├─ arenaApprovedBy: "System Admin" ✓
└─ User can now access Arena ✓
```

### When User Logs In:
```
Login Response Includes:
├─ arenaApprovalStatus: "approved"
├─ arenaCanAccess: true ✓
└─ Frontend Shows Arena Button ✓
```

---

## 🎮 Test More Scenarios

### Scenario 1: Reject a User

```bash
# Register another user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "password123",
    "phone": "8765432109"
  }'
```

Then in Admin Panel:
1. Find Alice in PENDING list
2. Click red **"✕ Reject"** button
3. Enter reason: "Profile incomplete"
4. Click Confirm

Alice will now see rejection reason when she logs in ✓

---

### Scenario 2: Bulk Approve Multiple Users

Register 3 users, then in Admin Panel:
1. Check the **checkbox** next to each user
2. Click **"Approve All"** button
3. All selected users approved at once ✓

---

### Scenario 3: Filter by Status

In Admin Panel:
- Click **"APPROVED"** tab → See only approved users
- Click **"REJECTED"** tab → See rejected users
- Click **"ALL"** tab → See all users

---

## 🛠️ Database Fields Reference

Every registered user gets these arena fields:

```javascript
{
  arenaApprovalStatus: "pending",              // Status
  arenaAccessRequestedAt: "2026-06-07T...",    // When they registered
  arenaApprovedAt: null,                       // When approved (null initially)
  arenaRejectedAt: null,                       // When rejected (null initially)
  arenaApprovedBy: "",                         // Admin who approved
  arenaApprovalReason: ""                      // Rejection reason
}
```

---

## ✅ Verification Checklist

- [ ] Admin account created successfully
- [ ] New user registers and shows in pending
- [ ] Admin can see user in Arena Services tab
- [ ] Admin can approve user
- [ ] User can login and see arena access approved
- [ ] Rejected users see rejection reason
- [ ] Bulk operations work (approve multiple at once)
- [ ] Filter by status works (Pending/Approved/Rejected/All)

---

## 🐛 If Something Doesn't Work

### Issue: "User not found" when approving
**Solution:** Refresh the admin panel to get fresh user list

### Issue: Demo data showing instead of real users
**Solution:** Make sure you're logged in as admin (role = "admin")

### Issue: "No session found" in console
**Solution:** This is normal - shows demo data while no user logged in

### Issue: Can't create admin account
**Solution:** 
1. Check MongoDB is running: `mongod`
2. Verify MONGODB_URI in .env
3. Try again

### Issue: Registration returns error
**Solution:**
1. Use valid email (not already registered)
2. Password must be 6+ characters
3. Phone number is required

---

## 🎯 Expected Behavior Summary

| Step | Expected Behavior | Status |
|------|------------------|--------|
| Register User | User gets pending status | ✅ |
| Admin Views Panel | Sees pending users from DB | ✅ |
| Admin Approves | User status → approved | ✅ |
| User Logs In | Gets arenaCanAccess = true | ✅ |
| User Enters Arena | Access granted | ✅ |

---

## 📞 Need Help?

Check these files for detailed info:
- **[ARENA_COMPLETE_SETUP_GUIDE.md](ARENA_COMPLETE_SETUP_GUIDE.md)** - Full technical docs
- **[ARENA_APPROVAL_SYSTEM_FLOW.md](ARENA_APPROVAL_SYSTEM_FLOW.md)** - Complete API reference
- **[ARENA_APPROVAL_FIX_GUIDE.md](ARENA_APPROVAL_FIX_GUIDE.md)** - What was fixed

---

## 🚀 You're All Set!

The Arena Approval System is now fully integrated:

✅ Users register → Pending status  
✅ Admin approves → Access granted  
✅ Users login → Can access arena  
✅ All changes tracked in database  

**Ready to use!**

