import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface NormalizedUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

interface AuthContextType {
  user: NormalizedUser | null;
  role: 'admin' | 'user' | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name, avatar_url')
        .eq('id', userId)
        .single();

      if (email === 'kangpang06@gmail.com' || email === 'photo@photo.local') {
        setRole('admin');
        return {
          name: data?.name || 'ทีมโสตฯ (Photo)',
          avatar_url: data?.avatar_url || '',
        };
      }

      if (data) {
        setRole(data.role as 'admin' | 'user');
        return {
          name: data.name,
          avatar_url: data.avatar_url,
        };
      } else {
        // Fallback role assignment if profile isn't queried yet
        const defaultRole = (email === 'kangpang06@gmail.com' || email === 'photo@photo.local') ? 'admin' : 'user';
        setRole(defaultRole);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    return null;
  };

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email || '';
        const profile = await fetchUserProfile(session.user.id, email);
        
        setUser({
          uid: session.user.id,
          email,
          displayName: profile?.name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Anonymous',
          photoURL: profile?.avatar_url || session.user.user_metadata?.avatar_url || '',
        });
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    // Handle updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const profile = await fetchUserProfile(session.user.id, email);

        setUser({
          uid: session.user.id,
          email,
          displayName: profile?.name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Anonymous',
          photoURL: profile?.avatar_url || session.user.user_metadata?.avatar_url || '',
        });
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async () => {
    // Open Google Sign-In with Redirect
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('Login error:', error);
      alert('OAuth Failed: ' + error.message);
    }
  };

  const loginWithEmail = async (emailInput: string, passwordInput: string) => {
    let finalEmail = emailInput;
    let finalPassword = passwordInput;
    let isPhotoAccount = false;

    // Check if user is typing the simplified "photo" / "photo" credentials
    const cleanEmail = emailInput.trim().toLowerCase();
    if (cleanEmail === 'photo' && passwordInput === 'photo') {
      finalEmail = 'photo@photo.local';
      finalPassword = 'photophoto'; // At least 6 characters for Supabase
      isPhotoAccount = true;
    }

    let { data, error } = await supabase.auth.signInWithPassword({
      email: finalEmail,
      password: finalPassword,
    });

    if (error && isPhotoAccount) {
      // If the photo account doesn't exist yet, automatically auto-register it
      const signUpRes = await signUpWithEmail(finalEmail, finalPassword, 'ทีมโสตฯ (Photo)');
      if (!signUpRes.error) {
        // Retry sign-in now that it is registered
        const retryRes = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password: finalPassword,
        });
        return { error: retryRes.error };
      }
    }

    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, loginWithEmail, signUpWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
