import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Machine, MachineStatus } from '../types';
import { Plus, Trash2, Edit2, Activity, Zap, Wind, Settings, Info, X, Clock, Save, RotateCw, Gauge, Timer, Power, Droplets } from 'lucide-react';

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
  
  // Initialize with defaults matching the Go struct
  const [newStatus, setNewStatus] = useState<Partial<MachineStatus>>({
    imei: '',
    main_speed_rpm: 0,
    machine_cycles: 0,
    min: 0,
    run_test_set_g: 0,
    processing_time: "00:00:00",
    remaining_time: "00:00:00",
    fan_on: false,
    powder_on: false,
    powder_off: true,
    powder_motor_on: false,
    pump_in_on: false,
    pump_out_on: false,
    run_test_set: false,
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
    
    // Populate form with existing data or safe defaults
    setNewStatus({
        imei: m.status?.imei || `IMEI-${m.id.toString().padStart(8, '0')}`,
        main_speed_rpm: m.status?.main_speed_rpm || 0,
        machine_cycles: m.status?.machine_cycles || 0,
        min: m.status?.min || 0,
        run_test_set_g: m.status?.run_test_set_g || 0,
        processing_time: m.status?.processing_time || "00:00:00",
        remaining_time: m.status?.remaining_time || "00:00:00",
        fan_on: m.status?.fan_on || false,
        powder_on: m.status?.powder_on || false,
        powder_off: m.status?.powder_off ?? true,
        powder_motor_on: m.status?.powder_motor_on || false,
        pump_in_on: m.status?.pump_in_on || false,
        pump_out_on: m.status?.pump_out_on || false,
        run_test_set: m.status?.run_test_set || false,
    });

    try {
      const historyData = await api.getMachineHistory(m.id);
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
        // Refresh history and main list
        const historyData = await api.getMachineHistory(selectedMachine.id);
        const sorted = historyData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setHistory(sorted);
        fetchMachines(); 
    } catch (err) {
        alert("Failed to add status");
    }
  };

  // Helper for toggle buttons
  const ToggleBtn = ({ 
    active, 
    onClick, 
    label, 
    icon: Icon 
  }: { active: boolean, onClick: () => void, label: string, icon: any }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all h-20 w-full ${
        active 
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' 
          : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
      }`}
    >
      <Icon size={18} className={active ? 'animate-pulse' : ''} />
      <span className="text-[10px] font-bold uppercase text-center leading-tight">{label}</span>
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : 'bg-slate-200'}`}></div>
    </button>
  );

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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4 md:p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col animate-slide-up ring-1 ring-black/5 overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{selectedMachine.name}</h3>
                            <p className="text-slate-500 text-xs font-mono">ID: {selectedMachine.id}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    
                    {/* LEFT: History List (Takes remaining space) */}
                    <div className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-100">
                        <div className="p-3 bg-slate-50/30 border-b border-slate-100 flex justify-between items-center shrink-0">
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
                                            <th className="px-4 py-3 border-b border-slate-100">Speed / Cycles</th>
                                            <th className="px-4 py-3 border-b border-slate-100">Process Time</th>
                                            <th className="px-4 py-3 border-b border-slate-100 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {history.map((status) => (
                                            <tr key={status.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                                                <td className="px-4 py-3 text-slate-600 font-mono text-xs whitespace-nowrap">
                                                    {new Date(status.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                      <span className="font-bold text-slate-700 text-xs">{status.main_speed_rpm} RPM</span>
                                                      <span className="text-slate-400 text-[10px]">{status.machine_cycles.toLocaleString()} Cyc</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-600 font-mono">{status.processing_time}</span>
                                                        <span className="text-[10px] text-slate-400">Min: {status.min}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1 flex-wrap max-w-[120px] ml-auto">
                                                        {status.fan_on && <span title="Fan On" className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                                                        {status.powder_on && <span title="Powder On" className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                                                        {status.pump_in_on && <span title="Pump In" className="w-2 h-2 rounded-full bg-blue-500"></span>}
                                                        {status.pump_out_on && <span title="Pump Out" className="w-2 h-2 rounded-full bg-orange-500"></span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Add Status Form (Fixed width, Scrollable content) */}
                    <div className="w-full md:w-[500px] bg-slate-50 flex flex-col border-t md:border-t-0 shrink-0 border-l border-slate-100">
                         <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Activity size={16} className="text-indigo-600" />
                                Update Device Status
                            </h4>
                         </div>

                         <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                           <form onSubmit={handleAddStatus} className="space-y-6">
                              {/* Group: Identity */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Device Identity</label>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">IMEI</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        value={newStatus.imei}
                                        onChange={e => setNewStatus({...newStatus, imei: e.target.value})}
                                    />
                                </div>
                              </div>

                              {/* Group: Metrics */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <Gauge size={14} /> Metrics
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-semibold text-slate-600 mb-1">RPM</label>
                                      <input 
                                          type="number" 
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                          value={newStatus.main_speed_rpm}
                                          onChange={e => setNewStatus({...newStatus, main_speed_rpm: Number(e.target.value)})}
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-slate-600 mb-1">Cycles</label>
                                      <input 
                                          type="number" 
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                          value={newStatus.machine_cycles}
                                          onChange={e => setNewStatus({...newStatus, machine_cycles: Number(e.target.value)})}
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-slate-600 mb-1">Min Value</label>
                                      <input 
                                          type="number" 
                                          step="0.01"
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                          value={newStatus.min}
                                          onChange={e => setNewStatus({...newStatus, min: Number(e.target.value)})}
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-slate-600 mb-1">Run Test (g)</label>
                                      <input 
                                          type="number" 
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                          value={newStatus.run_test_set_g}
                                          onChange={e => setNewStatus({...newStatus, run_test_set_g: Number(e.target.value)})}
                                      />
                                  </div>
                                </div>
                              </div>

                              {/* Group: Timing */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <Timer size={14} /> Timing
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-semibold text-slate-600 mb-1">Processing Time</label>
                                      <input 
                                          type="text" 
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                          value={newStatus.processing_time}
                                          onChange={e => setNewStatus({...newStatus, processing_time: e.target.value})}
                                          placeholder="00:00:00"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-slate-600 mb-1">Remaining Time</label>
                                      <input 
                                          type="text" 
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                          value={newStatus.remaining_time}
                                          onChange={e => setNewStatus({...newStatus, remaining_time: e.target.value})}
                                          placeholder="00:00:00"
                                      />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Group: State Toggles */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <Power size={14} /> Active States
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <ToggleBtn 
                                      active={!!newStatus.fan_on} 
                                      onClick={() => setNewStatus(p => ({...p, fan_on: !p.fan_on}))} 
                                      label="Fan" 
                                      icon={Wind} 
                                    />
                                    <ToggleBtn 
                                      active={!!newStatus.powder_on} 
                                      onClick={() => setNewStatus(p => ({...p, powder_on: !p.powder_on}))} 
                                      label="Powder On" 
                                      icon={Zap} 
                                    />
                                    <ToggleBtn 
                                      active={!!newStatus.powder_off} 
                                      onClick={() => setNewStatus(p => ({...p, powder_off: !p.powder_off}))} 
                                      label="Powder Off" 
                                      icon={Zap} 
                                    />
                                    <ToggleBtn 
                                      active={!!newStatus.powder_motor_on} 
                                      onClick={() => setNewStatus(p => ({...p, powder_motor_on: !p.powder_motor_on}))} 
                                      label="P-Motor" 
                                      icon={Settings} 
                                    />
                                    <ToggleBtn 
                                      active={!!newStatus.pump_in_on} 
                                      onClick={() => setNewStatus(p => ({...p, pump_in_on: !p.pump_in_on}))} 
                                      label="Pump In" 
                                      icon={Droplets} 
                                    />
                                    <ToggleBtn 
                                      active={!!newStatus.pump_out_on} 
                                      onClick={() => setNewStatus(p => ({...p, pump_out_on: !p.pump_out_on}))} 
                                      label="Pump Out" 
                                      icon={Droplets} 
                                    />
                                     <ToggleBtn 
                                      active={!!newStatus.run_test_set} 
                                      onClick={() => setNewStatus(p => ({...p, run_test_set: !p.run_test_set}))} 
                                      label="Run Test" 
                                      icon={Activity} 
                                    />
                                </div>
                              </div>
                           </form>
                         </div>
                         
                         <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0 z-20">
                            <button 
                                onClick={handleAddStatus}
                                type="button" 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:translate-y-0.5"
                            >
                                <Save size={18} />
                                Push Status Update
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
