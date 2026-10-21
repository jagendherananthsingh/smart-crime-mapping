import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  Search,
  Activity,
  AlertCircle,
  X,
} from 'lucide-react';
import { adminApi } from '../api/endpoints';
import { IUser, IAuditLog, UserRole } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { formatDate, formatDateTime } from '../utils/formatters';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roleConfirm, setRoleConfirm] = useState<{ userId: string; newRole: UserRole } | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, logsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getAuditLogs({ limit: 15 }),
      ]);
      setUsers(usersRes.data.users || []);
      setAuditLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error('Failed to load admin user data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (newRole === 'POLICE' || newRole === 'ADMIN') {
      setRoleConfirm({ userId, newRole });
      return;
    }
    await proceedRoleChange(userId, newRole);
  };

  const proceedRoleChange = async (userId: string, newRole: UserRole) => {

    try {
      setUpdatingId(userId);
      await adminApi.updateUserRole(userId, newRole);
      await fetchAdminData();
    } catch (err) {
      console.error('Failed to update role:', err);
    } finally {
      setUpdatingId(null);
      setRoleConfirm(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(userId);
      await adminApi.updateUserStatus(userId, !currentStatus);
      await fetchAdminData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            User Management & Role Access Control
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage academic researcher accounts, role permissions (ADMIN / POLICE / USER), and security audit logs
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAdminData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Refresh Accounts</span>
        </button>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSkeleton type="card" count={2} />
      ) : (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white">Registered Analyst Accounts ({users.length})</h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">User Name</th>
                  <th className="pb-3 px-3">Email Address</th>
                  <th className="pb-3 px-3">Assigned Role</th>
                  <th className="pb-3 px-3">Account Status</th>
                  <th className="pb-3 px-3">Joined Date</th>
                  <th className="pb-3 px-3 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const isUpdating = updatingId === u._id;

                  return (
                    <tr key={u._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/80 text-white flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono">{u.email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : u.role === 'POLICE'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                            u.isActive
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{formatDate(u.createdAt)}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            disabled={isUpdating}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id!, e.target.value as UserRole)}
                            className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition cursor-pointer"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="POLICE">POLICE</option>
                            <option value="USER">USER</option>
                          </select>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusToggle(u._id!, u.isActive)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              u.isActive
                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                            title={u.isActive ? 'Disable Account' : 'Enable Account'}
                          >
                            {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security Audit Log Stream */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          Security Audit Log Records
        </h3>
        <div className="divide-y divide-slate-800/60">
          {auditLogs.map((log) => (
            <div key={log._id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-slate-400">
                  {formatDateTime(log.createdAt)}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold text-[10px]">
                  {log.action}
                </span>
                <span className="text-slate-300">{log.resource}</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">{log.userEmail || 'System'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {roleConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setRoleConfirm(null)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Change User Role</h3>
              <p className="text-sm text-slate-300">
                Are you sure you want to make this person a{' '}
                <span className="font-bold text-white">{roleConfirm.newRole}</span>?
                They will be given the corresponding status and rights immediately.
              </p>
            </div>
            <div className="p-4 bg-slate-800/50 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                onClick={() => setRoleConfirm(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => proceedRoleChange(roleConfirm.userId, roleConfirm.newRole)}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
