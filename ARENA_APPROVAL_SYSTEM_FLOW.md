# Arena Approval System - Complete Flow

## Overview
The Arena Approval System is a multi-step process that allows users to request access to the Battle Arena, which is then managed by admins through the Admin Command Center.

---

## 1. User Registration → Arena Access Request

### When User Registers:
**Endpoint:** `POST /api/auth/register`

The system automatically initializes arena fields:
```json
{
  "arenaApprovalStatus": "pending",
  "arenaAccessRequestedAt": "2026-06-07T10:30:00Z",
  "arenaApprovalReason": "",
  "arenaApprovedBy": "",
  "arenaApprovedAt": null,
  "arenaRejectedAt": null
}
```

**Key Points:**
- Registration automatically sets `arenaApprovalStatus` to `"pending"`
- Request timestamp is recorded in `arenaAccessRequestedAt`
- New users cannot access Arena until admin approves them

---

## 2. User Login → Arena Status Check

### When User Logs In:
**Endpoint:** `POST /api/auth/login`

Response includes arena status:
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    ...
    "arenaApprovalStatus": "pending",  // "pending" | "approved" | "rejected"
    "arenaCanAccess": false             // true only if status === "approved"
  }
}
```

**Frontend Usage:**
- Check `arenaCanAccess` boolean to show/hide Arena button
- If `arenaApprovalStatus === "pending"`: Show "Pending Approval"
- If `arenaApprovalStatus === "rejected"`: Show rejection reason

---

## 3. Check Arena Status Anytime

### Endpoint: `GET /api/user/arena-status?userId={userId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "name": "John Doe",
    "arenaApprovalStatus": "pending",
    "arenaApprovalReason": "",
    "arenaApprovedAt": null,
    "arenaRejectedAt": null,
    "arenaAccessRequestedAt": "2026-06-07T10:30:00Z",
    "isApproved": false,
    "isRejected": false,
    "isPending": true
  }
}
```

---

## 4. Admin Management - Arena Services Tab

### Admin Panel Endpoint: `GET /api/admin/arena-approvals?status={status}`

**Query Parameters:**
- `status`: `"pending"` | `"approved"` | `"rejected"` | `"all"` (default: "pending")
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Authentication Required:**
- Header: `x-session-user: <encoded-admin-session>`
- User role must be `"admin"`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "photoUrl": "",
      "arenaApprovalStatus": "pending",
      "arenaApprovalReason": "",
      "arenaApprovedAt": null,
      "arenaRejectedAt": null,
      "arenaAccessRequestedAt": "2026-06-07T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

## 5. Admin Actions - Approve/Reject

### Single Action Endpoint: `POST /api/admin/arena-approvals`

**Request Body:**
```json
{
  "userId": "user_id",
  "action": "approve",  // or "reject"
  "reason": "Does not meet requirements" // Required for reject, optional for approve
}
```

**Response:**
```json
{
  "success": true,
  "message": "Arena access approved for John Doe",
  "data": {
    "userId": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "arenaApprovalStatus": "approved",
    "arenaApprovedAt": "2026-06-07T11:00:00Z",
    "arenaRejectedAt": null,
    "arenaApprovalReason": ""
  }
}
```

---

## 6. Admin Bulk Actions

### Bulk Endpoint: `PUT /api/admin/arena-approvals`

**Request Body:**
```json
{
  "userIds": ["user_id_1", "user_id_2", "user_id_3"],
  "action": "approve"  // or "reject"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully processed 3 approvals",
  "data": {
    "modifiedCount": 3,
    "processed": ["user_id_1", "user_id_2", "user_id_3"]
  }
}
```

---

## 7. Request Arena Access (User Action)

### User Request Endpoint: `POST /api/user/arena-status`

**Request Body:**
```json
{
  "userId": "user_id",
  "action": "request"
}
```

**Response (if already pending):**
```json
{
  "success": true,
  "message": "Your request is already pending admin approval",
  "isPending": true
}
```

**Response (if already approved):**
```json
{
  "success": true,
  "message": "You already have arena access approved",
  "isApproved": true
}
```

---

## Complete User Journey

```
1. User Registers
   ↓
   arena_status = "pending"
   arena_access_requested_at = NOW

