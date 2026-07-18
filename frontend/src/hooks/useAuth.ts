import { useAuthContext } from '@/context/AuthContext';

/**
 * Re-exported for a consistent `useAuth()` import path across screens.
 * All actual state lives in AuthContext; this hook is the public API.
 */
export function useAuth() {
  return useAuthContext();
}
