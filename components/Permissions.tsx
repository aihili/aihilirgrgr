import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Machine, PermissionDetail } from '../types';
import { ShieldCheck, ShieldAlert, User as UserIcon, HardDrive, Lock, CheckCircle2, X, Link as LinkIcon, AlertCircle } from 'lucide-react';

export const PermissionsManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [existingPermissions, setExistingPermissions] = useState<PermissionDetail[]>([]);
  
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const [usersData, machinesData, permissionsData] = await Promise.all([
        api.getUsers(),
        api.getMachines(),
        api.getAllPermissions(),
      ]);
      setUsers(usersData);
      setMachines(machinesData);
      setExistingPermissions(permissionsData);
    } catch (err) {
      console.error("Failed to load data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGrant = async () => {
    if (!selectedUser || !selectedMachine) return;
    try {
      await api.grantPermission({
        user_id: selectedUser,
        machine_id: selectedMachine,
      });
      setMessage({ type: 'success', text: 'Permission successfully GRANTED.' });
      setTimeout(() => setMessage(null), 3000);
      fetchData(); // Refresh list
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to grant permission.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRevoke = async () => {
    if (!selectedUser || !selectedMachine) return;
    try {
      await api.revokePermission({
        user_id: selectedUser,
        machine_id: selectedMachine,
      });
      setMessage({ type: 'success', text: 'Permission successfully REVOKED.' });
      setTimeout(() => setMessage(null), 3000);
      fetchData(); // Refresh list
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to revoke permission.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };
  
  const handleQuickRevoke = async (userId: number, machineId: number) => {
    if (window.confirm("Are you sure you want to revoke this access?")) {
        try {
            await api.revokePermission({
              user_id: userId,
              machine_id: machineId,
            });
            fetchData();
        } catch(err) {
            alert("Failed to revoke");
        }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h3 className="text-xl font-bold text-slate-800">Access Control</h3>
        <p className="text-slate-500 text-sm mt-1">Configure user permissions for specific machines.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Grant/Revoke Controls */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
               <h4 className="font-bold text-slate-700 flex items-center gap-2">
                 <ShieldCheck size={18} className="text-indigo-600" />
                 Assign Permissions
               </h4>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                  <div className={`p-1.5 rounded-full ${message.type === 'success' ? 'bg-emerald-200' : 'bg-red-200'}`}>
                    {message.type === 'success' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                  </div>
                  <span className="font-medium text-sm">{message.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 md:gap-6 items-stretch flex-1">
                
                {/* User Column */}
                <div className="flex flex-col h-full">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    <UserIcon size={14} />
                    <span>Select User</span>
                  </label>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 flex-1 min-h-[250px] flex flex-col">
                    <div className="overflow-y-auto max-h-[300px] space-y-1 pr-1 custom-scrollbar">
                      {users.length === 0 ? (
                         <div className="h-full flex items-center justify-center text-slate-400 text-sm p-4">No users available</div>
                      ) : (
                        users.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => setSelectedUser(u.id)}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex justify-between items-center group ${
                              selectedUser === u.id
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500'
                                : 'hover:bg-white hover:shadow-sm text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-100'
                            }`}
                          >
                            <div>
                              <div className="font-semibold text-sm">{u.username}</div>
                              <div className={`text-[10px] uppercase tracking-wider font-medium ${selectedUser === u.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                {u.role}
                              </div>
                            </div>
                            {selectedUser === u.id && <CheckCircle2 size={16} className="text-white" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Connector */}
                <div className="flex md:flex-col items-center justify-center gap-2 text-slate-300 py-2 md:py-0">
                   <div className="hidden md:block h-full w-[1px] bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
                   <div className="p-2 rounded-full bg-slate-100 text-slate-400 border border-slate-200 shadow-sm z-10">
                      <LinkIcon size={16} />
                   </div>
                   <div className="hidden md:block h-full w-[1px] bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
                </div>

                {/* Machine Column */}
                <div className="flex flex-col h-full">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    <HardDrive size={14} />
                    <span>Select Machine</span>
                  </label>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 flex-1 min-h-[250px] flex flex-col">
                     <div className="overflow-y-auto max-h-[300px] space-y-1 pr-1 custom-scrollbar">
                      {machines.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm p-4">No machines available</div>
                      ) : (
                        machines.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedMachine(m.id)}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex justify-between items-center group ${
                              selectedMachine === m.id
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500'
                                : 'hover:bg-white hover:shadow-sm text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-100'
                            }`}
                          >
                            <div>
                              <div className="font-semibold text-sm">{m.name}</div>
                              <div className={`text-[10px] uppercase tracking-wider font-medium ${selectedMachine === m.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                ID: {m.id}
                              </div>
                            </div>
                            {selectedMachine === m.id && <CheckCircle2 size={16} className="text-white" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3 pt-6 border-t border-slate-100">
                <button
                  onClick={handleGrant}
                  disabled={!selectedUser || !selectedMachine}
                  className="flex-1 py-3 px-6 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={18} />
                  Grant Access
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={!selectedUser || !selectedMachine}
                  className="flex-1 py-3 px-6 bg-white text-slate-700 border border-slate-200 font-bold text-sm rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={18} />
                  Revoke
                </button>
              </div>
            </div>
        </div>

        {/* Right Panel: Existing Permissions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full max-h-[600px] lg:max-h-auto">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <h4 className="font-bold text-slate-700 flex items-center gap-2">
                 <Lock size={16} className="text-slate-500" />
                 Active Access Rules
               </h4>
               <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                 {existingPermissions.length} Active
               </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
                {existingPermissions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm p-8 text-center">
                        <AlertCircle size={32} className="mb-2 opacity-20" />
                        <p>No active permissions found.</p>
                        <p className="text-xs mt-1">Assign users to machines to see them here.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-4 py-3 border-b border-slate-100">User</th>
                                <th className="px-4 py-3 border-b border-slate-100">Has Access To</th>
                                <th className="px-4 py-3 border-b border-slate-100 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {existingPermissions.map((perm, idx) => (
                                <tr key={`${perm.user_id}-${perm.machine_id}-${idx}`} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-100">
                                                {perm.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{perm.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <HardDrive size={12} className="text-slate-400" />
                                            <span className="text-sm text-slate-600">{perm.machine_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => handleQuickRevoke(perm.user_id, perm.machine_id)}
                                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" 
                                            title="Revoke Access"
                                        >
                                            <X size={14} />
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