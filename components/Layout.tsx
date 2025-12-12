import React from 'react';
import { LayoutDashboard, Users, HardDrive, Cpu, ShieldCheck, LogOut, ChevronRight, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'machines', label: 'Machines', icon: HardDrive },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'devices', label: 'IoT Devices', icon: Cpu },
    { id: 'permissions', label: 'Permissions', icon: ShieldCheck },
  ];

  const activeItemLabel = menuItems.find(i => i.id === activeTab)?.label;

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-800/50 bg-slate-950">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-900/50">
            <Cpu size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white tracking-wide text-lg">Nexus</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Console</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="text-indigo-200" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50 bg-slate-950">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center space-x-4">
             <h2 className="text-xl font-bold text-slate-800 tracking-tight">{activeItemLabel}</h2>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
               <span>v4.0.0 Stable</span>
             </div>
             <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
             <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-700">Administrator</p>
                  <p className="text-xs text-slate-500">Super Admin</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-slate-200 border-2 border-white shadow-sm overflow-hidden">
                   <img src={`https://ui-avatars.com/api/?name=Admin&background=random`} alt="Admin" className="w-full h-full object-cover" />
                </div>
             </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8fafc]">
          {/* Centered Container for Balance */}
          <div className="max-w-7xl mx-auto w-full animate-slide-up space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
