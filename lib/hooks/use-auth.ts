'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '../supabase/client';
import { User as AppUser } from '../types';
import { getCurrentUser } from '../api/users';

export interface AuthState {
  user: AppUser | null;
  authUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    authUser: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          const profile = await getCurrentUser();
          setState({
            user: profile,
            authUser,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            authUser: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState({
          user: null,
          authUser: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await getCurrentUser();
          setState({
            user: profile,
            authUser: session.user,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            authUser: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }

    setState({
      user: null,
      authUser: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
  };
}

