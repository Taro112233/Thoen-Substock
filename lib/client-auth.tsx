// lib/client-auth.tsx (Mock implementation สำหรับตอนนี้)
'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  hospitalId: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock user data - ในอนาคตจะเป็น API call
    setTimeout(() => {
      setUser({
        id: '1',
        name: 'System Developer',
        email: 'dev@system.local',
        role: 'DEVELOPER',
        hospitalId: '1'
      });
      setLoading(false);
    }, 1000);
  }, []);

  const logout = () => {
    setUser(null);
    window.location.href = '/auth/login';
  };

  const isAdmin = user && ['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD'].includes(user.role);

  return {
    user,
    loading,
    error,
    logout,
    isAdmin
  };
}