
import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { AnimaLibrary } from './components/AnimaLibrary';
import { User, AuthState } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
            role: 'user',
            createdAt: session.user.created_at
          },
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    // Ouvir mudanças no estado de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
            role: 'user',
            createdAt: session.user.created_at
          },
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authState.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-500 text-xs uppercase tracking-widest mt-4 animate-pulse">Carregando Biblioteca...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {authState.isAuthenticated ? (
        <AnimaLibrary user={authState.user!} onLogout={handleLogout} />
      ) : (
        <AuthPage onLogin={() => {}} /> 
      )}
    </div>
  );
};

export default App;
