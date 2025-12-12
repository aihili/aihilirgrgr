import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Machine } from '../types';
import { Plus, Trash2, Edit2, Activity, Zap, Wind, Settings, Info, X } from 'lucide-react';

export const MachinesManagement: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [machineName, setMachineName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const data = await api.getMachines();
      setMachines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.updateMachine(editId, machineName);
      } else {
        await api.createMachine(machineName);
      }
      setIsModalOpen(false);
      setMachineName('');
      setEditId(null);
      fetchMachines();
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this machine? This action is irreversible.')) {
      try {
        await api.deleteMachine(id);
        fetchMachines();
      } catch (err) {
        alert('Failed to delete machine');
      }
    }
  };

  const openEdit = (m: Machine) => {
    setMachineName(m.name);
    setEditId(m.id);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setMachineName('');
    setEditId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Production Units</h3>
          <p className="text-slate-500 text-sm mt-1">Real-time monitoring and configuration.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span className="font-medium text-sm">New Machine</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-64 animate-pulse">
              <div className="h-6 bg-slate-100 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-slate-50 rounded mb-4"></div>
              <div className="h-8 bg-slate-100 rounded w-full"></div>
            </div>
          ))
        ) : machines.length > 0 ? (
          machines.map((machine) => (
            <div key={machine.id} className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-100 transition-all duration-300">
              {/* Header */}
              <div className="p-5 border-b border-slate-50 flex justify-between items-start bg-gradient-to-br from-white to-slate-50">
                <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                     <Settings size={20} />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{machine.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">ID: #{machine.id.toString().padStart(4, '0')}</p>
                   </div>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(machine)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(machine.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Body */}
              <div className="p-5">
                {machine.status ? (
                  <div className="space-y-4">
                    {/* Status Badges */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Live</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono truncate max-w-[100px]">{machine.status.imei}</span>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center space-x-2 text-slate-400 mb-1">
                          <Activity size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Cycles</span>
                        </div>
                        <p className="text-lg font-bold text-slate-700 font-mono">{machine.status.machine_cycles.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center space-x-2 text-slate-400 mb-1">
                          <Zap size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">RPM</span>
                        </div>
                        <p className="text-lg font-bold text-slate-700 font-mono">{machine.status.main_speed_rpm}</p>
                      </div>
                    </div>

                    {/* Controls / Indicators */}
                    <div className="flex space-x-2 mt-2">
                      <div className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border ${machine.status.fan_on ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                         <Wind size={14} className={machine.status.fan_on ? 'animate-spin-slow' : ''} />
                         <span className="text-xs font-bold">FAN</span>
                      </div>
                      <div className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border ${machine.status.powder_on ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                         <div className={`w-2 h-2 rounded-full ${machine.status.powder_on ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`}></div>
                         <span className="text-xs font-bold">POWDER</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-300 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <Info size={24} className="mb-2 opacity-50" />
                    <span className="text-xs font-medium">No telemetry data</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
           <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
               <Settings className="text-slate-300" size={32} />
             </div>
             <h4 className="text-slate-700 font-semibold mb-1">No machines configured</h4>
             <button onClick={openCreate} className="text-indigo-600 font-medium text-sm hover:underline mt-2">
               Add your first machine
             </button>
           </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-slide-up ring-1 ring-black/5">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-xl font-bold text-slate-800">{editId ? 'Update Machine' : 'Create Machine'}</h3>
                  <p className="text-slate-500 text-sm mt-1">Enter machine configuration details.</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Machine Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                  placeholder="e.g., Line A - Machine 01"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-50 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
