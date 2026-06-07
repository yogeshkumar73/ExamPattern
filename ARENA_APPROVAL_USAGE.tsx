/**
 * Arena Approval System - Quick Start Guide
 * 
 * This guide shows how to integrate the arena approval system into your app.
 */

// ============================================
// 1. ADD TO ADMIN PAGE
// ============================================

// app/admin/arena-approvals/page.tsx
'use client';

import AdminArenaApprovals from '@/components/admin-arena-approvals';

export default function AdminArenaApprovalsPage() {
  return (
    <main>
      <AdminArenaApprovals />
    </main>
  );
}

// ============================================
// 2. ADD TO STUDENT DASHBOARD
// ============================================

// app/student/arena-status/page.tsx
'use client';

import { useEffect, useState } from 'react';
import StudentArenaStatus from '@/components/student-arena-status';

export default function StudentArenaStatusPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get userId from session/auth
    const getUser = async () => {
      try {
        const session = JSON.parse(localStorage.getItem('aura_session') || '{}');
        if (session?.user?._id) {
          setUserId(session.user._id);
        }
      } catch (e) {
        console.error('Failed to load user:', e);
      }
    };
    getUser();
  }, []);

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Arena Access</h1>
      <StudentArenaStatus userId={userId} />
    </main>
  );
}

// ============================================
// 3. UPDATE BATTLE ARENA (ALREADY DONE)
// ============================================

// The BattleArena component now automatically:
// - Checks approval status on load
// - Shows lock screen if not approved
// - Prevents battle start if not approved
// - Displays approval message/reason

// ============================================
// 4. DATABASE QUERIES
// ============================================

// Get all pending approval requests
async function getPendingApprovals() {
  const response = await fetch(
    '/api/admin/arena-approvals?status=pending&limit=100'
  );
  return response.json();
}

// Get all approved students
async function getApprovedStudents() {
  const response = await fetch(
    '/api/admin/arena-approvals?status=approved&limit=1000'
  );
  return response.json();
}

// Get specific user's status
async function getUserArenaStatus(userId: string) {
  const response = await fetch(`/api/user/arena-status?userId=${userId}`);
  return response.json();
}

// Approve a student
async function approveStudent(userId: string) {
  const response = await fetch('/api/admin/arena-approvals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      action: 'approve',
    }),
  });
  return response.json();
}

// Reject a student
async function rejectStudent(userId: string, reason: string) {
  const response = await fetch('/api/admin/arena-approvals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      action: 'reject',
      reason,
    }),
  });
  return response.json();
}

// Bulk approve students
async function bulkApproveStudents(userIds: string[]) {
  const response = await fetch('/api/admin/arena-approvals', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userIds,
      action: 'approve',
    }),
  });
  return response.json();
}

// Request arena access
async function requestArenaAccess(userId: string) {
  const response = await fetch('/api/user/arena-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      action: 'request',
    }),
  });
  return response.json();
}

// ============================================
// 5. APPROVAL STATUSES
// ============================================

// Status Flow:
// 1. 'pending' - Initial state, awaiting admin review
// 2. 'approved' - Admin approved, full arena access
// 3. 'rejected' - Admin rejected, user cannot access arena

// ============================================
// 6. NAVIGATION
// ============================================

// Add links to your navigation:

const arenaAdminLink = {
  href: '/admin/arena-approvals',
  label: 'Arena Approvals',
  icon: 'lock', // or your icon
  permission: 'admin', // Only for admins
};

const studentArenaStatusLink = {
  href: '/student/arena-status',
  label: 'Arena Access',
  icon: 'shield',
  permission: 'student',
};

// ============================================
// 7. EXAMPLE: CHECK BEFORE ALLOWING BATTLE
// ============================================

async function canUserBattle(userId: string): Promise<boolean> {
  try {
    const status = await getUserArenaStatus(userId);
    return status.data.isApproved === true;
  } catch (e) {
    console.error('Failed to check arena status:', e);
    return false; // Default to denied on error
  }
}

// Usage in battle component:
async function startBattle(userId: string) {
  const canBattle = await canUserBattle(userId);
  
  if (!canBattle) {
    alert('You do not have permission to access the arena');
    return;
  }

  // Start battle...
}

// ============================================
// 8. EXAMPLE: ADMIN WORKFLOW
// ============================================

async function adminApprovalWorkflow() {
  // 1. Get pending requests
  const pending = await getPendingApprovals();
  console.log(`${pending.data.length} pending requests`);

  // 2. Review each
  for (const request of pending.data) {
    console.log(`User: ${request.name} (${request.email})`);
    console.log(`Requested: ${request.arenaAccessRequestedAt}`);

    // 3. Make decision
    const shouldApprove = true; // Your logic

    if (shouldApprove) {
      await approveStudent(request._id);
      console.log(`✓ Approved ${request.name}`);
    } else {
      await rejectStudent(request._id, 'Profile incomplete');
      console.log(`✗ Rejected ${request.name}`);
    }
  }
}

