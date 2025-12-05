'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Backup {
  key: string;
  size: number;
  lastModified: string;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/backup/list');
      const data = await response.json();
      if (data.success) {
        setBackups(data.backups);
      }
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    setMessage('Creating backup... This may take a few minutes.');
    setMessageType('');

    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setMessage('✅ Backup created successfully!');
        setMessageType('success');
        await loadBackups(); // Refresh the list
      } else {
        setMessage(`❌ Backup failed: ${data.error || data.message}`);
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage(`❌ Backup failed: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupKey: string) => {
    if (!confirm(`⚠️ WARNING: This will restore the database from:\n\n${backupKey}\n\nAll current data will be replaced!\n\nAre you sure?`)) {
      return;
    }

    setLoading(true);
    setMessage('Restoring backup... This may take a few minutes.');
    setMessageType('');

    try {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupFile: backupKey }),
      });
      const data = await response.json();

      if (data.success) {
        setMessage('✅ Restore completed successfully!');
        setMessageType('success');
      } else {
        setMessage(`❌ Restore failed: ${data.error || data.message}`);
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage(`❌ Restore failed: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Database Backup & Restore</h1>
          <Link
            href="/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Create Backup Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Backup</h2>
          <p className="text-gray-600 mb-4">
            Create a backup of your PostgreSQL database and upload it to DigitalOcean Spaces.
          </p>
          <button
            onClick={handleBackup}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? '⏳ Creating Backup...' : '💾 Create Backup Now'}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-4 rounded-lg mb-8 ${
              messageType === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : messageType === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* Backups List */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Available Backups</h2>
            <button
              onClick={loadBackups}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              🔄 Refresh
            </button>
          </div>

          {backups.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No backups found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Backup File
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {backups.map((backup) => (
                    <tr key={backup.key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {backup.key.replace('backups/', '')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(backup.lastModified)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatSize(backup.size)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleRestore(backup.key)}
                          disabled={loading}
                          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                        >
                          ↺ Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Backups are stored in DigitalOcean Spaces (cloudproject bucket)</li>
            <li>• Backup files are compressed and use PostgreSQL custom format</li>
            <li>• Restore will overwrite all current database data</li>
            <li>• Always create a backup before restoring</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
