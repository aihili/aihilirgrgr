import React, { useState } from 'react';
import { LayoutDashboard, Users, HardDrive, Cpu, ShieldCheck, LogOut, ChevronRight, Menu, X, Sun, Moon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onLogout, isDarkMode, toggleTheme }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'machines', label: 'Machines', icon: HardDrive },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'devices', label: 'IoT Devices', icon: Cpu },
    { id: 'permissions', label: 'Permissions', icon: ShieldCheck },
  ];

  const activeItemLabel = menuItems.find(i => i.id === activeTab)?.label;

  const handleNavClick = (id: string) => {
    onTabChange(id);
    setIsSidebarOpen(false); // Close sidebar on mobile on selection
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] dark:bg-slate-950 overflow-hidden relative transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 text-slate-300 flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50 bg-slate-950 shrink-0 justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-900/50">
              <Cpu size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-wide text-lg">Nexus</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Console</span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                    : 'hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white'
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

        <div className="p-4 border-t border-slate-800/50 bg-slate-950 shrink-0">
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 shadow-sm shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-3 md:gap-4">
             {/* Mobile Menu Trigger */}
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
             >
                <Menu size={24} />
             </button>
             <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate">{activeItemLabel}</h2>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
             
             {/* Theme Toggle */}
             <button 
               onClick={toggleTheme}
               className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
               title="Toggle Theme"
             >
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
               <span>v4.0.0</span>
             </div>
             <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 md:mx-2 hidden sm:block"></div>
             <div className="flex items-center gap-2 md:gap-3 pl-0 md:pl-2">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Administrator</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Super Admin</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-100 to-slate-200 border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden flex-shrink-0">
                   <img src={`https://ui-avatars.com/api/?name=Admin&background=random`} alt="Admin" className="w-full h-full object-cover" />
                </div>
             </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#f8fafc] dark:bg-slate-950 w-full transition-colors duration-300">
          {/* Centered Container for Balance */}
          <div className="max-w-7xl mx-auto w-full animate-slide-up space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};