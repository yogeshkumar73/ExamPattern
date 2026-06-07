# Arena Approval System - Documentation

## 🎯 Overview

The Arena Approval System restricts access to the battle arena based on admin approval. Students must request access, and admins must approve them before they can participate in battles.

## 📋 System Architecture

### User Model Updates
- `arenaApprovalStatus`: Status of approval ('pending', 'approved', 'rejected')
- `arenaApprovalReason`: Reason for rejection (if rejected)
- `arenaApprovedBy`: Admin ID who approved
- `arenaApprovedAt`: Timestamp of approval
- `arenaRejectedAt`: Timestamp of rejection
- `arenaAccessRequestedAt`: Timestamp of request submission

## 🔄 API Endpoints

### 1. Admin Management
**Endpoint**: `/api/admin/arena-approvals`

#### GET - Fetch approval requests
```bash
GET /api/admin/arena-approvals?status=pending&page=1&limit=10
```

**Query Parameters:**
- `status`: 'pending' | 'approved' | 'rejected' | 'all'
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "name": "Student Name",
      "email": "student@example.com",
      "photoUrl": "avatar_url",
      "arenaApprovalStatus": "pending",
      "arenaAccessRequestedAt": "2026-06-07T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### POST - Approve or reject access
```bash
POST /api/admin/arena-approvals
Content-Type: application/json

{
  "userId": "user_id",
  "action": "approve",
  "reason": "optional - required for reject"
}
```

**Actions:**
- `approve`: Grant arena access
- `reject`: Deny arena access (requires reason)

**Response:**
```json
{
  "success": true,
  "message": "Arena access approved for John Doe",
  "data": {
    "userId": "user_id",
    "name": "John Doe",
    "arenaApprovalStatus": "approved",
    "arenaApprovedAt": "2026-06-07T10:05:00Z"
  }
}
```

#### PUT - Bulk approve/reject
```bash
PUT /api/admin/arena-approvals
Content-Type: application/json

{
  "userIds": ["user_id_1", "user_id_2", "user_id_3"],
  "action": "approve",
  "reason": "optional for reject"
}
```

#### DELETE - Reset approval status
```bash
DELETE /api/admin/arena-approvals?userId=user_id
```

### 2. Student Check
**Endpoint**: `/api/user/arena-status`

#### GET - Check current approval status
```bash
GET /api/user/arena-status?userId=user_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "name": "Student Name",
    "email": "student@example.com",
    "arenaApprovalStatus": "pending",
    "arenaApprovalReason": "",
    "arenaApprovedAt": null,
    "arenaRejectedAt": null,
    "isApproved": false,
    "isRejected": false,
    "isPending": true
  }
}
```

#### POST - Request arena access
```bash
POST /api/user/arena-status
Content-Type: application/json

{
  "userId": "user_id",
  "action": "request"
}
```

## 🎨 UI Components

### 1. Admin Panel - `admin-arena-approvals.tsx`
Comprehensive admin dashboard for managing arena approvals.

**Features:**
- Filter by status (pending, approved, rejected, all)
- View all pending requests with pagination
- Approve individual students
- Reject with custom reason
- Bulk approve/reject selected students
- Reconsider previously rejected students
- Select/deselect all functionality

**Usage:**
```tsx
import AdminArenaApprovals from '@/components/admin-arena-approvals';

export default function AdminPage() {
  return <AdminArenaApprovals />;
}
```

### 2. Student Status - `student-arena-status.tsx`
Student component showing approval status and requesting access.

**Features:**
- Display approval status
- Show rejection reason
- Request/re-request access button
- Auto-refresh status (30-second intervals)
- Animated status indicators

**Usage:**
```tsx
import StudentArenaStatus from '@/components/student-arena-status';

export default function Page() {
  return (
    <StudentArenaStatus 
      userId={userId}
      onApprovalStatusChange={(status) => console.log(status)}
    />
  );
}
```

### 3. Battle Arena - Updated `battle-arena.tsx`
Arena is now locked until approved.

**Status Display:**
- **Pending**: Shows "⏳ Approval Pending" message
- **Rejected**: Shows "❌ Arena Access Denied" with reason
- **Not Requested**: Shows "🔓 Request Arena Access" guide
- **Approved**: Full arena access, start battle button enabled

**Locked State:**
- Start Battle button disabled and grayed out
- Lock icon displayed
- Warning banner shows approval status
- Alert appears on button click if not approved

## 📊 User Flows

