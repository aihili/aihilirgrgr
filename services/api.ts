import { Machine, User, Device, PermissionRequest } from '../types';

const API_BASE_URL = 'https://virescent-clelia-heartaching.ngrok-free.dev';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.hash = '#/login';
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'API Error');
  }
  // 204 No Content
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

export const api = {
  // Auth
  login: async (credentials: { username: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  createUser: async (user: Partial<User>) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(user),
    });
    return handleResponse(response);
  },
  deleteUser: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  updateUserRole: async (id: number, role: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse(response);
  },

  // Machines
  getMachines: async (): Promise<Machine[]> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/machines`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  createMachine: async (name: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/machines`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse(response);
  },
  updateMachine: async (id: number, name: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/machines/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse(response);
  },
  deleteMachine: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/machines/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Devices (Async operations)
  getDevices: async (): Promise<Device[]> => {
    const response = await fetch(`${API_BASE_URL}/api/devices`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  createDevice: async (device: Partial<Device>) => {
    const response = await fetch(`${API_BASE_URL}/api/devices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(device),
    });
    // Devices API returns 202 Accepted for creates
    if (response.status === 202) return true;
    return handleResponse(response);
  },
  deleteDevice: async (imei: string) => {
    const response = await fetch(`${API_BASE_URL}/api/devices/${imei}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (response.status === 202) return true;
    return handleResponse(response);
  },

  // Permissions
  grantPermission: async (req: PermissionRequest) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/permissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(req),
    });
    return handleResponse(response);
  },
  revokePermission: async (req: PermissionRequest) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/permissions`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify(req),
    });
    return handleResponse(response);
  },
};
