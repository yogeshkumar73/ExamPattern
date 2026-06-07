# Arena Admin Approval System - Implementation Guide

## Overview
The Arena Admin Approval System provides admins with a complete interface to manage student access to the battle arena. This system includes an admin dashboard, approval management interface, and settings panel.

## System Architecture

### Components
1. **Admin Layout** (`app/admin/layout.tsx`)
   - Protected layout requiring admin role
   - Sidebar navigation
   - Session-based authentication
   - Dark mode support

2. **Admin Dashboard** (`app/admin/page.tsx`)
   - Statistics cards (pending, approved, rejected, total)
   - Quick action buttons
   - Real-time data fetching

3. **Arena Approvals Page** (`app/admin/arena-approvals/page.tsx`)
   - Main approval management interface
   - Filter by status (pending, approved, rejected, all)
   - Single approve/reject functionality
   - Bulk approve functionality
   - Pagination support

4. **Settings Page** (`app/admin/settings/page.tsx`)
   - Arena-specific settings
   - Notification preferences
   - Security settings
   - Data management options

### API Endpoints
All endpoints are protected by admin role check.

#### GET `/api/admin/arena-approvals`
Fetch arena approval requests with pagination and filtering.

**Headers:**
```
x-session-user: encodeURIComponent(JSON.stringify(user))
```

**Query Parameters:**
- `status`: 'pending' | 'approved' | 'rejected' | 'all' (default: pending)
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
      "photoUrl": "url",
      "arenaApprovalStatus": "pending",
      "arenaAccessRequestedAt": "2026-06-07T..."
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

#### POST `/api/admin/arena-approvals`
Approve or reject a single user's arena access.

**Headers:**
```
x-session-user: encodeURIComponent(JSON.stringify(user))
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_id",
  "action": "approve" | "reject",
  "reason": "rejection reason (required only for reject)"
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
    "arenaApprovedAt": "2026-06-07T..."
  }
}
```

#### PUT `/api/admin/arena-approvals`
Bulk approve or reject multiple users' arena access.

**Headers:**
```
x-session-user: encodeURIComponent(JSON.stringify(user))
Content-Type: application/json
```

**Request Body:**
```json
{
  "userIds": ["user_id_1", "user_id_2", ...],
  "action": "approve" | "reject",
  "reason": "rejection reason (optional for bulk reject)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Arena access approved for 5 users",
  "modifiedCount": 5
}
```

#### DELETE `/api/admin/arena-approvals`
Reset a user's approval status back to pending.

**Headers:**
```
x-session-user: encodeURIComponent(JSON.stringify(user))
```

**Query Parameters:**
- `userId`: User ID to reset

**Response:**
```json
{
  "success": true,
  "message": "Arena approval status reset to pending",
  "data": {
    "userId": "user_id",
    "name": "John Doe",
    "arenaApprovalStatus": "pending"
  }
}
```

## Authentication

The system uses session-based authentication through the `x-session-user` header. Users must:
1. Be logged in (session stored in `localStorage.aura_session`)
2. Have `role === 'admin'`

The admin layout automatically:
- Checks authentication on mount
- Redirects non-admins to home page
- Stores session in localStorage
- Handles logout with session cleanup

## User Interface Features

### Admin Dashboard
- **Statistics Overview**: Real-time counts of all approval states
- **Quick Actions**: Direct links to pending reviews and all approvals
- **Responsive Design**: Works on mobile, tablet, and desktop

### Arena Approvals Interface
- **Filter Tabs**: Switch between pending, approved, rejected, and all requests
- **Bulk Selection**: Select multiple users for batch operations
- **Individual Actions**: Approve or reject with optional rejection reason
- **User Info**: Display avatar, name, and email for each request
- **Timestamps**: Show when request was made
- **Pagination**: Navigate through large lists of requests
- **Status Badges**: Visual indicators of approval status
- **Error/Success Messages**: Clear feedback on actions

### Settings Page
- **Arena Settings**: Auto-approve options
- **Notifications**: Control notification preferences
- **Security**: Session timeouts and 2FA options
- **Data Management**: Export and cache management

## Usage Guide

### For Admins

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Login required (redirects if not authenticated)
   - Only accessible to users with `role === 'admin'`

2. **Review Pending Requests**
   - Click "Arena Approvals" in sidebar
   - Default filter shows pending requests
   - Review student information and approve/reject

3. **Approve a Student**
   - Find student in the list
   - Click "Approve" button
   - Student gets instant access to arena

4. **Reject a Student**
   - Click "Reject" button
   - Enter reason for rejection
   - Student receives notification of rejection

5. **Bulk Approve**
   - Check boxes next to multiple students
   - Click "Approve All" button
   - Confirm action

6. **View Statistics**
   - Dashboard shows real-time stats
   - Cards update when you approve/reject

### For Frontend Integration

To send requests from the frontend:

```typescript
const user = JSON.parse(localStorage.getItem('aura_session'));

const response = await fetch('/api/admin/arena-approvals', {
  method: 'GET',
  headers: {
    'x-session-user': encodeURIComponent(JSON.stringify(user)),
  },
});
```

## Error Handling

All API endpoints include comprehensive error handling:

- **401 Unauthorized**: User not authenticated or not admin
- **400 Bad Request**: Missing or invalid required fields
- **404 Not Found**: User not found
- **500 Server Error**: Database or processing errors

Error responses include descriptive messages:
```json
{
  "error": "Unauthorized - Admin access required"
}
```

## User Model Fields

The User model includes these arena-specific fields:
- `arenaApprovalStatus`: 'pending' | 'approved' | 'rejected'
- `arenaApprovalReason`: Rejection reason (if applicable)
- `arenaApprovedBy`: Name of admin who approved
- `arenaApprovedAt`: Timestamp of approval
- `arenaRejectedAt`: Timestamp of rejection
- `arenaAccessRequestedAt`: Timestamp of request

## Security Considerations

1. **Admin-Only Access**: All endpoints check for admin role
2. **Session Validation**: Uses stored session from localStorage
3. **Input Validation**: All required fields validated before processing
4. **Error Messages**: Safe error messages that don't leak sensitive info
5. **CORS Protection**: Standard Next.js API protection

## Future Enhancements

- Two-factor authentication for admins
- Audit logs of all approval actions
- Automated approval rules based on criteria
- Email notifications to students
- Approval templates with preset reasons
- Activity timeline showing approval history
- Admin role permissions (super-admin, moderator, etc.)

## Troubleshooting

### "Unauthorized - Admin access required"
- Verify user has `role === 'admin'` in database
- Check that session is stored in localStorage
- Ensure browser cookies/storage are enabled

### Cannot access `/admin` page
- Must be logged in first
- Must have admin role
- Clear browser cache and try again

### Bulk operations not working
- Ensure at least one user is selected
- Check that session header is properly formatted
- Verify network request in browser dev tools

### Statistics not updating
- Refresh the page
- Check browser console for errors
- Verify API connectivity

## Support & Maintenance

For issues or questions:
1. Check browser console for errors
2. Review API response in network tab
3. Verify user role and session
4. Check MongoDB connection
5. Review logs in server console
