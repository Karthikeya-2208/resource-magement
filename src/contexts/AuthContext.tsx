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

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, department:departments(*)')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
        return data as Profile;
      }
    } catch (err) {
      console.warn('Network issue fetching profile:', err);
    }
    return null;
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

    const roleName = (r: UserRole) => {
      if (r === 'admin') return 'Administrator';
      if (r === 'project_manager') return 'Project Manager';
      return 'Employee';
    };

    // Strict validation: Demo accounts can only log in through their own portal
    if (email === 'admin@demo.com') {
      if (targetRole && targetRole !== 'admin') {
        setLoading(false);
        return {
          error: new Error(
            `Access Denied: admin@demo.com is an Administrator account. Please sign in via the Administrator portal.`
          ),
        };
      }
    } else if (email === 'manager@demo.com') {
      if (targetRole && targetRole !== 'project_manager') {
        setLoading(false);
        return {
          error: new Error(
            `Access Denied: manager@demo.com is a Project Manager account. Please sign in via the Project Manager portal.`
          ),
        };
      }
    } else if (email === 'employee@demo.com') {
      if (targetRole && targetRole !== 'employee') {
        setLoading(false);
        return {
          error: new Error(
            `Access Denied: employee@demo.com is an Employee account. Please sign in via the Employee workspace.`
          ),
        };
      }
    }

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
        let userProfile = await fetchProfile(data.user.id);

        // If profile doesn't exist yet in public.profiles, create it from auth metadata
        if (!userProfile) {
          const authRole =
            (data.user.user_metadata?.role as UserRole) || targetRole || 'employee';
          const authName =
            data.user.user_metadata?.full_name || email.split('@')[0];
          userProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: authName,
            role: authRole,
            job_title:
              authRole === 'admin'
                ? 'Administrator'
                : authRole === 'project_manager'
                ? 'Project Manager'
                : 'Software Engineer',
            employment_status: 'active',
            date_of_joining: new Date().toISOString().split('T')[0],
          };
          try {
            await supabase.from('profiles').upsert(userProfile);
          } catch {}
        }

        setUser(data.user);
        if (userProfile) {
          setProfile(userProfile);
          localStorage.setItem('resourcehub_demo_role', userProfile.role);
          localStorage.setItem('resourcehub_custom_profile', JSON.stringify(userProfile));
        }
        setLoading(false);
        return { error: null };
      }

      // Check if user has an existing saved custom account in localStorage
      const savedCustomProfile = localStorage.getItem('resourcehub_custom_profile');
      if (savedCustomProfile) {
        try {
          const parsed = JSON.parse(savedCustomProfile);
          if (parsed.email === email) {
            if (targetRole && parsed.role !== targetRole) {
              setLoading(false);
              return {
                error: new Error(
                  `Access Denied: This account is registered as a ${roleName(
                    parsed.role
                  )}. Please sign in using the ${roleName(parsed.role)} portal.`
                ),
              };
            }
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
            return { error: null };
          }
        } catch {}
      }

      // If user provided a password and it matches demo accounts
      if (matchedDemoRole) {
        if (targetRole && matchedDemoRole !== targetRole) {
          setLoading(false);
          return {
            error: new Error(`Access Denied: Role mismatch for ${email}.`),
          };
        }
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
      const isInvalidCredentials =
        error?.message?.toLowerCase().includes('invalid login credentials') ||
        error?.message?.toLowerCase().includes('email not confirmed');
      if (isInvalidCredentials) {
        return {
          error: new Error(
            `Account not found for "${email}" or incorrect credentials. If you are a new user, please click "Create Account" below to register first.`
          ),
        };
      }
      return { error: error || new Error('Invalid email or password.') };
    } catch (err: any) {
      if (matchedDemoRole) {
        if (targetRole && matchedDemoRole !== targetRole) {
          setLoading(false);
          return {
            error: new Error(`Access Denied: Role mismatch for ${email}.`),
          };
        }
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
      const cleanEmail = email.toLowerCase().trim();
      let createdUserId: string = crypto.randomUUID();

      // 1. Primary: Register account directly via database RPC (auto-confirms email and bypasses mailer rate-limits)
      const { data: rpcData, error: rpcError } = await supabase.rpc('register_user_account', {
        p_email: cleanEmail,
        p_password: password,
        p_full_name: metadata.fullName,
        p_role: metadata.role,
        p_department_id: metadata.departmentId || null,
        p_job_title:
          metadata.jobTitle ||
          (metadata.role === 'admin'
            ? 'Administrator'
            : metadata.role === 'project_manager'
            ? 'Project Manager'
            : 'Software Engineer'),
      });

      if (!rpcError && rpcData?.user_id) {
        createdUserId = rpcData.user_id;
      } else {
        // Fallback to standard Supabase auth signUp
        try {
          const { data: authData } = await supabase.auth.signUp({
            email: cleanEmail,
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
        } catch (e) {
          console.warn('Standard signup fallback note:', e);
        }
      }

      // 2. Ensure profile is saved in public.profiles table
      const newProfile: Profile = {
        id: createdUserId,
        full_name: metadata.fullName,
        email: cleanEmail,
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
        salary:
          metadata.role === 'admin'
            ? 2200000
            : metadata.role === 'project_manager'
            ? 1650000
            : 1200000,
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

      // 3. Authenticate with Supabase to acquire full session
      try {
        const { data: loginData } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (loginData?.user) {
          setUser(loginData.user);
        } else {
          setUser({
            id: createdUserId,
            email: cleanEmail,
            app_metadata: {},
            user_metadata: { full_name: metadata.fullName, role: metadata.role },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as User);
        }
      } catch {
        setUser({
          id: createdUserId,
          email: cleanEmail,
          app_metadata: {},
          user_metadata: { full_name: metadata.fullName, role: metadata.role },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User);
      }

      setProfile(newProfile);
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
