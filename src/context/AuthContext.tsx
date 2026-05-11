import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export type Role = 'admin' | 'manager' | 'user';

export const ALL_PERMISSIONS = [
  { id: 'dashboard', label: 'ড্যাশবোর্ড' },
  { id: 'projects', label: 'কনটেন্ট প্রজেক্ট লিস্ট' },
  { id: 'clients', label: 'ক্লায়েন্ট প্রোফাইল' },
  { id: 'all-clients', label: 'অল লিড / ক্লায়েন্ট' },
  { id: 'website', label: 'ওয়েবসাইট' },
  { id: 'automation', label: 'অটোমেশন' },
  { id: 'course', label: 'কোর্স' },
  { id: 'marketing', label: 'মার্কেটিং' },
  { id: 'models', label: 'মডেল বিশ্লেষণ' },
  { id: 'scheduling', label: 'শিডিউলিং' },
  { id: 'lead', label: 'লিড' },
  { id: 'invoice', label: 'ইনভয়েস' },
  { id: 'daily-tasks', label: 'ডেইলি টাস্ক' },
  { id: 'terms', label: 'কোম্পানি কন্ডিশন' },
  { id: 'task-manager', label: 'টাস্ক ম্যানেজার' },
  { id: 'portfolio', label: 'স্টুডিও পোর্টফোলিও' },
  { id: 'employees', label: 'এমপ্লয়ি লিস্ট' },
  { id: 'website-info', label: 'ওয়েবসাইট ইনফো' },
  { id: 'users', label: 'ইউজার ম্যানেজমেন্ট' },
  { id: 'messages', label: 'মেসেজ বক্স' }
];

export const PROJECT_PERMISSIONS = [
  { id: 'project-financials', label: 'বাজেট ও পেমেন্ট (Budget & Payment)' },
  { id: 'project-scripts', label: 'স্ক্রিপ্ট ও ফরম্যাট (Scripts & Format)' },
  { id: 'project-content', label: 'কনটেন্ট লগ (Content Log)' },
  { id: 'project-links', label: 'লিঙ্কসমূহ (Links)' },
  { id: 'project-dates', label: 'তারিখ (Dates)' },
  { id: 'project-team', label: 'টিম মেম্বার (Assigned Team)' }
];

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  isSuperAdmin?: boolean;
  permissions: string[];
  projectPermissions?: string[];
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const defaultAdmin: User = {
  id: 'u1',
  name: 'Super Admin',
  email: 'admin',
  password: 'admin',
  role: 'admin',
  isSuperAdmin: true,
  permissions: ALL_PERMISSIONS.map(p => p.id),
  projectPermissions: PROJECT_PERMISSIONS.map(p => p.id)
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('studio_auth_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('studio_auth_users');
    return saved ? JSON.parse(saved) : [defaultAdmin];
  });

  useEffect(() => {
    localStorage.setItem('studio_auth_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('studio_auth_users', JSON.stringify(users));
  }, [users]);

  // On mount, fetch users from the MySQL users table
  useEffect(() => {
    fetch(`${API_BASE_URL}/get_users.php`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(apiUsers => {
        if (Array.isArray(apiUsers) && apiUsers.length > 0) {
          setUsers(apiUsers);
        }
      })
      .catch(() => {
        // Offline fallback: keep localStorage users
      });
  }, []);

  const login = (email: string, password?: string) => {
    // Try API login first (validates against MySQL users table with bcrypt)
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(user => {
        setCurrentUser(user);
      })
      .catch(() => {
        // API offline — fallback to localStorage users
      });

    // Synchronous fallback for immediate UI response
    const user = users.find(u => u.email === email && (!password || u.password === password));
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' }).catch(() => {});
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const tempId = `u${Date.now()}`;
    const newUser = { ...user, id: tempId };
    
    // Optimistic local update
    setUsers(prev => [...prev, newUser]);

    // Persist to MySQL users table
    fetch(`${API_BASE_URL}/add_user.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(savedUser => {
        // Replace temp user with the real one from DB (correct ID + hashed password)
        setUsers(prev => prev.map(u => u.id === tempId ? savedUser : u));
      })
      .catch(() => {
        // If API fails, keep the optimistic local version
      });
  };

  const updateUser = (id: string, updatedFields: Partial<User>) => {
    // Optimistic local update
    setUsers(users.map(u => u.id === id ? { ...u, ...updatedFields } : u));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updatedFields } : null);
    }

    // Persist to MySQL users table
    fetch(`${API_BASE_URL}/update_user.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updatedFields })
    }).catch(() => {});
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));

    // Delete from MySQL users table
    fetch(`${API_BASE_URL}/delete_user.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, addUser, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
