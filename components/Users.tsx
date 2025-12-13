import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Plus, Trash2, Edit2, UserX, Search, Shield, User as UserIcon, X } from 'lucide-react';

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser(newUser);
      setIsModalOpen(false);
      setNewUser({ username: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err: any) {
      setError('Failed to create user. Username might exist.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Delete user? This cannot be undone.')) {
      try {
        await api.deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  const handleUpdateRole = async (user: User) => {
    const newRole = prompt('Enter new role (admin/user):', user.role);
    if (newRole && newRole !== user.role) {
      try {
        await api.updateUserRole(user.id, newRole);
        fetchUsers();
      } catch (err) {
        alert('Failed to update role');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Team Members</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage user access and system roles.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span className="font-medium text-sm">Add New User</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {/* Search Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center bg-slate-50/50 dark:bg-slate-800/20">
           <div className="relative max-w-sm w-full">
             <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
             <input 
                type="text" 
                placeholder="Search by username..." 
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-700 dark:text-slate-200" 
             />
           </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800">User Details</th>
                <th className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800">Access Role</th>
                <th className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800">Joined Date</th>
                <th className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-400">Loading users...</td></tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center space-x-3 md:space-x-4">
                         <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs md:text-sm shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                         </div>
                         <div>
                           <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.username}</p>
                           <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">ID: {user.id}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        user.role === 'admin' 
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {user.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                        <span className="capitalize">{user.role}</span>
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      {/* Always visible on mobile, opacity hover on desktop */}
                      <div className="flex justify-end space-x-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleUpdateRole(user)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <UserX className="text-slate-300 dark:text-slate-600" size={32} />
                      </div>
                      <h4 className="text-slate-700 dark:text-slate-300 font-semibold mb-1">No users found</h4>
                      <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mx-auto mb-6">
                        There are no users registered in the system yet.
                      </p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline"
                      >
                        Create first user
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md animate-slide-up ring-1 ring-black/5 mx-auto border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Add New User</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create credentials for a new system user.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {error && <p className="text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-3 rounded-lg text-sm mb-5 font-medium">{error}</p>}
            
            <form onSubmit={handleCreateUser} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="johndoe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none transition-all text-sm cursor-pointer"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-50 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};