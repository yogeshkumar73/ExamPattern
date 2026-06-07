'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Lock, Database, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure admin panel settings and preferences
        </p>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Arena Approval Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertCircle className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Arena Approval Settings
            </h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Auto-Approve Verified Users
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Automatically approve arena access for verified users
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" defaultChecked={false} />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable auto-approval</span>
              </label>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Default Rejection Reason
              </p>
              <input
                type="text"
                placeholder="Enter default rejection reason..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Bell className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notification Settings
            </h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold">New Approval Requests</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of new arena approval requests</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" defaultChecked={true} />
              </label>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold">Bulk Actions</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when bulk approvals are performed</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" defaultChecked={true} />
              </label>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Lock className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Security Settings
            </h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Session Timeout</p>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>Never</option>
              </select>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Require 2FA for admin access</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" defaultChecked={false} />
              </label>
            </div>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Database className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Data Management
            </h2>
          </div>
          <div className="space-y-4">
            <button className="w-full px-4 py-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors font-semibold">
              Export Approval Logs
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold">
              Clear Cache
            </button>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4"
        >
          <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:shadow-lg transition-shadow">
            Save Changes
          </button>
          <button className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
        </motion.div>
      </div>
    </div>
  );
}
