
import React, { useEffect, useState } from 'react';
import { fetchAnimas } from '../services/animaService';
import { adoptAnima } from '../services/userAnimaService';
import { Anima, User } from '../types';
import { Button } from './ui/Button';
import { Dna, Heart, Sparkles, Egg } from 'lucide-react';
import { SqlSetup } from './SqlSetup';

interface AdoptionCenterProps {
  user: User;
  onNavigate: () => void;
}

export const AdoptionCenter: React.FC<AdoptionCenterProps> = ({ user, onNavigate }) => {
  const [rookies, setRookies] = useState<Anima[]>([]);
  const [loading, setLoading] = useState(true);
  const [adoptingId, setAdoptingId] = useState<string | null>(null);
  const [sqlMissing, setSqlMissing] = useState(false);

  const loadRookies = async () => {
    setLoading(true);
    setSqlMissing(false);
    try {
      const allAnimas = await fetchAnimas();
      // Filtra apenas Rookies
      const filtered = allAnimas.filter(a => a.level === 'Rookie');
      setRookies(filtered);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRookies();
  }, []);

  const handleAdopt = async (anima: Anima) => {
    setAdoptingId(anima.id);
    try {
      await adoptAnima(user.id, anima.id);
      // Redirecionar para My Animas ou mostrar sucesso
      onNavigate(); 
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        setSqlMissing(true);
      } else {
        alert('Erro ao adotar: ' + error.message);
      }
    } finally {
      setAdoptingId(null);
    }
  };

  if (sqlMissing) {
    return (
      <SqlSetup 
        tableName="user_animas"
        onRetry={() => { setSqlMissing(false); }} // Retry logic happens on button click inside SqlSetup usually or re-render
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
      <div className="flex flex-col gap-2 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Egg className="text-yellow-500" /> Centro de Adoção
        </h1>
        <p className="text-zinc-400">
          Inicie sua jornada adotando um Anima nível Rookie. Cada adoção gera um código genético único (atributos extras).
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1,2,3].map(i => <div key={i} className="h-64 bg-zinc-900/50 rounded-lg animate-pulse" />)}
        </div>
      ) : rookies.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/20 rounded-lg border border-zinc-800 border-dashed">
          <Dna className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-zinc-300">Nenhum Rookie Disponível</h3>
          <p className="text-zinc-500 text-sm mt-2">Peça para o administrador criar espécies de nível 'Rookie' na Biblioteca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rookies.map(anima => (
            <div key={anima.id} className="group relative bg-black border border-zinc-800 rounded-xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(234,179,8,0.2)]">
              
              <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                {anima.image_data ? (
                  <img src={anima.image_data} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Dna className="h-12 w-12 text-zinc-700" />
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider text-yellow-500 border border-yellow-500/20">
                  Rookie
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{anima.species}</h3>
                  <p className="text-xs text-zinc-500 font-mono">Genética Base</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                  <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
                    <span className="block text-[10px] uppercase text-zinc-500">HP Base</span>
                    <span className="text-white font-mono">{anima.max_health}</span>
                  </div>
                  <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
                    <span className="block text-[10px] uppercase text-zinc-500">Atk Base</span>
                    <span className="text-white font-mono">{anima.attack}</span>
                  </div>
                </div>

                <Button 
                  className="w-full group-hover:bg-yellow-500 group-hover:text-black transition-colors" 
                  onClick={() => handleAdopt(anima)}
                  isLoading={adoptingId === anima.id}
                >
                  <Heart className={`mr-2 h-4 w-4 ${adoptingId === anima.id ? '' : 'fill-current'}`} />
                  Adotar Companheiro
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
