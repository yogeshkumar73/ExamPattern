'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ArenaStatus {
  userId: string;
  name: string;
  email: string;
  arenaApprovalStatus: 'pending' | 'approved' | 'rejected';
  arenaApprovalReason: string;
  arenaApprovedAt: string | null;
  arenaRejectedAt: string | null;
  arenaAccessRequestedAt: string;
  isApproved: boolean;
  isRejected: boolean;
  isPending: boolean;
}

interface StudentArenaStatusProps {
  userId: string;
  onApprovalStatusChange?: (status: ArenaStatus) => void;
}

export default function StudentArenaStatus({ userId, onApprovalStatusChange }: StudentArenaStatusProps) {
  const [status, setStatus] = useState<ArenaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/arena-status?userId=${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch arena status');
        }

        const data = await response.json();
        setStatus(data.data);
        onApprovalStatusChange?.(data.data);
      } catch (error: any) {
        console.error('Status check error:', error);
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStatus();
      // Refresh every 30 seconds
      const interval = setInterval(fetchStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, onApprovalStatusChange]);

  // Handle request
  const handleRequestAccess = async () => {
    try {
      setRequesting(true);
      const response = await fetch('/api/user/arena-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'request',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      const data = await response.json();
      setMessage(data.message);
      setStatus((prev) => prev ? { ...prev, arenaApprovalStatus: 'pending', isPending: true } : null);
      setTimeout(() => setMessage(''), 4000);
    } catch (error: any) {
      setMessage(error.message);
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-lg">
        Unable to load arena status
      </div>
    );
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Approved Status */}
      {status.isApproved && (
        <motion.div
          className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700 rounded-xl"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">✓</div>
            <div>
              <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                🎉 Arena Access Approved!
              </h3>
              <p className="text-green-700 dark:text-green-300 mt-1">
                You have full access to the battle arena. Start competing now!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Approved on {new Date(status.arenaApprovedAt!).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pending Status */}
      {status.isPending && (
        <motion.div
          className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl animate-bounce">⏳</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                ⏳ Request Pending Admin Review
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                Your arena access request is being reviewed by administrators. Please wait for approval.
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                Requested on {new Date(status.arenaAccessRequestedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="mt-4 w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
            <motion.div
              className="bg-yellow-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </motion.div>
      )}

      {/* Rejected Status */}
      {status.isRejected && (
        <motion.div
          className="p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-2 border-red-300 dark:border-red-700 rounded-xl"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">✗</div>
            <div>
              <h3 className="text-xl font-bold text-red-800 dark:text-red-200">
                ❌ Arena Access Denied
              </h3>
              <p className="text-red-700 dark:text-red-300 mt-1">
                Your arena access request was not approved by administrators.
              </p>
            </div>
          </div>

          {status.arenaApprovalReason && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 rounded-lg border border-red-200 dark:border-red-700">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                Reason for Rejection:
              </p>
              <p className="text-red-700 dark:text-red-300">{status.arenaApprovalReason}</p>
            </div>
          )}

          <motion.button
            onClick={handleRequestAccess}
            disabled={requesting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg disabled:opacity-50 transition-all"
          >
            {requesting ? 'Submitting...' : 'Request Again'}
          </motion.button>

          <p className="text-xs text-red-600 dark:text-red-400 mt-3">
            You can request arena access again. Make sure to follow all community guidelines.
          </p>
        </motion.div>
      )}

      {/* Initial Request State */}
      {!status.isApproved && !status.isPending && !status.isRejected && (
        <motion.div
          className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-xl"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">❓</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">
                🎮 Join the Battle Arena
              </h3>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                Request access to compete with other students. Our admins will review your request shortly.
              </p>
            </div>
          </div>

          <motion.button
            onClick={handleRequestAccess}
            disabled={requesting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg disabled:opacity-50 transition-all"
          >
            {requesting ? 'Submitting Request...' : 'Request Arena Access'}
          </motion.button>
        </motion.div>
      )}

      {/* Message */}
      {message && (
        <motion.div
          className="mt-4 p-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-lg border border-blue-300 dark:border-blue-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ℹ️ {message}
        </motion.div>
      )}
    </motion.div>
  );
}
