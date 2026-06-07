'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('aura_session') || '{}');
        
        // Fetch pending count
        const pendingRes = await fetch(
          `/api/admin/arena-approvals?status=pending&limit=1`,
          {
            headers: {
              'x-session-user': encodeURIComponent(JSON.stringify(user)),
            },
          }
        );
        const pendingData = await pendingRes.json();

        // Fetch approved count
        const approvedRes = await fetch(
          `/api/admin/arena-approvals?status=approved&limit=1`,
          {
            headers: {
              'x-session-user': encodeURIComponent(JSON.stringify(user)),
            },
          }
        );
        const approvedData = await approvedRes.json();

        // Fetch rejected count
        const rejectedRes = await fetch(
          `/api/admin/arena-approvals?status=rejected&limit=1`,
          {
            headers: {
              'x-session-user': encodeURIComponent(JSON.stringify(user)),
            },
          }
        );
        const rejectedData = await rejectedRes.json();

        setStats({
          pending: pendingData.pagination?.total || 0,
          approved: approvedData.pagination?.total || 0,
          rejected: rejectedData.pagination?.total || 0,
          total: (pendingData.pagination?.total || 0) + (approvedData.pagination?.total || 0) + (rejectedData.pagination?.total || 0),
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total Requests',
      value: stats.total,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and monitor arena access approvals
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {loading ? '...' : card.value}
                  </p>
                </div>
                <div className={`${card.bgColor} p-4 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-transparent bg-gradient-to-r ${card.color} bg-clip-text`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="text-orange-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/arena-approvals?status=pending"
            className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
          >
            <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-1">
              Review Pending Requests
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              {stats.pending} requests awaiting review
            </p>
          </a>

          <a
            href="/admin/arena-approvals?status=all"
            className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1">
              View All Approvals
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Manage all arena access requests
            </p>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
