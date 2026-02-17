
import React, { useEffect, useState } from 'react';
import { User, Activity, UserProfile } from '../types';
import { fetchUserProfile } from '../services/profileService';
import { fetchUserAnimas } from '../services/userAnimaService';
import { fetchRecentActivities } from '../services/activityService';
import { MetricsGrid } from './dashboard/MetricsGrid';
import { RecentActivity } from './dashboard/RecentActivity';
import { getAIInsight } from '../services/geminiService';
import { Sparkles, LayoutDashboard } from 'lucide-react';
import { SqlSetup } from './SqlSetup';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [totalAnimas, setTotalAnimas] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [aiMessage, setAiMessage] = useState<{ greeting: string; insight: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sqlMissing, setSqlMissing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setSqlMissing(false);
    try {
      const [userProfile, animas, recentActivities] = await Promise.all([
        fetchUserProfile(user.id),
        fetchUserAnimas(user.id),
        fetchRecentActivities(user.id)
      ]);

      setProfile(userProfile);
      setTotalAnimas(animas.length);
      setActivities(recentActivities);

      // Carregar insight AI em background
      getAIInsight(user.name).then(setAiMessage).catch(console.error);

    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        setSqlMissing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  if (sqlMissing) {
    return (
      <SqlSetup 
        tableName="profiles" 
        sqlCommand={`-- Rodar o script completo fornecido anteriormente`} 
        onRetry={loadData} 
      />
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Header com Saudação AI */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <LayoutDashboard className="text-zinc-500" /> 
          {aiMessage ? aiMessage.greeting : `Olá, ${user.name}`}
        </h1>
        {aiMessage && (
          <div className="flex items-center gap-2 text-indigo-400 text-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Sparkles className="h-3 w-3" />
            <p>"{aiMessage.insight}"</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1,2,3].map(i => <div key={i} className="h-32 bg-zinc-900/50 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <MetricsGrid 
          bits={profile?.bits || 0} 
          managerLevel={profile?.manager_exp || 0} 
          totalAnimas={totalAnimas} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-semibold text-white">Atividade Recente</h2>
          </div>
          {loading ? (
            <div className="space-y-4">
               {[1,2].map(i => <div key={i} className="h-16 bg-zinc-900/30 rounded animate-pulse" />)}
            </div>
          ) : (
            <RecentActivity activities={activities} />
          )}
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-semibold text-white">Status do Sistema</h2>
          </div>
          <div className="bg-black border border-zinc-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Banco de Dados</span>
              <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Versão da API</span>
              <span className="text-zinc-200 font-mono">v1.2.0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Latência</span>
              <span className="text-zinc-200 font-mono">24ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
