import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Device } from '../types';
import { Plus, Trash2, Cpu, AlertCircle, FileText, Router, X } from 'lucide-react';

export const DevicesManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({ imei: '', info: '', note: '' });
  const [toastMessage, setToastMessage] = useState('');

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await api.getDevices();
      setDevices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDevice(newDevice);
      setIsModalOpen(false);
      setNewDevice({ imei: '', info: '', note: '' });
      showToast('Device creation queued successfully.');
      setTimeout(fetchDevices, 2000); 
    } catch (err) {
      alert('Failed to queue device creation');
    }
  };

  const handleDelete = async (imei: string) => {
    if (window.confirm('Delete this device?')) {
      try {
        await api.deleteDevice(imei);
        showToast('Device deletion queued.');
        setTimeout(fetchDevices, 2000);
      } catch (err) {
        alert('Failed');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">IoT Registry</h3>
          <p className="text-slate-500 text-sm mt-1">Manage connected hardware and sensors.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span className="font-medium text-sm">Register Device</span>
        </button>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="font-medium text-sm">{toastMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 border-b border-slate-100">Device Identity</th>
                <th className="px-6 py-4 border-b border-slate-100">Description</th>
                <th className="px-6 py-4 border-b border-slate-100">Status</th>
                <th className="px-6 py-4 border-b border-slate-100">Notes</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400">Loading devices...</td></tr>
              ) : devices.length > 0 ? (
                devices.map((device) => (
                  <tr key={device.id} className="group hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                       <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                             <Router size={16} />
                          </div>
                          <span className="font-mono text-sm font-semibold text-slate-700">{device.imei}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{device.info}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-600 border border-slate-200 uppercase tracking-wide">
                        {device.status || 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                       {device.note ? (
                         <div className="flex items-center gap-1.5">
                           <FileText size={14} className="text-slate-400" />
                           <span className="truncate max-w-[200px]">{device.note}</span>
                         </div>
                       ) : (
                         <span className="text-slate-300 italic">--</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(device.imei)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                /* Balanced Empty State */
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <Cpu className="text-slate-300" size={32} />
                      </div>
                      <h4 className="text-slate-700 font-semibold mb-1">No devices registered</h4>
                      <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6">
                        Your IoT fleet is empty. Register your first device to start monitoring.
                      </p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="text-indigo-600 font-medium text-sm hover:underline"
                      >
                        Register new device
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-slide-up ring-1 ring-black/5">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-xl font-bold text-slate-800">Register Device</h3>
                  <p className="text-slate-500 text-sm mt-1">Add a new device to the inventory.</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">IMEI (Required)</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
                  value={newDevice.imei}
                  onChange={(e) => setNewDevice({ ...newDevice, imei: e.target.value })}
                  placeholder="e.g. 86421004..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Info</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                  value={newDevice.info}
                  onChange={(e) => setNewDevice({ ...newDevice, info: e.target.value })}
                  placeholder="e.g. Conveyor Sensor"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
                <textarea
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none text-sm"
                  value={newDevice.note}
                  onChange={(e) => setNewDevice({ ...newDevice, note: e.target.value })}
                  rows={3}
                  placeholder="Optional notes..."
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
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
