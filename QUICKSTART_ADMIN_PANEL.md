# Arena Admin Panel - Quick Start Guide

## 🚀 Getting Started

### Access the Admin Panel
1. Make sure you're logged in as an admin user
2. Navigate to `http://localhost:3000/admin`
3. If you see an unauthorized message, verify:
   - Your user account has `role: 'admin'` in the database
   - You're logged in (check localStorage for `aura_session`)

### Dashboard Overview

#### Main Page (`/admin`)
- **Statistics Cards**: See real-time counts of approval requests
- **Quick Actions**: Jump to specific filters or views

#### Arena Approvals (`/admin/arena-approvals`)
- Filter requests by status (Pending, Approved, Rejected, All)
- See student details (name, email, avatar, request date)
- Approve or reject individual requests
- Bulk approve multiple students at once

#### Settings (`/admin/settings`)
- Configure approval settings
- Manage notifications
- Security preferences
- Data management options

---

## 📋 Common Tasks

### ✅ Approve a Student's Arena Access
1. Go to `/admin/arena-approvals`
2. Ensure "Pending" filter is selected
3. Find the student in the list
4. Click the green "Approve" button
5. Confirmation message appears
6. Student now has arena access

### ❌ Reject a Student's Request
1. Go to `/admin/arena-approvals`
2. Find the student
3. Click the red "Reject" button
4. Enter a reason (e.g., "Account not verified")
5. Click "Reject" to confirm
6. Student receives notification with reason

### 🎯 Bulk Approve Multiple Students
1. Go to `/admin/arena-approvals`
2. Check the boxes next to students you want to approve
3. A blue badge appears showing count selected
4. Click "Approve All" button
5. All selected students are approved instantly

### 🔄 Reconsider a Rejection
1. Go to `/admin/arena-approvals`
2. Change filter to "Rejected"
3. Find the student
4. Click the blue "Reconsider" button
5. Student status changes back to "approved"

### 📊 View Statistics
1. Go to `/admin` (Dashboard)
2. See 4 cards:
   - **Total Requests**: All requests ever made
   - **Pending**: Awaiting your decision
   - **Approved**: Students with access
   - **Rejected**: Students without access

### 🔍 Search & Filter
1. Click filter buttons at the top:
   - **Pending**: Only review requests
   - **Approved**: See approved students
   - **Rejected**: See denied students
   - **All**: View everything

---

## 🛠️ Technical Details

### Authentication
- Admin status determined by `role: 'admin'` in User model
- Session stored in `localStorage.aura_session`
- Auto logout available in sidebar

### Data Persistence
- Changes saved to MongoDB immediately
- No "Save" button needed
- Undo available only via "Reconsider" for rejections

### API Used
- All requests include session header: `x-session-user`
- Endpoints: GET (list), POST (single action), PUT (bulk)
- Full documentation in [ARENA_ADMIN_IMPLEMENTATION.md](ARENA_ADMIN_IMPLEMENTATION.md)

---

## ⚙️ Admin Settings

### Arena Settings
- **Auto-Approve Verified**: Automatically approve verified users (future feature)
- **Default Rejection Reason**: Pre-filled rejection message

### Notifications
- **New Requests**: Get alerted about new approval requests
- **Bulk Actions**: Notification after bulk operations

### Security
- **Session Timeout**: Auto-logout after inactivity
- **2FA**: Optional two-factor authentication

### Data Management
- **Export Logs**: Download approval history
- **Clear Cache**: Reset performance cache

---

## 🎨 UI/UX Features

### Dark Mode Support
- System respects OS dark mode preference
- Toggle available in settings

### Mobile Responsive
- Fully responsive design
- Works on phone, tablet, desktop
- Collapsible sidebar on mobile

### Animations
- Smooth transitions between pages
- Loading spinners for async operations
- Success/error message toasts

### Accessibility
- Keyboard navigation supported
- Clear visual feedback
- High contrast colors

---

## 🐛 Troubleshooting

### "Unauthorized" Error
**Problem**: See 401 error when accessing `/admin`

**Solution**:
1. Verify user role in database: `db.users.findOne({email: "your@email.com"})`
2. Check role should be: `"role": "admin"`
3. Clear browser cache and try again
4. Restart browser if needed

### Page Not Loading
**Problem**: Dashboard/approvals page stays blank

**Solution**:
1. Check browser console (F12 > Console tab)
2. Look for network errors (F12 > Network tab)
3. Verify MongoDB is connected
4. Check `x-session-user` header is being sent

### Approvals Not Updating
**Problem**: Changes don't show immediately

**Solution**:
1. Refresh page manually
2. Check network tab for failed requests
3. Verify session is still valid
4. Check server logs for errors

### Can't Access /admin
**Problem**: Redirected to home page

**Solution**:
1. Login first if not already logged in
2. Verify your user has `role: 'admin'`
3. Check localStorage: `localStorage.getItem('aura_session')`
4. Session should contain: `"role": "admin"`

---

## 📚 Additional Resources

- [Full Implementation Documentation](ARENA_ADMIN_IMPLEMENTATION.md)
- [Arena Approval System Documentation](ARENA_APPROVAL_SYSTEM.md)
- [User Model Documentation](models/User.ts)
- [API Route Code](app/api/admin/arena-approvals/route.ts)

---

## 💡 Tips & Tricks

1. **Keyboard Shortcuts**
   - Use Tab to navigate between buttons
   - Enter to select/activate
   - Space to toggle checkboxes

2. **Batch Processing**
   - Approve multiple students at once for efficiency
   - Use bulk operations for large batches

3. **Filtering**
   - Always start with "Pending" to see what needs review
   - Use "All" to find specific students

4. **Status Tracking**
   - Check dashboard statistics regularly
   - Monitor approval rates

5. **Best Practices**
   - Always provide rejection reasons
   - Review pending requests daily
   - Keep session active to maintain access

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review [ARENA_ADMIN_IMPLEMENTATION.md](ARENA_ADMIN_IMPLEMENTATION.md)
3. Check browser console for errors (F12)
4. Review server logs

---

**Last Updated**: 2026-06-07
**Version**: 1.0
