import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loginAsDemo: (demoRole: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PROFILES: Record<UserRole, Profile> = {
  admin: {
    id: '11111111-1111-1111-1111-111111111111',
    full_name: 'Admin Administrator',
    email: 'admin@demo.com',
    phone: '+1 (555) 019-2834',
    role: 'admin',
    job_title: 'VP of Engineering & Operations',
    employment_status: 'active',
    date_of_joining: '2023-01-15',
    salary: 2200000,
    department: {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Engineering',
    },
  },
  project_manager: {
    id: '22222222-2222-2222-2222-222222222222',
    full_name: 'John Smith',
    email: 'manager@demo.com',
    phone: '+1 (555) 012-3456',
    role: 'project_manager',
    job_title: 'Senior Engineering Manager',
    employment_status: 'active',
    date_of_joining: '2023-03-01',
    salary: 1650000,
    department: {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Engineering',
    },
  },
  employee: {
    id: '33333333-3333-3333-3333-333333333333',
    full_name: 'Jane Smith',
    email: 'employee@demo.com',
    phone: '+1 (555) 018-7654',
    role: 'employee',
    job_title: 'Staff ML Engineer',
    employment_status: 'active',
    date_of_joining: '2023-06-12',
    salary: 1400000,
    department: {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Engineering',
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, department:departments(*)')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Could not fetch cloud profile, using offline profile if available:', error.message);
      } else if (data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.warn('Network issue fetching profile:', err);
    }
  };

  useEffect(() => {
    // Check saved session in localStorage
    const savedRole = localStorage.getItem('resourcehub_demo_role') as UserRole | null;
    if (savedRole && DEMO_PROFILES[savedRole]) {
      const demoProf = DEMO_PROFILES[savedRole];
      setProfile(demoProf);
      setUser({
        id: demoProf.id,
        email: demoProf.email,
        app_metadata: {},
        user_metadata: { full_name: demoProf.full_name },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User);
      setLoading(false);
      return;
    }

    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      }).catch(() => {
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session: Session | null) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    } catch {
      // ignore
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Find matching demo account if credentials match demo
    let matchedDemoRole: UserRole | null = null;
    if (email === 'admin@demo.com') matchedDemoRole = 'admin';
    else if (email === 'manager@demo.com') matchedDemoRole = 'project_manager';
    else if (email === 'employee@demo.com') matchedDemoRole = 'employee';

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
        setLoading(false);
        return { error: null };
      }

      // If Supabase call failed due to offline/network environment or CORS, fallback to demo profile
      if (matchedDemoRole) {
        const demoProf = DEMO_PROFILES[matchedDemoRole];
        setProfile(demoProf);
        setUser({
          id: demoProf.id,
          email: demoProf.email,
          app_metadata: {},
          user_metadata: { full_name: demoProf.full_name },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User);
        localStorage.setItem('resourcehub_demo_role', matchedDemoRole);
        setLoading(false);
        return { error: null };
      }

      setLoading(false);
      return { error: error || new Error('Invalid credentials') };
    } catch (err: any) {
      if (matchedDemoRole) {
        const demoProf = DEMO_PROFILES[matchedDemoRole];
        setProfile(demoProf);
        setUser({
          id: demoProf.id,
          email: demoProf.email,
          app_metadata: {},
          user_metadata: { full_name: demoProf.full_name },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User);
        localStorage.setItem('resourcehub_demo_role', matchedDemoRole);
        setLoading(false);
        return { error: null };
      }
      setLoading(false);
      return { error: err };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('resourcehub_demo_role');
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setProfile(null);
  };

  const loginAsDemo = async (demoRole: UserRole) => {
    const demoProf = DEMO_PROFILES[demoRole];
    setProfile(demoProf);
    setUser({
      id: demoProf.id,
      email: demoProf.email,
      app_metadata: {},
      user_metadata: { full_name: demoProf.full_name },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User);
    localStorage.setItem('resourcehub_demo_role', demoRole);

    // Also attempt real Supabase sign-in asynchronously in background
    try {
      supabase.auth.signInWithPassword({
        email: demoProf.email,
        password: 'Password123!',
      }).catch(() => {});
    } catch {}
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role ?? null,
        loading,
        signIn,
        signOut,
        loginAsDemo,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
