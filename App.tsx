
import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { AnimaLibrary } from './components/AnimaLibrary';
import { AdoptionCenter } from './components/AdoptionCenter';
import { MyAnimas } from './components/MyAnimas';
import { EnemyLibrary } from './components/EnemyLibrary';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { User, AuthState, ViewState } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [currentView, setCurrentView] = useState<ViewState>('overview');

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
        <p className="text-slate-500 text-xs uppercase tracking-widest mt-4 animate-pulse">Carregando Nexus...</p>
      </div>
    );
  }

  // Renderização da view atual
  const renderView = () => {
    if (!authState.user) return null;

    switch (currentView) {
      case 'overview':
        return (
          <div className="flex min-h-screen bg-black text-zinc-50 font-sans selection:bg-zinc-800">
             <Sidebar 
               currentView={currentView} 
               onNavigate={setCurrentView} 
               onLogout={handleLogout} 
               userEmail={authState.user.email}
             />
             <main className="flex-1 overflow-y-auto max-h-screen bg-black">
                 <Dashboard user={authState.user} />
             </main>
          </div>
        );

      case 'library':
        return (
          <div className="flex min-h-screen bg-black text-zinc-50 font-sans selection:bg-zinc-800">
             <Sidebar 
               currentView={currentView} 
               onNavigate={setCurrentView} 
               onLogout={handleLogout} 
               userEmail={authState.user.email}
             />
             <div className="flex-1 overflow-y-auto max-h-screen">
                 <AnimaLibraryWrapper user={authState.user} onLogout={handleLogout} />
             </div>
          </div>
        );

      case 'enemies':
        return (
          <div className="flex min-h-screen bg-black text-zinc-50 font-sans selection:bg-zinc-800">
            <Sidebar 
               currentView={currentView} 
               onNavigate={setCurrentView} 
               onLogout={handleLogout} 
               userEmail={authState.user.email}
             />
            <main className="flex-1 overflow-y-auto max-h-screen bg-black">
              <EnemyLibrary />
            </main>
          </div>
        );
      
      case 'adoption':
        return (
          <div className="flex min-h-screen bg-black text-zinc-50 font-sans selection:bg-zinc-800">
            <Sidebar 
               currentView={currentView} 
               onNavigate={setCurrentView} 
               onLogout={handleLogout} 
               userEmail={authState.user.email}
             />
            <main className="flex-1 overflow-y-auto max-h-screen bg-black">
              <AdoptionCenter user={authState.user} onNavigate={() => setCurrentView('my-animas')} />
            </main>
          </div>
        );

      case 'my-animas':
      default:
        return (
          <div className="flex min-h-screen bg-black text-zinc-50 font-sans selection:bg-zinc-800">
             <Sidebar 
               currentView={currentView} 
               onNavigate={setCurrentView} 
               onLogout={handleLogout} 
               userEmail={authState.user.email}
             />
            <main className="flex-1 overflow-y-auto max-h-screen bg-black">
              <MyAnimas user={authState.user} onNavigateToAdoption={() => setCurrentView('adoption')} />
            </main>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {authState.isAuthenticated ? (
        renderView()
      ) : (
        <AuthPage onLogin={() => {}} /> 
      )}
    </div>
  );
};

// Wrapper temporário
const AnimaLibraryWrapper = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  return <AnimaLibrary user={user} onLogout={onLogout} embedded={true} />;
};

export default App;