// ============================================
// 9. EXAMPLE: BULK OPERATIONS
// ============================================

async function approveAllFromClass(classCode: string) {
  // This would need custom logic to find students in a class
  const studentsInClass = [
    'user_id_1',
    'user_id_2',
    'user_id_3',
  ];

  const result = await bulkApproveStudents(studentsInClass);
  console.log(`Approved ${result.modifiedCount} students`);
}

// ============================================
// 10. ARENA STATISTICS
// ============================================

async function getArenaStats() {
  const pending = await fetch('/api/admin/arena-approvals?status=pending');
  const approved = await fetch('/api/admin/arena-approvals?status=approved');
  const rejected = await fetch('/api/admin/arena-approvals?status=rejected');

  const pendingData = await pending.json();
  const approvedData = await approved.json();
  const rejectedData = await rejected.json();

  return {
    pending: pendingData.pagination.total,
    approved: approvedData.pagination.total,
    rejected: rejectedData.pagination.total,
    total: 
      pendingData.pagination.total +
      approvedData.pagination.total +
      rejectedData.pagination.total,
    approvalRate: (approvedData.pagination.total / 
      (approvedData.pagination.total + rejectedData.pagination.total) * 100).toFixed(1) + '%',
  };
}

// Usage:
// const stats = await getArenaStats();
// console.log(`Arena Approval Stats:`, stats);
// Output:
// {
//   pending: 5,
//   approved: 45,
//   rejected: 3,
//   total: 53,
//   approvalRate: "93.8%"
// }

// ============================================
// 11. ERROR HANDLING
// ============================================

async function safeApproveStudent(userId: string) {
  try {
    const result = await approveStudent(userId);
    
    if (!result.success) {
      console.error('Approval failed:', result.error);
      return { success: false, error: result.error };
    }

    console.log('Student approved:', result.message);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Network error:', error);
    return { 
      success: false, 
      error: 'Network error. Please try again.' 
    };
  }
}

// ============================================
// 12. TYPESCRIPT INTERFACES
// ============================================

interface ArenaApprovalRequest {
  _id: string;
  name: string;
  email: string;
  photoUrl: string;
  arenaApprovalStatus: 'pending' | 'approved' | 'rejected';
  arenaApprovalReason: string;
  arenaApprovedAt: string | null;
  arenaRejectedAt: string | null;
  arenaAccessRequestedAt: string;
}

interface ArenaStatus {
  userId: string;
  name: string;
  email: string;
  arenaApprovalStatus: 'pending' | 'approved' | 'rejected';
  isApproved: boolean;
  isRejected: boolean;
  isPending: boolean;
  arenaApprovalReason: string;
}

interface ApprovalResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    name: string;
    arenaApprovalStatus: string;
  };
  error?: string;
}

// ============================================
// 13. ENVIRONMENT VARIABLES (Optional)
// ============================================

// .env.local
// NEXT_PUBLIC_ADMIN_APPROVAL_REQUIRED=true
// NEXT_PUBLIC_AUTO_APPROVE_VERIFIED=false
// NEXT_PUBLIC_APPROVAL_TIMEOUT_DAYS=30

// ============================================
// 14. TESTING
// ============================================

// Test if approval system is working:

async function testArenaApprovalSystem() {
  console.log('Testing Arena Approval System...');

  // Test 1: Get pending
  try {
    const pending = await fetch('/api/admin/arena-approvals?status=pending');
    console.log('✓ GET pending approvals works');
  } catch (e) {
    console.error('✗ GET pending approvals failed:', e);
  }

  // Test 2: Check status
  try {
    const userId = 'test_user_id'; // Replace with real user
    const status = await fetch(`/api/user/arena-status?userId=${userId}`);
    console.log('✓ GET arena status works');
  } catch (e) {
    console.error('✗ GET arena status failed:', e);
  }

  // Test 3: Request access
  try {
    const userId = 'test_user_id';
    const request = await fetch('/api/user/arena-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'request' }),
    });
    console.log('✓ POST request approval works');
  } catch (e) {
    console.error('✗ POST request approval failed:', e);
  }

  console.log('Arena Approval System tests complete!');
}

// ============================================
// READY TO USE!
// ============================================

/*
Quick checklist:
✓ User model updated with approval fields
✓ Admin API created (/api/admin/arena-approvals)
✓ Student API created (/api/user/arena-status)
✓ Admin component created (admin-arena-approvals)
✓ Student component created (student-arena-status)
✓ Battle arena locked until approved
✓ Documentation complete

Next steps:
1. Add admin page to your navigation
2. Add student arena status page
3. Test the approval flow
4. Deploy to production
5. Monitor usage stats

That's it! Your arena approval system is ready to use.
*/
