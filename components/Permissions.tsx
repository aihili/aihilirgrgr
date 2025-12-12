import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Machine } from '../types';
import { ShieldCheck, ShieldAlert, User as UserIcon, HardDrive, Lock, CheckCircle2 } from 'lucide-react';

export const PermissionsManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, machinesData] = await Promise.all([
          api.getUsers(),
          api.getMachines(),
        ]);
        setUsers(usersData);
        setMachines(machinesData);
      } catch (err) {
        console.error("Failed to load initial data");
      }
    };
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
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to revoke permission.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h3 className="text-xl font-bold text-slate-800">Access Control</h3>
        <p className="text-slate-500 text-sm mt-1">Configure user permissions for specific machines.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 md:p-12">
          {message && (
            <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
              <div className={`p-1.5 rounded-full ${message.type === 'success' ? 'bg-emerald-200' : 'bg-red-200'}`}>
                {message.type === 'success' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
              </div>
              <span className="font-medium text-sm">{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-6 md:gap-8 items-stretch">
            
            {/* User Column */}
            <div className="flex flex-col h-full">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                <UserIcon size={14} />
                <span>1. Select User</span>
              </label>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 flex-1 min-h-[300px] flex flex-col">
                <div className="overflow-y-auto max-h-[400px] space-y-1 pr-1 custom-scrollbar">
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
            <div className="flex md:flex-col items-center justify-center gap-2 text-slate-300 py-4 md:py-0">
               <div className="hidden md:block h-full w-[1px] bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
               <div className="p-3 rounded-full bg-slate-100 text-slate-400 border border-slate-200 shadow-sm z-10">
                  <Lock size={20} />
               </div>
               <div className="hidden md:block h-full w-[1px] bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
            </div>

            {/* Machine Column */}
            <div className="flex flex-col h-full">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                <HardDrive size={14} />
                <span>2. Select Machine</span>
              </label>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 flex-1 min-h-[300px] flex flex-col">
                 <div className="overflow-y-auto max-h-[400px] space-y-1 pr-1 custom-scrollbar">
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
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 border-t border-slate-100 pt-8">
            <button
              onClick={handleGrant}
              disabled={!selectedUser || !selectedMachine}
              className="flex-1 sm:max-w-[200px] py-3.5 px-6 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} />
              Grant Access
            </button>
            <button
              onClick={handleRevoke}
              disabled={!selectedUser || !selectedMachine}
              className="flex-1 sm:max-w-[200px] py-3.5 px-6 bg-white text-slate-700 border border-slate-200 font-bold text-sm rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <ShieldAlert size={18} />
              Revoke Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
