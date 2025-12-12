import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Machine } from '../types';
import { ShieldCheck, ShieldAlert, ArrowRight, User as UserIcon, HardDrive, Lock } from 'lucide-react';

export const PermissionsManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedMachine, setSelectedMachine] = useState<string>('');
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
        user_id: parseInt(selectedUser),
        machine_id: parseInt(selectedMachine),
      });
      setMessage({ type: 'success', text: 'Permission successfully GRANTED.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to grant permission.' });
    }
  };

  const handleRevoke = async () => {
    if (!selectedUser || !selectedMachine) return;
    try {
      await api.revokePermission({
        user_id: parseInt(selectedUser),
        machine_id: parseInt(selectedMachine),
      });
      setMessage({ type: 'success', text: 'Permission successfully REVOKED.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to revoke permission.' });
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
            <div className={`mb-10 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
              <div className={`p-1.5 rounded-full ${message.type === 'success' ? 'bg-emerald-200' : 'bg-red-200'}`}>
                {message.type === 'success' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
              </div>
              <span className="font-medium text-sm">{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-8 items-center">
            
            {/* User Column */}
            <div className="flex flex-col h-full">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                <UserIcon size={14} />
                <span>1. Select User</span>
              </label>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 flex-1 min-h-[200px] flex flex-col hover:border-indigo-300 transition-colors">
                <select
                  className="flex-1 w-full bg-transparent border-none outline-none text-sm p-2 overflow-y-auto cursor-pointer text-slate-700"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  size={8}
                >
                  {users.length === 0 && <option disabled>No users available</option>}
                  {users.map((u) => (
                    <option key={u.id} value={u.id} className="p-2.5 rounded-lg hover:bg-white hover:shadow-sm mb-1 transition-all">
                      {u.username} • {u.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Connector */}
            <div className="flex md:flex-col items-center justify-center gap-2 text-slate-300">
               <div className="hidden md:block h-12 w-[1px] bg-slate-200"></div>
               <div className="p-3 rounded-full bg-slate-100 text-slate-400">
                  <Lock size={20} />
               </div>
               <div className="hidden md:block h-12 w-[1px] bg-slate-200"></div>
            </div>

            {/* Machine Column */}
            <div className="flex flex-col h-full">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                <HardDrive size={14} />
                <span>2. Select Machine</span>
              </label>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 flex-1 min-h-[200px] flex flex-col hover:border-indigo-300 transition-colors">
                <select
                  className="flex-1 w-full bg-transparent border-none outline-none text-sm p-2 overflow-y-auto cursor-pointer text-slate-700"
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  size={8}
                >
                  {machines.length === 0 && <option disabled>No machines available</option>}
                  {machines.map((m) => (
                    <option key={m.id} value={m.id} className="p-2.5 rounded-lg hover:bg-white hover:shadow-sm mb-1 transition-all">
                      {m.name} (ID: {m.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 border-t border-slate-100 pt-8">
            <button
              onClick={handleGrant}
              disabled={!selectedUser || !selectedMachine}
              className="flex-1 sm:max-w-[200px] py-3.5 px-6 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all"
            >
              Grant Access
            </button>
            <button
              onClick={handleRevoke}
              disabled={!selectedUser || !selectedMachine}
              className="flex-1 sm:max-w-[200px] py-3.5 px-6 bg-white text-slate-700 border border-slate-200 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Revoke Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
