import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { UsersManagement } from './components/Users';
import { MachinesManagement } from './components/Machines';
import { DevicesManagement } from './components/Devices';
import { PermissionsManagement } from './components/Permissions';
import { LayoutDashboard, HardDrive, Users, Cpu, ArrowUpRight } from 'lucide-react';
import { api } from './services/api';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, machines: 0, devices: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const [u, m, d] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getMachines().catch(() => []),
        api.getDevices().catch(() => [])
      ]);
      setStats({ users: u.length, machines: m.length, devices: d.length });
    } catch (e) {
      console.error("Failed to load stats");
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchStats();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersManagement />;
      case 'machines':
        return <MachinesManagement />;
      case 'devices':
        return <DevicesManagement />;
      case 'permissions':
        return <PermissionsManagement />;
      default:
        return (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Users Card */}
              <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Total Users</p>
                    <h3 className="text-4xl font-bold text-slate-800 tracking-tight">{stats.users}</h3>
                  </div>
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Users size={24} />
                  </div>
                </div>
                <div className="relative z-10 mt-4 flex items-center text-sm text-green-600 font-medium">
                  <ArrowUpRight size={16} className="mr-1" />
                  <span>12% from last month</span>
                </div>
              </div>

              {/* Machines Card */}
              <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Active Machines</p>
                    <h3 className="text-4xl font-bold text-slate-800 tracking-tight">{stats.machines}</h3>
                  </div>
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                    <HardDrive size={24} />
                  </div>
                </div>
                <div className="relative z-10 mt-4 flex items-center text-sm text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  <span>System Operational</span>
                </div>
              </div>

              {/* Devices Card */}
              <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">IoT Devices</p>
                    <h3 className="text-4xl font-bold text-slate-800 tracking-tight">{stats.devices}</h3>
                  </div>
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                    <Cpu size={24} />
                  </div>
                </div>
                <div className="relative z-10 mt-4 flex items-center text-sm text-purple-600 font-medium">
                  <ArrowUpRight size={16} className="mr-1" />
                  <span>5 new this week</span>
                </div>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 max-w-2xl">
                <h3 className="text-2xl font-bold mb-3">Welcome to NexusControl Admin</h3>
                <p className="text-slate-300 leading-relaxed mb-6">
                  You have full control over the system's users, machinery, and IoT infrastructure. 
                  Monitor real-time status, manage access permissions, and configure device parameters from this central hub.
                </p>
                <button 
                  onClick={() => setActiveTab('machines')}
                  className="bg-white text-slate-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  View Live Machines
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
