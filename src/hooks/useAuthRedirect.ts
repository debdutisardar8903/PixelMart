'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export const useAuthRedirect = (defaultRedirect: string = '/') => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && user) {
      // Get redirect URL from query params, fallback to default
      const redirectTo = searchParams.get('redirect') || defaultRedirect;
      
      console.log('Auth redirect - redirectTo:', redirectTo);
      console.log('Auth redirect - user:', user.email);
      
      // Ensure we don't redirect to auth page to avoid loops
      if (redirectTo === '/auth') {
        console.log('Redirecting to default:', defaultRedirect);
        router.push(defaultRedirect);
      } else {
        console.log('Redirecting to:', redirectTo);
        router.push(redirectTo);
      }
    }
  }, [user, loading, router, defaultRedirect, searchParams]);

  return { user, loading };
};
