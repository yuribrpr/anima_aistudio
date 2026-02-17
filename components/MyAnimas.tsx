
import React, { useEffect, useState } from 'react';
import { fetchUserAnimas, setMainAnima, deleteUserAnima } from '../services/userAnimaService';
import { UserAnima, User } from '../types';
import { Button } from './ui/Button';
import { Crown, Zap, Shield, Heart, Trash2, Activity } from 'lucide-react';
import { SqlSetup } from './SqlSetup';

interface MyAnimasProps {
  user: User;
  onNavigateToAdoption: () => void;
}

export const MyAnimas: React.FC<MyAnimasProps> = ({ user, onNavigateToAdoption }) => {
  const [myAnimas, setMyAnimas] = useState<UserAnima[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [sqlMissing, setSqlMissing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setSqlMissing(false);
    try {
      const data = await fetchUserAnimas(user.id);
      setMyAnimas(data);
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

  const handleSetMain = async (id: string) => {
    setProcessingId(id);
    try {
      await setMainAnima(user.id, id);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Erro ao definir principal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja libertar este Anima? Esta ação não pode ser desfeita.")) return;
    setProcessingId(id);
    try {
      await deleteUserAnima(id);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Erro ao remover');
    } finally {
      setProcessingId(null);
    }
  };

  if (sqlMissing) {
    return (
      <SqlSetup 
        tableName="user_animas"
        onRetry={loadData}
        sqlCommand={`create table if not exists user_animas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  anima_id uuid references animas(id) not null,
  nickname text,
  is_active boolean default false,
  current_exp int default 0,
  attack_extra int default 0,
  defense_extra int default 0,
  max_health_extra int default 0,
  created_at timestamptz default now()
);`}
      />
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
             <Crown className="text-indigo-500" /> Meus Animas
           </h1>
           <p className="text-zinc-400 mt-1">
             Gerencie seu esquadrão. O Anima marcado como <span className="text-indigo-400 font-medium">Principal</span> será usado em batalhas.
           </p>
        </div>
        <Button onClick={onNavigateToAdoption}>
           Adotar Novo
        </Button>
      </div>

      {loading ? (
         <div className="space-y-4">
            {[1,2].map(i => <div key={i} className="h-40 bg-zinc-900/50 rounded-lg animate-pulse" />)}
         </div>
      ) : myAnimas.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/20 border border-zinc-800 border-dashed rounded-xl">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-medium text-white">Você ainda não tem companheiros</h3>
            <p className="text-zinc-500 mt-2 mb-6">Vá ao centro de adoção para começar sua jornada.</p>
            <Button onClick={onNavigateToAdoption}>Ir para Adoção</Button>
         </div>
      ) : (
        <div className="space-y-4">
          {myAnimas.map((ua) => {
            const base = ua.anima!;
            const totalHp = (base.max_health || 0) + ua.max_health_extra;
            const totalAtk = (base.attack || 0) + ua.attack_extra;
            const totalDef = (base.defense || 0) + ua.defense_extra;
            
            return (
              <div 
                key={ua.id} 
                className={`
                  relative flex flex-col md:flex-row bg-black rounded-xl overflow-hidden transition-all duration-300
                  ${ua.is_active 
                    ? 'border-2 border-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]' 
                    : 'border border-zinc-800 hover:border-zinc-600'
                  }
                `}
              >
                {/* Active Indicator Strip */}
                {ua.is_active && (
                   <div className="absolute top-0 left-0 right-0 md:bottom-0 md:right-auto md:w-1 bg-indigo-500 z-10" />
                )}

                {/* Image Section */}
                <div className="relative md:w-48 h-48 md:h-auto bg-zinc-900 shrink-0">
                  {base.image_data ? (
                    <img src={base.image_data} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Zap className="h-10 w-10 text-zinc-700" />
                    </div>
                  )}
                  {ua.is_active && (
                    <div className="absolute top-3 left-3 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">
                      Principal
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur border border-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {base.level || 'Unknown'}
                  </div>
                </div>

                {/* Stats Section */}
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {ua.nickname || base.species}
                        {ua.nickname && <span className="text-sm text-zinc-500 font-normal">({base.species})</span>}
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono mt-1">ID: {ua.id.slice(0, 8)}...</p>
                    </div>
                    
                    {!ua.is_active && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
                          onClick={() => handleDelete(ua.id)}
                          isLoading={processingId === ua.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                     <StatDisplay 
                       icon={Heart} 
                       label="Vida Total" 
                       base={base.max_health} 
                       extra={ua.max_health_extra} 
                       color="text-red-400" 
                     />
                     <StatDisplay 
                       icon={Activity} 
                       label="Ataque" 
                       base={base.attack} 
                       extra={ua.attack_extra} 
                       color="text-orange-400" 
                     />
                     <StatDisplay 
                       icon={Shield} 
                       label="Defesa" 
                       base={base.defense} 
                       extra={ua.defense_extra} 
                       color="text-blue-400" 
                     />
                  </div>

                  <div className="flex items-center justify-end border-t border-zinc-800 pt-4">
                     {ua.is_active ? (
                       <span className="text-sm text-indigo-400 font-medium flex items-center gap-2 select-none">
                         <Crown className="h-4 w-4 fill-current" /> Selecionado para Batalha
                       </span>
                     ) : (
                       <Button 
                         variant="secondary" 
                         size="sm"
                         onClick={() => handleSetMain(ua.id)}
                         isLoading={processingId === ua.id}
                         className="w-full md:w-auto"
                       >
                         Definir como Principal
                       </Button>
                     )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const StatDisplay = ({ icon: Icon, label, base, extra, color }: any) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-medium">
      <Icon className="h-3.5 w-3.5" /> {label}
    </div>
    <div className="flex items-baseline gap-1.5">
       <span className={`text-xl font-bold font-mono text-white`}>{base + extra}</span>
       <span className={`text-xs font-mono ${color}`}>
         ({base} <span className="text-zinc-600">+ {extra}</span>)
       </span>
    </div>
    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-1 flex">
       <div className="h-full bg-zinc-600" style={{ width: '70%' }}></div>
       <div className={`h-full ${color.replace('text-', 'bg-')}`} style={{ width: '15%' }}></div>
    </div>
  </div>
);
