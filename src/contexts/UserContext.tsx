'use client';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string;
  is_admin: boolean;
  avatarUrl?: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  logout: () => void;
  updateAvatar: (newAvatarUrl: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (res.status === 401) throw new Error('Token inválido');
          if (!res.ok) throw new Error('Erro ao buscar usuário');
          const rawUserData = await res.json();
          const userData = {
            ...rawUserData,
            avatarUrl: rawUserData.photo_url,
          };
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        })
        .catch((err) => {
          console.warn('Erro ao buscar /me:', err.message);
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const updateAvatar = () => { };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, logout, updateAvatar }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};