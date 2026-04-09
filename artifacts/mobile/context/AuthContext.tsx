import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USERS_KEY = "fandom_users";
const SESSION_KEY = "fandom_session";

interface StoredUser extends AuthUser {
  password: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const session = await AsyncStorage.getItem(SESSION_KEY);
        if (session) {
          const parsed = JSON.parse(session) as AuthUser;
          setUser(parsed);
        }
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users: StoredUser[] = raw ? JSON.parse(raw) : [];
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) throw new Error("invalid_credentials");
    const { password: _pw, ...authUser } = found;
    setUser(authUser);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users: StoredUser[] = raw ? JSON.parse(raw) : [];
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error("email_taken");
    const newUser: StoredUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      email,
      avatar: name.charAt(0).toUpperCase(),
      password,
    };
    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    const { password: _pw, ...authUser } = newUser;
    setUser(authUser);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
