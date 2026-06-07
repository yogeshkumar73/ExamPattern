'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ApprovalRequest {
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

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminArenaApprovals() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>(
    'pending'
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
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
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
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch arena approvals');
      }

      const data = await response.json();
      setApprovals(data.data);
      setPagination(data.pagination);
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

  // Handle approve
  const handleApprove = async (userId: string) => {
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
          action: 'approve',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve arena access');
      }

      setSuccessMessage('Arena access approved successfully');
      setSelectedUsers([]);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchApprovals(pagination.page);
    } catch (error: any) {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle reject
  const handleReject = async (userId: string) => {
    if (!rejectReason.trim()) {
      setErrorMessage('Please provide a reason for rejection');
      return;
    }

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
          action: 'reject',
          reason: rejectReason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject arena access');
      }

      setSuccessMessage('Arena access rejected successfully');
      setRejectingUserId(null);
      setRejectReason('');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchApprovals(pagination.page);
    } catch (error: any) {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) {
      setErrorMessage('Please select users to approve');
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
          action: 'approve',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve users');
      }

      const data = await response.json();
      setSuccessMessage(`Approved ${data.modifiedCount} users`);
      setSelectedUsers([]);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchApprovals(pagination.page);
    } catch (error: any) {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Select/deselect all
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
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
            Arena Access Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage student access to the battle arena
          </p>
        </motion.div>

        {/* Messages */}
        {successMessage && (
          <motion.div
            className="mb-4 p-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✓ {successMessage}
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            className="mb-4 p-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-lg"
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
          {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} (
              {filterStatus === status ? pagination.total : '?'})
            </button>
          ))}

          {selectedUsers.length > 0 && (
            <div className="ml-auto flex gap-2">
              <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-semibold">
                {selectedUsers.length} selected
              </span>
              <motion.button
                onClick={handleBulkApprove}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full disabled:opacity-50 transition-all"
              >
                Approve All
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Table */}
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading approvals...</p>
            </div>
          ) : approvals.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No {filterStatus === 'all' ? 'approval requests' : filterStatus + ' requests'} found
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
                  Select All
                </span>
              </div>

              {/* Rows */}
              {approvals.map((approval, index) => (
                <motion.div
                  key={approval._id}
                  className="border-b border-gray-200 dark:border-gray-800 p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(approval._id)}
                    onChange={() => toggleUserSelection(approval._id)}
                    className="w-5 h-5 rounded cursor-pointer"
                  />

                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1">
                    {approval.photoUrl && (
                      <img
                        src={approval.photoUrl}
                        alt={approval.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{approval.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{approval.email}</p>
                    </div>
                  </div>

                  {/* Requested Date */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-semibold">Requested</p>
                    <p>{new Date(approval.arenaAccessRequestedAt).toLocaleDateString()}</p>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(approval.arenaApprovalStatus)}`}>
                    {approval.arenaApprovalStatus.charAt(0).toUpperCase() +
                      approval.arenaApprovalStatus.slice(1)}
                  </span>

                  {/* Rejection Reason (if any) */}
                  {approval.arenaApprovalReason && (
                    <div className="md:col-span-2 text-sm">
                      <p className="font-semibold text-gray-700 dark:text-gray-300">Reason:</p>
                      <p className="text-gray-600 dark:text-gray-400">{approval.arenaApprovalReason}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {approval.arenaApprovalStatus === 'pending' && (
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleApprove(approval._id)}
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg disabled:opacity-50 transition-all"
                      >
                        Approve
                      </motion.button>

                      {rejectingUserId === approval._id ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                          />
                          <button
                            onClick={() => handleReject(approval._id)}
                            disabled={loading || !rejectReason.trim()}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg disabled:opacity-50 transition-all"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setRejectingUserId(null);
                              setRejectReason('');
                            }}
                            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <motion.button
                          onClick={() => setRejectingUserId(approval._id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
                        >
                          Reject
                        </motion.button>
                      )}
                    </div>
                  )}

                  {approval.arenaApprovalStatus === 'rejected' && (
                    <motion.button
                      onClick={() => handleApprove(approval._id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all"
                    >
                      Reconsider
                    </motion.button>
                  )}
                </motion.div>
              ))}
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
