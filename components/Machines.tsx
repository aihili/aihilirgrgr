import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Machine, MachineStatus } from '../types';
import { Plus, Trash2, Edit2, Activity, Zap, Wind, Settings, Info, X, Clock, Save, RotateCw } from 'lucide-react';

export const MachinesManagement: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false); // For Create/Edit Machine
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // For Viewing History
  
  // Data States
  const [machineName, setMachineName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  
  // History & Status States
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [history, setHistory] = useState<MachineStatus[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [newStatus, setNewStatus] = useState({
    main_speed_rpm: 0,
    machine_cycles: 0,
    fan_on: false,
    powder_on: false
  });

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

  // --- CRUD Machine ---

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

  // --- History & Status Logic ---

  const openHistory = async (m: Machine) => {
    setSelectedMachine(m);
    setIsHistoryOpen(true);
    setLoadingHistory(true);
    
    // Reset new status form
    setNewStatus({
        main_speed_rpm: m.status?.main_speed_rpm || 0,
        machine_cycles: m.status?.machine_cycles || 0,
        fan_on: m.status?.fan_on || false,
        powder_on: m.status?.powder_on || false
    });

    try {
      const historyData = await api.getMachineHistory(m.id);
      // Sort desc by date if not already
      const sorted = historyData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setHistory(sorted);
    } catch (err) {
      console.error("Failed to load history", err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;
    
    try {
        await api.createMachineStatus(selectedMachine.id, newStatus);
        // Refresh history
        const historyData = await api.getMachineHistory(selectedMachine.id);
        const sorted = historyData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setHistory(sorted);
        fetchMachines(); // Refresh main list to show latest status
    } catch (err) {
        alert("Failed to add status");
    }
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
                   <button onClick={() => openHistory(machine)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="View History">
                    <Clock size={16} />
                  </button>
                  <button onClick={() => openEdit(machine)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(machine.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

      {/* CREATE / EDIT MACHINE MODAL */}
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

      {/* HISTORY & STATUS MODAL */}
      {isHistoryOpen && selectedMachine && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col animate-slide-up ring-1 ring-black/5 overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{selectedMachine.name} - Status History</h3>
                            <p className="text-slate-500 text-xs mt-0.5 font-mono">ID: {selectedMachine.id}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    
                    {/* LEFT: History List */}
                    <div className="flex-1 border-r border-slate-100 flex flex-col bg-white overflow-hidden">
                        <div className="p-4 bg-slate-50/30 border-b border-slate-100 flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Log</h4>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{history.length} records</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-0">
                            {loadingHistory ? (
                                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                                    <RotateCw className="animate-spin mr-2" size={16} /> Loading history...
                                </div>
                            ) : history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                                    <Clock size={32} className="mb-2 opacity-20" />
                                    No history records found
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3 border-b border-slate-100">Time</th>
                                            <th className="px-4 py-3 border-b border-slate-100">RPM</th>
                                            <th className="px-4 py-3 border-b border-slate-100">Cycles</th>
                                            <th className="px-4 py-3 border-b border-slate-100 text-right">State</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {history.map((status) => (
                                            <tr key={status.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                                                <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                                                    {new Date(status.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-slate-700">
                                                    {status.main_speed_rpm}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {status.machine_cycles.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <span title="Fan" className={`w-2 h-2 rounded-full ${status.fan_on ? 'bg-emerald-500' : 'bg-slate-200'}`}></span>
                                                        <span title="Powder" className={`w-2 h-2 rounded-full ${status.powder_on ? 'bg-indigo-500' : 'bg-slate-200'}`}></span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Add Status Form */}
                    <div className="w-full md:w-80 bg-slate-50/50 p-6 flex flex-col border-t md:border-t-0">
                         <div className="mb-6">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Activity size={16} className="text-indigo-600" />
                                Update Status
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">Manually push a status update.</p>
                         </div>

                         <form onSubmit={handleAddStatus} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">RPM (Speed)</label>
                                <input 
                                    type="number" 
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    value={newStatus.main_speed_rpm}
                                    onChange={e => setNewStatus({...newStatus, main_speed_rpm: Number(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">Cycles</label>
                                <input 
                                    type="number" 
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    value={newStatus.machine_cycles}
                                    onChange={e => setNewStatus({...newStatus, machine_cycles: Number(e.target.value)})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setNewStatus(p => ({...p, fan_on: !p.fan_on}))}
                                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${newStatus.fan_on ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                                >
                                    <Wind size={20} />
                                    <span className="text-xs font-bold">FAN {newStatus.fan_on ? 'ON' : 'OFF'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewStatus(p => ({...p, powder_on: !p.powder_on}))}
                                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${newStatus.powder_on ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                                >
                                    <Zap size={20} />
                                    <span className="text-xs font-bold">POWDER</span>
                                </button>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:translate-y-0.5"
                            >
                                <Save size={16} />
                                Push Status Update
                            </button>
                         </form>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
