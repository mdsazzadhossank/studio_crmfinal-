import React, { useState, useEffect } from 'react';
import { Cloud, Download, ShieldCheck, AlertTriangle, Play, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function CloudBackup() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.getBackupHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch backup history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRunBackup = async () => {
    if (!window.confirm('Are you sure you want to run a full backup? This may take a few minutes.')) {
      return;
    }
    setLoading(true);
    setNotification(null);
    try {
      const response = await api.runBackup();
      if (response.success) {
        setNotification({
          type: 'success',
          message: `Backup completed successfully! Size: ${response.backup_size}`
        });
        fetchHistory();
      } else {
        setNotification({
          type: 'error',
          message: response.error || 'Backup failed'
        });
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'An unexpected error occurred during backup'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Cloud size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <ShieldCheck className="text-emerald-400" size={32} />
            <h1 className="text-3xl font-bold">Enterprise Cloud Backup</h1>
          </div>
          <p className="text-indigo-100 max-w-2xl text-lg mb-8">
            One-click automated backup system. Secures the MySQL database, Key-Value JSON store, and all uploaded media files directly to Google Drive.
          </p>

          {notification && (
            <div className={`p-4 rounded-xl mb-6 max-w-2xl flex items-start space-x-3 ${
              notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' : 'bg-red-500/20 text-red-100 border border-red-500/30'
            }`}>
              {notification.type === 'success' ? <CheckCircle className="shrink-0" /> : <AlertTriangle className="shrink-0" />}
              <div>
                <h4 className="font-semibold">{notification.type === 'success' ? 'Backup Successful' : 'Backup Failed'}</h4>
                <p className="text-sm opacity-90">{notification.message}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button
              onClick={handleRunBackup}
              disabled={loading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                loading 
                  ? 'bg-indigo-500/50 cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  <span>Processing Backup...</span>
                </>
              ) : (
                <>
                  <Play size={20} />
                  <span>Run Full Backup Now</span>
                </>
              )}
            </button>

            <div className="flex items-center text-sm text-indigo-200">
              <AlertTriangle size={16} className="mr-2 text-amber-400" />
              Do not close this page while backup is running.
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Backup History</h2>
          <button 
            onClick={fetchHistory}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Refresh History"
          >
            <RefreshCw size={18} className={loadingHistory ? 'animate-spin' : ''} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Initiated By</th>
                <th className="px-6 py-4 font-semibold">Size</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingHistory && history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <RefreshCw className="animate-spin mx-auto mb-2 text-indigo-300" size={24} />
                    Loading history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No backups found in the system.
                  </td>
                </tr>
              ) : (
                history.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {log.created_by_name || 'System'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {log.backup_size || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {log.backup_status === 'success' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle size={12} className="mr-1" /> Success
                        </span>
                      ) : log.backup_status === 'failed' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" title={log.error_message}>
                          <XCircle size={12} className="mr-1" /> Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <RefreshCw size={12} className="mr-1 animate-spin" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.google_drive_url && log.backup_status === 'success' ? (
                        <a 
                          href={log.google_drive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download size={16} className="mr-1.5" />
                          Drive Link
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
