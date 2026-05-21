import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check for local custom backend session
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    let localUser = null;
    if (savedUser && savedToken) {
      localUser = JSON.parse(savedUser);
      setUser(localUser);
    }

    // 2. Check for Supabase session (Google Auth)
    const checkSupabaseSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Map Supabase user to our local user format
        const supabaseUser = {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata.full_name,
          username: session.user.user_metadata.name || session.user.email.split('@')[0],
          avatarUrl: session.user.user_metadata.avatar_url,
          isGoogle: true // flag to identify Google users
        };
        setUser(supabaseUser);
      }
      setIsLoading(false);
    };

    checkSupabaseSession();

    // 3. Listen for Supabase Auth state changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const supabaseUser = {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata.full_name,
          username: session.user.user_metadata.name || session.user.email.split('@')[0],
          avatarUrl: session.user.user_metadata.avatar_url,
          isGoogle: true
        };
        setUser(supabaseUser);
      } else {
        // If Supabase logs out, check if we still have a local backend user
        const local = localStorage.getItem('user');
        if (local) {
          setUser(JSON.parse(local));
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Login for Custom Backend
  const loginWithCustomBackend = (loggedInUser, token) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    localStorage.setItem('token', token);
  };

  // Logout handles both Custom Backend and Supabase
  const logout = async () => {
    // Remove local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    setUser(null);
  };

  // Login with Google via Supabase
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      console.error('Error logging in with Google:', error.message);
      throw error;
    }
  };

  // Update user state globally
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    // Only update localStorage if it's a normal backend user
    if (!updatedUser.isGoogle) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      loginWithCustomBackend,
      loginWithGoogle,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
