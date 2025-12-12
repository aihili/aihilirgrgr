import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Machine, PermissionDetail } from '../types';
import { ShieldCheck, Shield, HardDrive, Lock, Check, X, ArrowRightLeft, UserCircle2, Server, Trash2 } from 'lucide-react';

export const PermissionsManagement: React.FC = () => {
  // Data Lists
  const [users, setUsers] = useState<User[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [permissions, setPermissions] = useState<PermissionDetail[]>([]);
  
  // Selection State for Granting
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uData, mData, pData] = await Promise.all([
        api.getUsers(),
        api.getMachines(),
        api.getAllPermissions()
      ]);
      setUsers(uData);
      setMachines(mData);
      setPermissions(pData);
    } catch (err) {
      console.error("Failed to load permission data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Actions ---

  const handleGrant = async () => {
    if (!selectedUser || !selectedMachine) return;
    
    // Check if exists locally to prevent useless API call (optional, but good UX)
    const exists = permissions.some(p => p.user_id === selectedUser && p.machine_id === selectedMachine);
    if (exists) {
      setFeedback({ type: 'error', msg: 'This user already has access to this machine.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await api.grantPermission({ user_id: selectedUser, machine_id: selectedMachine });
      setFeedback({ type: 'success', msg: 'Permission granted successfully.' });
      
      // Refresh only permissions list to update UI
      const pData = await api.getAllPermissions();
      setPermissions(pData);
      
      // Optional: Clear selection
      // setSelectedMachine(null); 
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Failed to grant permission.' });
    } finally {
      setIsSubmitting(false);
      // Clear feedback after 3s
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleRevoke = async (userId: number, machineId: number) => {
    if (!window.confirm("Are you sure you want to revoke this access?")) return;
    
    try {
      await api.revokePermission({ user_id: userId, machine_id: machineId });
      // Update local state immediately for snappy feel, then fetch real data
      setPermissions(prev => prev.filter(p => !(p.user_id === userId && p.machine_id === machineId)));
      
      // Background sync
      const pData = await api.getAllPermissions();
      setPermissions(pData);
    } catch (err) {
      alert("Failed to revoke permission.");
    }
  };

  // --- Render Helpers ---

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h3 className="text-xl font-bold text-slate-800">Access Control</h3>
        <p className="text-slate-500 text-sm mt-1">Bind users to specific machinery. Changes apply immediately.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        
        {/* LEFT PANEL: Grant Interface */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className="font-bold text-slate-700 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600" />
              New Assignment
            </h4>
            {feedback && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full animate-fade-in ${feedback.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {feedback.msg}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 overflow-hidden">
            
            {/* User List */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                Step 1: Select User
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u.id)}
                    className={`w-full flex items-center p-3 rounded-xl transition-all text-left group ${
                      selectedUser === u.id 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold text-xs ${selectedUser === u.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{u.username}</div>
                      <div className={`text-[10px] ${selectedUser === u.id ? 'text-indigo-200' : 'text-slate-400'}`}>ID: {u.id} • {u.role}</div>
                    </div>
                    {selectedUser === u.id && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Machine List */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                Step 2: Select Machine
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {machines.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMachine(m.id)}
                    className={`w-full flex items-center p-3 rounded-xl transition-all text-left group ${
                      selectedMachine === m.id 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${selectedMachine === m.id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                      <HardDrive size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm truncate">{m.name}</div>
                      <div className={`text-[10px] ${selectedMachine === m.id ? 'text-indigo-200' : 'text-slate-400'}`}>ID: {m.id}</div>
                    </div>
                    {selectedMachine === m.id && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action Bar */}
          <div className="p-4 border-t border-slate-100 bg-white z-10">
            <button
              onClick={handleGrant}
              disabled={!selectedUser || !selectedMachine || isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                 <ArrowRightLeft className="animate-spin" size={18} />
              ) : (
                 <Lock size={18} />
              )}
              {isSubmitting ? 'Processing...' : 'Authorize Connection'}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Active Rules */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className="font-bold text-slate-700 flex items-center gap-2">
              <Server size={18} className="text-emerald-600" />
              Active Rules
            </h4>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-md font-mono font-bold">
              {permissions.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {permissions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <Shield size={48} strokeWidth={1} className="mb-2" />
                <span className="text-sm font-medium">No active permissions found</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 text-[10px] text-slate-500 uppercase font-bold tracking-wider shadow-sm">
                  <tr>
                    <th className="px-5 py-3 border-b border-slate-100">User</th>
                    <th className="px-5 py-3 border-b border-slate-100">Access To Machine</th>
                    <th className="px-5 py-3 border-b border-slate-100 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {permissions.map((p, idx) => (
                    <tr key={`${p.user_id}-${p.machine_id}-${idx}`} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                            <UserCircle2 size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700">{p.username}</div>
                            <div className="text-[10px] text-slate-400">User ID: {p.user_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <ArrowRightLeft size={14} className="text-slate-300" />
                          <div className="py-1 px-3 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium flex items-center gap-2">
                            <HardDrive size={14} />
                            {p.machine_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button 
                          onClick={() => handleRevoke(p.user_id, p.machine_id)}
                          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Revoke Permission"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