2. User Logs In
   ↓
   Response includes arena_status
   Frontend checks: arenaCanAccess = false (if pending)

3. Admin Opens Admin Panel → Arena Services Tab
   ↓
   Fetches all pending approvals
   Can filter by: pending, approved, rejected, all

4. Admin Reviews User Request
   ↓
   Can: Approve | Reject with reason | Bulk Approve | Bulk Reject

5. If Approved:
   ↓
   arena_status = "approved"
   arena_approved_at = NOW
   arena_approved_by = Admin Name
   ↓
   User logs in again → arenaCanAccess = true
   User can now access Arena

6. If Rejected:
   ↓
   arena_status = "rejected"
   arena_rejected_at = NOW
   arena_approval_reason = Rejection reason
   ↓
   User logs in → sees rejection reason
   Can request again (creates new pending request)
```

---

## Database Schema

### User Model Arena Fields:
```typescript
{
  // Arena Approval System
  arenaApprovalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  arenaApprovalReason: String,
  arenaApprovedBy: String,      // Admin who approved
  arenaApprovedAt: Date,
  arenaRejectedAt: Date,
  arenaAccessRequestedAt: Date,  // When user registered or requested
}
```

---

## Frontend Integration

### Check Arena Access:
```typescript
const userProfile = await fetch(`/api/profile?email=${email}`);
const { user } = await userProfile.json();

if (user.arenaCanAccess) {
  // Show Arena button / enable Arena access
} else if (user.arenaApprovalStatus === 'pending') {
  // Show: "Pending Approval - Admin Review In Progress"
} else if (user.arenaApprovalStatus === 'rejected') {
  // Show: "Rejected: {user.arenaApprovalReason}"
}
```

### Display Arena Status:
```typescript
<Badge variant={
  user.arenaApprovalStatus === 'approved' ? 'success' :
  user.arenaApprovalStatus === 'rejected' ? 'destructive' :
  'warning'
}>
  {user.arenaApprovalStatus.toUpperCase()}
</Badge>
```

---

## Testing Scenarios

### Scenario 1: New User Registration
1. Register new user
2. Check DB: `arenaApprovalStatus` = "pending"
3. Login: `arenaCanAccess` = false
4. Admin approves in Arena Services tab
5. Login again: `arenaCanAccess` = true ✓

### Scenario 2: Admin Bulk Operations
1. Select multiple pending users
2. Click "Approve All"
3. All selected users' status → "approved"
4. Each user can now access Arena ✓

### Scenario 3: Rejection with Reason
1. Admin selects a user
2. Click "Reject"
3. Enter reason: "Need more experience"
4. User logs in: sees rejection reason
5. User can request again ✓

---

## API Error Codes

| Code | Scenario | Solution |
|------|----------|----------|
| 401 | Non-admin user calling admin endpoint | Login as admin user |
| 400 | Missing required fields | Check request body |
| 404 | User not found | Verify userId exists |
| 409 | User already exists | Use different email |
| 500 | Database error | Check MongoDB connection |

---

## Summary

✅ **Implemented:**
- User registration auto-initializes arena fields
- Login includes arena status
- Admin can view pending approvals
- Admin can approve/reject single users
- Admin can bulk approve/reject
- Users can check their arena status anytime
- Profile endpoint includes arena information

✅ **Features:**
- Rejection reasons stored and displayed
- Approval timestamps tracked
- Admin name recorded on approval
- Request timestamp recorded
- Filtering by status (pending/approved/rejected/all)
- Pagination support

✅ **Security:**
- Only admins can approve/reject
- User roles validated at API level
- Session-based authentication
- Rate limiting on registration
