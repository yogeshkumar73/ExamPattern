'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ApprovalRequest {
  _id: string;
  name: string;
  email: string;
  photoUrl: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
  role?: string;
  isLabApproved?: boolean;
  arenaApprovalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  arenaApprovalReason: string;
  arenaApprovedAt: string | null;
  arenaRejectedAt: string | null;
  arenaAccessRequestedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminArenaApprovals() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'suspended' | 'all'>(
    'all'
  );
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get session user for authentication
  const getSessionUser = () => {
    try {
      const sessionData = localStorage.getItem('aura_session');
      if (!sessionData) return null;
      
      const parsed = JSON.parse(sessionData);
      const user = parsed?.user || parsed;
      
      return {
        ...user,
        role: user?.role || parsed?.role || 'admin',
        isAdmin: user?.isAdmin || parsed?.isAdmin || true,
      };
    } catch (error) {
      console.error('Failed to parse session:', error);
      return null;
    }
  };

  // Fetch approvals
  const fetchApprovals = async (page: number = 1) => {
    try {
      setLoading(true);
      setErrorMessage('');

      const user = getSessionUser();
      const response = await fetch(
        `/api/admin/arena-approvals?status=${filterStatus}&page=${page}&limit=${pagination.limit}`,
        {
          headers: {
            'x-session-user': encodeURIComponent(JSON.stringify(user)),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to fetch arena approvals');
      }

      const data = await response.json();
      setApprovals(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to fetch approvals');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchApprovals(1);
  }, [filterStatus]);

  // Generic action handler
  const handleAction = async (userId: string, action: string, reason?: string) => {
    try {
      setLoading(true);
      const user = getSessionUser();
      const response = await fetch('/api/admin/arena-approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-user': encodeURIComponent(JSON.stringify(user)),
        },
        body: JSON.stringify({
          userId,
          action,
          reason: reason || '',
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to execute ${action}`);
      }

      const data = await response.json();
      setSuccessMessage(data.message || `Action executed successfully`);
      setRejectingUserId(null);
      setRejectReason('');
      setSelectedUsers([]);
      setTimeout(() => setSuccessMessage(''), 3500);
      fetchApprovals(pagination.page);
    } catch (error: any) {
      setErrorMessage(error.message || 'Action failed');
      setTimeout(() => setErrorMessage(''), 3500);
    } finally {
      setLoading(false);
    }
  };

  // Bulk action
  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      setErrorMessage('Please select users first');
      return;
    }

    try {
      setLoading(true);
      const user = getSessionUser();
      const response = await fetch('/api/admin/arena-approvals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-session-user': encodeURIComponent(JSON.stringify(user)),
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action,
          reason: action.includes('suspend') ? 'Administrative suspension' : '',
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to bulk ${action} users`);
      }

      const data = await response.json();
      setSuccessMessage(`Updated ${data.modifiedCount} users`);
      setSelectedUsers([]);
      setTimeout(() => setSuccessMessage(''), 3500);
      fetchApprovals(pagination.page);
    } catch (error: any) {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(''), 3500);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === approvals.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(approvals.map((a) => a._id));
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-300';
      case 'suspended':
        return 'bg-rose-200 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 border border-rose-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Superuser Control: Arena & Account Security
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Control student access, suspend or reactivate accounts, and manage Battle Arena permissions.
          </p>
        </motion.div>

        {/* Messages */}
        {successMessage && (
          <motion.div
            className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 dark:bg-green-900/40 dark:text-green-200 rounded-lg font-bold"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✓ {successMessage}
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/40 dark:text-red-200 rounded-lg font-bold"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✗ {errorMessage}
          </motion.div>
        )}

        {/* Filter Tabs & Controls */}
        <motion.div
          className="mb-6 flex flex-wrap gap-3 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {(['all', 'approved', 'pending', 'suspended', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} (
              {filterStatus === status ? pagination.total : '?'})
            </button>
          ))}

          {selectedUsers.length > 0 && (
            <div className="ml-auto flex flex-wrap gap-2">
              <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-semibold">
                {selectedUsers.length} selected
              </span>
              <motion.button
                onClick={() => handleBulkAction('approve')}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full disabled:opacity-50 transition-all text-xs"
              >
                Approve Arena
              </motion.button>
              <motion.button
                onClick={() => handleBulkAction('suspend')}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full disabled:opacity-50 transition-all text-xs"
              >
                Revoke Arena
              </motion.button>
              <motion.button
                onClick={() => handleBulkAction('suspend_account')}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full disabled:opacity-50 transition-all text-xs"
              >
                Suspend Accounts
              </motion.button>
              <motion.button
                onClick={() => handleBulkAction('unsuspend_account')}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full disabled:opacity-50 transition-all text-xs"
              >
                Unsuspend Accounts
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Table */}
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-bold">Loading users and approvals...</p>
            </div>
          ) : approvals.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No {filterStatus === 'all' ? 'users' : filterStatus + ' users'} found
              </p>
            </div>
          ) : (
            <>
              {/* Header with select all */}
              <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3 bg-gray-50 dark:bg-gray-800">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === approvals.length && approvals.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Select All ({approvals.length})
                </span>
              </div>

              {/* Rows */}
              {approvals.map((approval, index) => {
                const isSuspended = approval.status === 'Suspended' || approval.arenaApprovalStatus === 'suspended';
                const isApproved = approval.arenaApprovalStatus === 'approved';

                return (
                  <motion.div
                    key={approval._id}
                    className="border-b border-gray-200 dark:border-gray-800 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(approval._id)}
                        onChange={() => toggleUserSelection(approval._id)}
                        className="w-5 h-5 rounded cursor-pointer"
                      />

                      {/* User Avatar & Info */}
                      {approval.photoUrl ? (
                        <img
                          src={approval.photoUrl}
                          alt={approval.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-600 font-bold flex items-center justify-center uppercase">
                          {approval.name?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white">{approval.name}</p>
                          {approval.role === 'admin' && (
                            <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded">ADMIN</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{approval.email}</p>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Account Status */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        approval.status === 'Suspended'
                          ? 'bg-red-600 text-white'
                          : 'bg-green-600 text-white'
                      }`}>
                        Account: {approval.status || 'Active'}
                      </span>

                      {/* Arena Approval Status */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(approval.arenaApprovalStatus)}`}>
                        Arena: {approval.arenaApprovalStatus ? approval.arenaApprovalStatus.toUpperCase() : 'APPROVED'}
                      </span>
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Approve button if not approved */}
                      {!isApproved && (
                        <motion.button
                          onClick={() => handleAction(approval._id, 'approve')}
                          disabled={loading}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-all"
                        >
                          Approve Arena
                        </motion.button>
                      )}

                      {/* Revoke / Suspend Arena button if approved */}
                      {isApproved && (
                        rejectingUserId === approval._id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Reason for revoking..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="px-2.5 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                            />
                            <button
                              onClick={() => handleAction(approval._id, 'suspend', rejectReason)}
                              disabled={loading}
                              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition-all"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => { setRejectingUserId(null); setRejectReason(''); }}
                              className="px-2.5 py-1 bg-gray-400 hover:bg-gray-500 text-white text-xs font-bold rounded-lg transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <motion.button
                            onClick={() => setRejectingUserId(approval._id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all"
                          >
                            Revoke Arena
                          </motion.button>
                        )
                      )}

                      {/* Account Suspension Power */}
                      {approval.status === 'Suspended' ? (
                        <motion.button
                          onClick={() => handleAction(approval._id, 'unsuspend_account')}
                          disabled={loading}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
                        >
                          Unsuspend Account
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => handleAction(approval._id, 'suspend_account', 'Account suspended by admin')}
                          disabled={loading}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all"
                        >
                          Suspend Account
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </motion.div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <motion.div
            className="mt-6 flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => fetchApprovals(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: pagination.pages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => fetchApprovals(i + 1)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  pagination.page === i + 1
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => fetchApprovals(Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
