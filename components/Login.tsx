import React, { useState } from 'react';
import { api } from '../services/api';
import { Lock, User, ArrowRight, Cpu, Zap, Activity } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ username, password });
      localStorage.setItem('token', data.token);
      onLogin();
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Tech Background Layers */}
      <div className="absolute inset-0 z-0">
         {/* Deep Space Base */}
         <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a0f1e] to-slate-950"></div>
         
         {/* Animated Grid */}
         <div className="absolute inset-0 tech-grid opacity-20 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
         
         {/* Moving Data Beams */}
         <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-[10%] w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-20 animate-beam"></div>
            <div className="absolute left-[25%] w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-10 animate-beam" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute right-[33%] w-[1px] h-full bg-gradient-to-b from-transparent via-indigo-500 to-transparent opacity-20 animate-beam" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute right-[15%] w-[1px] h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-15 animate-beam" style={{animationDelay: '2.5s'}}></div>
         </div>

         {/* Ambient Glows */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-[100%] blur-[120px] mix-blend-screen animate-pulse-slow"></div>
         <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      {/* Main Login Container */}
      <div className="glass-dark rounded-3xl w-full max-w-[420px] p-1 z-10 animate-slide-up relative group">
        
        {/* Decorative Border Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl opacity-20 group-hover:opacity-50 blur transition duration-1000"></div>
        
        <div className="bg-slate-900/90 rounded-[22px] p-8 relative overflow-hidden">
          {/* Subtle Scanline Overlay on Card */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,#000_3px)] opacity-10 pointer-events-none bg-[size:100%_4px]"></div>

          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex relative mb-4">
               <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 animate-pulse"></div>
               <div className="w-20 h-20 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-slate-700 shadow-2xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  <Cpu size={40} className="text-blue-400" />
                  
                  {/* Small deco dots */}
                  <div className="absolute bottom-2 right-2 flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                  </div>
               </div>
            </div>
            
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight mb-2">
              Nexus<span className="text-blue-500">Control</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs uppercase tracking-widest font-semibold">
              <Activity size={12} className="text-blue-500" />
              <span>System Authenticator</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-red-900/20 text-red-300 p-3 rounded-lg text-sm text-center border border-red-500/30 flex items-center justify-center gap-2 animate-fade-in backdrop-blur-sm">
                <Zap size={14} className="fill-red-400 text-red-400" />
                {error}
              </div>
            )}
            
            <div className="space-y-1.5 group/input">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider ml-1">Identity</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-400 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700/60 rounded-xl text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                  placeholder="USERNAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5 group/input">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider ml-1">Passkey</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700/60 rounded-xl text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-blue-900/20"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="flex items-center justify-center space-x-2">
                <span>{loading ? 'INITIALIZING...' : 'ESTABLISH LINK'}</span>
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </div>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
             <p className="text-[10px] text-slate-600 font-mono">
               SECURE CONNECTION V4.0.2 // ENCRYPTED
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
