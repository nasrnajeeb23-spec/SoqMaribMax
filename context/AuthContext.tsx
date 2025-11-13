import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, VerificationStatus } from '../types';
import { users as mockUsersData } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'verificationStatus' | 'commercialRegisterUrl' | 'guaranteeUrl' | 'balance' | 'isSuspended'>) => Promise<User | null>;
  deleteUser: (userId: string) => void;
  requestVerification: (userId: string, commercialRegisterUrl: string, guaranteeUrl: string) => void;
  approveVerification: (userId: string) => void;
  revokeVerification: (userId: string) => void;
  suspendUser: (userId: string) => void; // New
  unsuspendUser: (userId: string) => void; // New
  followSeller: (sellerId: string) => void;
  unfollowSeller: (sellerId: string) => void;
  updateUser: (userId: string, updatedData: Partial<Pick<User, 'name' | 'city' | 'phone'>>) => void;
  updateUserAverageRating: (userId: string, newAverageRating: number) => void;
  updateUserBalance: (userId: string, amount: number) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('souqmarib_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  const [allUsers, setAllUsers] = useState<User[]>(mockUsersData);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('souqmarib_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('souqmarib_user');
      }
    } catch (error) {
       console.error("Failed to set user in localStorage", error);
    }
  }, [user]);

  const login = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    console.log(`Attempting to log in with ${email}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    setLoading(false);
    if (foundUser) {
      if (foundUser.isSuspended) {
        throw new Error("هذا الحساب معلّق. يرجى التواصل مع الإدارة.");
      }
      setUser(foundUser);
      return foundUser;
    }
    
    return null;
  };

  const loginWithGoogle = async (): Promise<User | null> => {
    setLoading(true);
    console.log(`Attempting to log in with Google`);
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    const foundUser = allUsers.find(u => u.email.toLowerCase() === 'google_user@example.com');
    
    setLoading(false);
    if (foundUser) {
      if (foundUser.isSuspended) {
        throw new Error("هذا الحساب معلّق. يرجى التواصل مع الإدارة.");
      }
      setUser(foundUser);
      return foundUser;
    }
    
    return null;
  };


  const register = async (userData: Omit<User, 'id' | 'verificationStatus' | 'commercialRegisterUrl' | 'guaranteeUrl' | 'balance' | 'isSuspended'>): Promise<User | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    const existingUser = allUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
      setLoading(false);
      throw new Error("هذا البريد الإلكتروني مسجل بالفعل.");
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      ...userData,
      verificationStatus: 'NOT_VERIFIED',
      balance: 0,
      isSuspended: false,
    };
    
    const updatedUsers = [...allUsers, newUser];
    setAllUsers(updatedUsers);
    setUser(newUser);
    setLoading(false);
    return newUser;
  };

  const deleteUser = (userId: string) => {
    if (user?.id === userId) {
      alert("لا يمكنك حذف حسابك الخاص.");
      return;
    }
    setAllUsers(allUsers.filter(u => u.id !== userId));
  };
  
  const suspendUser = (userId: string) => {
    setAllUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, isSuspended: true } : u));
  };

  const unsuspendUser = (userId: string) => {
    setAllUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, isSuspended: false } : u));
  };


  const requestVerification = (userId: string, commercialRegisterUrl: string, guaranteeUrl: string) => {
    const updatedUsers = allUsers.map(u => {
      if (u.id === userId) {
        const updatedUser = { 
            ...u, 
            verificationStatus: 'PENDING_VERIFICATION' as VerificationStatus,
            commercialRegisterUrl,
            guaranteeUrl
        };
        // If the current user is being updated, update the user state as well
        if(user && user.id === userId) {
          setUser(updatedUser);
        }
        return updatedUser;
      }
      return u;
    });
    setAllUsers(updatedUsers);
  };

  const approveVerification = (userId: string) => {
     const updatedUsers = allUsers.map(u => {
      if (u.id === userId) {
        const updatedUser = { ...u, verificationStatus: 'VERIFIED' as VerificationStatus };
        if(user && user.id === userId) setUser(updatedUser);
        return updatedUser;
      }
      return u;
    });
    setAllUsers(updatedUsers);
  };
  
  const revokeVerification = (userId: string) => {
    const updatedUsers = allUsers.map(u => {
      if (u.id === userId) {
        const updatedUser = { 
            ...u, 
            verificationStatus: 'NOT_VERIFIED' as VerificationStatus,
            commercialRegisterUrl: undefined,
            guaranteeUrl: undefined
        };
        if(user && user.id === userId) setUser(updatedUser);
        return updatedUser;
      }
      return u;
    });
    setAllUsers(updatedUsers);
  };

  const followSeller = (sellerId: string) => {
    if (!user) return;
    const updatedFollowing = [...(user.following || []), sellerId];
    const updatedUser = { ...user, following: updatedFollowing };
    setUser(updatedUser);

    // Also update the master list
    const updatedAllUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
    setAllUsers(updatedAllUsers);
  };
  
  const unfollowSeller = (sellerId: string) => {
    if (!user) return;
    const updatedFollowing = (user.following || []).filter(id => id !== sellerId);
    const updatedUser = { ...user, following: updatedFollowing };
    setUser(updatedUser);
    
    // Also update the master list
    const updatedAllUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
    setAllUsers(updatedAllUsers);
  };

  const updateUser = (userId: string, updatedData: Partial<Pick<User, 'name' | 'city' | 'phone'>>) => {
    const updatedUsers = allUsers.map(u => {
      if (u.id === userId) {
        const updatedUser = { ...u, ...updatedData };
        // If the current user is being updated, update the user state as well
        if(user && user.id === userId) {
          setUser(updatedUser);
        }
        return updatedUser;
      }
      return u;
    });
    setAllUsers(updatedUsers);
  };

  const updateUserAverageRating = (userId: string, newAverageRating: number) => {
    setAllUsers(prevUsers => {
      const updatedUsers = prevUsers.map(u => {
        if (u.id === userId) {
          const updatedUser = { ...u, averageRating: newAverageRating };
          if (user && user.id === userId) {
            setUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      });
      return updatedUsers;
    });
  };

  const updateUserBalance = (userId: string, amount: number) => {
    setAllUsers(prevUsers => {
      const updatedUsers = prevUsers.map(u => {
        if (u.id === userId) {
          const updatedUser = { ...u, balance: u.balance + amount };
          if (user && user.id === userId) {
            setUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      });
      return updatedUsers;
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, users: allUsers, isAuthenticated: !!user, loading, login, loginWithGoogle, logout, register, deleteUser, requestVerification, approveVerification, revokeVerification, suspendUser, unsuspendUser, followSeller, unfollowSeller, updateUser, updateUserAverageRating, updateUserBalance }}>
      {children}
    </AuthContext.Provider>
  );
};