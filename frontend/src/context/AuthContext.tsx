import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { authApi, type LoginPayload, type RegisterPayload } from '@/api/auth.api';
import { registerAuthExpiredHandler } from '@/api/client';
import { tokenStorage } from '@/utils/storage';
import type { User } from '@/types';

type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const signOutLocally = useCallback(async () => {
    await tokenStorage.clearTokens();
    setUser(null);
    setStatus('signedOut');
    queryClient.clear();
  }, [queryClient]);

  // Bootstrap: on app start, if we have a stored token, validate it.
  useEffect(() => {
    (async () => {
      const accessToken = await tokenStorage.getAccessToken();
      if (!accessToken) {
        setStatus('signedOut');
        return;
      }
      try {
        const me = await authApi.me();
        setUser(me);
        setStatus('signedIn');
      } catch {
        await signOutLocally();
      }
    })();
  }, [signOutLocally]);

  // Let the axios interceptor force a logout if token refresh ever fails.
  useEffect(() => {
    registerAuthExpiredHandler(() => {
      void signOutLocally();
    });
  }, [signOutLocally]);

  const login = useCallback(async (payload: LoginPayload) => {
    const tokens = await authApi.login(payload);
    await tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
    const me = await authApi.me();
    setUser(me);
    setStatus('signedIn');
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authApi.register(payload);
      await login({ email: payload.email, password: payload.password });
    },
    [login]
  );

  const logout = useCallback(async () => {
    await signOutLocally();
  }, [signOutLocally]);

  const refreshCurrentUser = useCallback(async () => {
    const me = await authApi.me();
    setUser(me);
  }, []);

  const value = useMemo(
    () => ({ status, user, login, register, logout, refreshCurrentUser }),
    [status, user, login, register, logout, refreshCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider');
  return ctx;
}
