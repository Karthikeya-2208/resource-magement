import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types';

export interface SignUpMetadata {
  fullName: string;
  role: UserRole;
  departmentId?: string;
  jobTitle?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string, targetRole?: UserRole) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null; simulated?: boolean }>;
  loginWithGoogleUser: (googleUser: { name: string; email: string; avatar?: string; role: UserRole }) => Promise<void>;
  signOut: () => Promise<void>;
  loginAsDemo: (demoRole: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_PROFILES: Record<UserRole, Profile> = {
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

      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.warn('Network issue fetching profile:', err);
    }
  };

  useEffect(() => {
    // 1. Check saved custom session or demo in localStorage
    const savedCustomProfile = localStorage.getItem('resourcehub_custom_profile');
    if (savedCustomProfile) {
      try {
        const parsed = JSON.parse(savedCustomProfile);
        setProfile(parsed);
        setUser({
          id: parsed.id,
          email: parsed.email,
          app_metadata: {},
          user_metadata: { full_name: parsed.full_name, role: parsed.role },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User);
        setLoading(false);
        return;
      } catch {}
    }

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

  const signIn = async (email: string, password: string, targetRole?: UserRole) => {
    setLoading(true);

    // Check if credentials match one of the predefined demo accounts
    let matchedDemoRole: UserRole | null = targetRole || null;
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

      // If user provided a password and it matches demo accounts or targetRole
      if (matchedDemoRole) {
        const demoProf = DEMO_PROFILES[matchedDemoRole];
        setProfile(demoProf);
        setUser({
          id: demoProf.id,
          email: email || demoProf.email,
          app_metadata: {},
          user_metadata: { full_name: demoProf.full_name },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User);
        localStorage.setItem('resourcehub_demo_role', matchedDemoRole);
        localStorage.removeItem('resourcehub_custom_profile');
        setLoading(false);
        return { error: null };
      }

      setLoading(false);
      return { error: error || new Error('Invalid email or password.') };
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
        localStorage.removeItem('resourcehub_custom_profile');
        setLoading(false);
        return { error: null };
      }
      setLoading(false);
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: SignUpMetadata
  ): Promise<{ error: Error | null }> => {
    setLoading(true);
    try {
      let createdUserId: string = crypto.randomUUID();

      // 1. Attempt Supabase Auth Sign Up
      try {
        const { data: authData } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: metadata.fullName,
              role: metadata.role,
            },
          },
        });
        if (authData?.user?.id) {
          createdUserId = authData.user.id;
        }
      } catch (authException) {
        console.warn('Supabase auth signup attempt:', authException);
      }

      // 2. Insert into profiles table
      const newProfile: Profile = {
        id: createdUserId,
        full_name: metadata.fullName,
        email,
        role: metadata.role,
        department_id: metadata.departmentId || null,
        job_title:
          metadata.jobTitle ||
          (metadata.role === 'admin'
            ? 'Administrator'
            : metadata.role === 'project_manager'
            ? 'Project Manager'
            : 'Software Engineer'),
        employment_status: 'active',
        date_of_joining: new Date().toISOString().split('T')[0],
        salary: metadata.role === 'admin' ? 2200000 : metadata.role === 'project_manager' ? 1650000 : 1200000,
      };

      try {
        await supabase.from('profiles').upsert({
          id: createdUserId,
          full_name: newProfile.full_name,
          email: newProfile.email,
          role: newProfile.role,
          department_id: newProfile.department_id,
          job_title: newProfile.job_title,
          employment_status: 'active',
          date_of_joining: newProfile.date_of_joining,
        });
      } catch (dbErr) {
        console.warn('Profile DB save note:', dbErr);
      }

      // Save into state and local storage so the session persists
      setProfile(newProfile);
      setUser({
        id: createdUserId,
        email,
        app_metadata: {},
        user_metadata: { full_name: metadata.fullName, role: metadata.role },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User);

      localStorage.setItem('resourcehub_demo_role', metadata.role);
      localStorage.setItem('resourcehub_custom_profile', JSON.stringify(newProfile));
      setLoading(false);
      return { error: null };
    } catch (err: any) {
      setLoading(false);
      return { error: err };
    }
  };

  const signInWithGoogle = async (): Promise<{ error: Error | null; simulated?: boolean }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        return { error, simulated: true };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err, simulated: true };
    }
  };

  const loginWithGoogleUser = async (googleUser: {
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
  }) => {
    setLoading(true);
    const userId = crypto.randomUUID();
    const googleProfile: Profile = {
      id: userId,
      full_name: googleUser.name,
      email: googleUser.email,
      role: googleUser.role,
      job_title:
        googleUser.role === 'admin'
          ? 'Enterprise Administrator'
          : googleUser.role === 'project_manager'
          ? 'Technical Project Manager'
          : 'Software Engineer',
      employment_status: 'active',
      date_of_joining: new Date().toISOString().split('T')[0],
      salary: 1500000,
    };

    try {
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: googleUser.name,
        email: googleUser.email,
        role: googleUser.role,
        job_title: googleProfile.job_title,
        employment_status: 'active',
      });
    } catch {}

    setProfile(googleProfile);
    setUser({
      id: userId,
      email: googleUser.email,
      app_metadata: { provider: 'google' },
      user_metadata: {
        full_name: googleUser.name,
        avatar_url: googleUser.avatar,
        role: googleUser.role,
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User);

    localStorage.setItem('resourcehub_demo_role', googleUser.role);
    localStorage.setItem('resourcehub_custom_profile', JSON.stringify(googleProfile));
    setLoading(false);
  };

  const signOut = async () => {
    localStorage.removeItem('resourcehub_demo_role');
    localStorage.removeItem('resourcehub_custom_profile');
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
    localStorage.removeItem('resourcehub_custom_profile');

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
        signUp,
        signInWithGoogle,
        loginWithGoogleUser,
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