### Student Flow
1. **Initial State**: Student has `arenaApprovalStatus: 'pending'`
2. **Request**: Student can request access via StudentArenaStatus component
3. **Pending**: Status shows "Request pending admin review"
4. **Admin Reviews**: Admin approves or rejects via AdminArenaApprovals
5. **Approved**: Status updates, student can now access arena
6. **Battle**: Student can create tournaments and participate in battles

### Admin Flow
1. **Review Dashboard**: Admin sees all pending requests
2. **Evaluate**: Admin reviews student profile and history
3. **Decision**: Approve or reject with optional reason
4. **Bulk Action**: Can approve/reject multiple students at once
5. **Reconsider**: Can change decision for rejected students

### Rejected Student Flow
1. **See Reason**: Student sees rejection reason
2. **Request Again**: Can request access again with "Request Again" button
3. **Resubmit**: Status returns to pending for re-review
4. **Admin Re-reviews**: Admin can reconsider or maintain rejection

## 🔒 Access Control

### Before Approval
```
✗ Cannot start battles
✗ Cannot create tournaments
✗ Cannot join tournaments
✗ Cannot earn XP/points
✓ Can view leaderboard (read-only)
✓ Can access profile
✓ Can chat
```

### After Approval
```
✓ Can start battles
✓ Can create tournaments
✓ Can join tournaments
✓ Can earn XP/points
✓ Full arena access
```

## 🚀 Integration Steps

### 1. Add Components to Admin Page
```tsx
// app/admin/page.tsx
'use client';

import AdminArenaApprovals from '@/components/admin-arena-approvals';

export default function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <AdminArenaApprovals />
    </div>
  );
}
```

### 2. Add Status Check to Student Dashboard
```tsx
// app/student/arena/page.tsx
'use client';

import StudentArenaStatus from '@/components/student-arena-status';

export default function ArenaPage() {
  const userId = getUserIdFromSession(); // Your auth logic

  return (
    <div>
      <h1>Arena Access</h1>
      <StudentArenaStatus userId={userId} />
    </div>
  );
}
```

### 3. Battle Arena Already Protected
The `BattleArena` component now automatically:
- Checks approval status on load
- Shows lock screen if not approved
- Prevents battle start if not approved
- Displays approval message/reason

## 📝 Example Workflows

### Approve a Student
```
1. Admin visits /admin/arena-approvals
2. Filters to "pending" status
3. Reviews student profile
4. Clicks "Approve" button
5. Student immediately gets approval notification
6. Student can now start battles
```

### Reject with Reason
```
1. Admin reviews student
2. Clicks "Reject" button
3. Enters reason: "Need to complete profile first"
4. Student sees rejection with reason
5. Student must fix issues and request again
```

### Bulk Approve
```
1. Admin selects multiple pending students (checkboxes)
2. Clicks "Approve All" button
3. All selected students get instant approval
4. Saves admin time for bulk decisions
```

## 🔔 Notifications

### Auto-Refresh
- Student status refreshes every 30 seconds
- Student sees approval immediately when admin approves

### Messages Displayed
- **Pending**: "Your arena access request is being reviewed by administrators"
- **Approved**: "🎉 Arena Access Approved! You have full access to the battle arena"
- **Rejected**: "❌ Arena Access Denied. Reason: [admin reason]"

## 🐛 Error Handling

### API Errors
- All endpoints return appropriate HTTP status codes
- Clear error messages for validation failures
- Fallback behavior for failed requests

### UI Errors
- Graceful degradation if status check fails
- Retry mechanism for failed fetches
- User-friendly error messages

## 📈 Admin Best Practices

1. **Regular Review**: Check pending requests weekly
2. **Clear Reasons**: Always provide specific rejection reasons
3. **Consistency**: Apply same criteria to all students
4. **Documentation**: Keep notes on decisions
5. **Fair Process**: Allow students to re-request after rejection
6. **Automation**: Use bulk approve for fast-tracked groups

## 🔐 Security Notes

- All API routes check admin authorization
- User can only see their own status
- Admins can see and modify all student statuses
- Approval timestamps are immutable
- All changes are logged in the database

## 🚧 Future Enhancements

- Email notifications when approved/rejected
- Automatic approval for verified students
- Appeal process for rejected students
- Approval requirements based on profile completeness
- Time-based auto-approval for pending requests
- Admin approval audit log/history
- Student appeal messages

---

**Version**: 1.0.0
**Status**: Production Ready
**Last Updated**: 2026-06-07
