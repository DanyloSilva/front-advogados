"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type Role = 'USUARIO' | 'ADVOGADO';

interface UseAuthRedirectOptions {
  requiredAuth: boolean;
  allowedRoles?: Role[];
  redirectPath?: string;
}

export const useAuthRedirect = (options: UseAuthRedirectOptions) => {
  const { requiredAuth, allowedRoles, redirectPath = '/login' } = options;
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return; // Don't redirect until auth state is loaded

    if (requiredAuth && !isAuthenticated) {
      router.replace(redirectPath);
      return;
    }

    if (isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace('/dashboard'); // Or a specific "access denied" page
      return;
    }

    // Optional: Redirect authenticated users away from public pages like login/register
    if (!requiredAuth &&
        isAuthenticated &&
        (pathname === '/login' ||
          pathname === '/register/user' ||
          pathname === '/register/lawyer')) {
      router.replace('/dashboard');
    }

  }, [
    isAuthenticated,
    user,
    isLoading,
    requiredAuth,
    allowedRoles,
    redirectPath,
    router,
    pathname,
  ]);

  return { isLoading, isAuthenticated, user };
};
