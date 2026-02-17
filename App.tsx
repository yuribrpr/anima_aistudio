import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { AnimaLibrary } from './components/AnimaLibrary';
import { AdoptionCenter } from './components/AdoptionCenter';
import { MyAnimas } from './components/MyAnimas';
import { Sidebar } from './components/Sidebar';
import { User, AuthState, ViewState } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [currentView, setCurrentView] = useState<ViewState>('my-animas');

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
      case 'library':
        // A biblioteca usa seu proprio sidebar internamente no código antigo, vamos refatorar para usar o layout global aqui
        // Para manter compatibilidade com o codigo anterior da AnimaLibrary que tinha Sidebar embutida,
        // renderizamos ela sem a Sidebar aqui se a prop 'user' for passada, ou ajustamos o componente AnimaLibrary.
        // Como o componente AnimaLibrary já tem a Sidebar hardcoded no arquivo anterior, 
        // vamos usá-lo como "Pagina inteira" por enquanto, mas o ideal seria refatorar.
        // HACK: Renderizar AnimaLibrary que já contém a Sidebar, mas passando uma prop dummy se precisar.
        // Para consistência com as novas telas, vamos renderizar o layout aqui.
        return (
          <div className="flex min-h-screen bg-black text-zinc-50 font-sans selection:bg-zinc-800">
             <Sidebar 
               currentView={currentView} 
               onNavigate={setCurrentView} 
               onLogout={handleLogout} 
               userEmail={authState.user.email}
             />
             <div className="flex-1 overflow-y-auto max-h-screen">
                {/* Precisamos ajustar AnimaLibrary para não renderizar a Sidebar duplicada se possivel, 
                    ou aceitar que por enquanto ela tem a sidebar dela. 
                    Vou ajustar AnimaLibrary abaixo para aceitar uma prop 'standalone' ou similar.
                    Mas para simplificar sem mudar tudo, vou renderizar o conteúdo da Library envelopado.
                 */}
                 <AnimaLibraryWrapper user={authState.user} onLogout={handleLogout} />
             </div>
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

// Wrapper temporário para reutilizar a lógica da Library mas remover a Sidebar duplicada visualmente 
// (Isso exigiria mudar o AnimaLibrary.tsx para aceitar não renderizar Sidebar, farei essa mudança no arquivo AnimaLibrary)

const AnimaLibraryWrapper = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  // Este componente existe apenas para satisfazer a estrutura do switch case
  // A AnimaLibrary original será modificada para não renderizar a sidebar se estiver em modo 'embedded'
  return <AnimaLibrary user={user} onLogout={onLogout} embedded={true} />;
};

export default App;