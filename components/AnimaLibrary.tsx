
import React, { useState, useEffect } from 'react';
import { Anima, User } from '../types';
import { fetchAnimas, createAnima, updateAnima, deleteAnima } from '../services/animaService';
import { Modal } from './ui/Modal';
import { AnimaModal } from './AnimaModal';
import { Button } from './ui/Button';
import { Sidebar } from './Sidebar'; // Mantido para caso de uso isolado se houver
import { Plus, Search, Edit, Trash, Dna, Activity, Zap, Shield, Heart, Sparkles, Database, Terminal } from 'lucide-react';
import { SqlSetup } from './SqlSetup';

interface AnimaLibraryProps {
  user: User;
  onLogout: () => void;
  embedded?: boolean; // Nova prop para controlar renderização da Sidebar
}

export const AnimaLibrary: React.FC<AnimaLibraryProps> = ({ user, onLogout, embedded = false }) => {
  const [animas, setAnimas] = useState<Anima[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnima, setEditingAnima] = useState<Anima | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [setupRequired, setSetupRequired] = useState(false);

  const loadAnimas = async () => {
    try {
      setLoading(true);
      const data = await fetchAnimas();
      setAnimas(data);
      setSetupRequired(false);
    } catch (error: any) {
      console.error("Erro ao carregar animas:", error);
      if (
        error.message?.includes('does not exist') || 
        error.code === '42P01' ||
        error.message?.includes('Could not find the')
      ) {
        setSetupRequired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnimas();
  }, []);

  const handleSave = async (data: Omit<Anima, 'id'>) => {
    try {
      if (editingAnima) {
        await updateAnima(editingAnima.id, data);
      } else {
        await createAnima(data);
      }
      await loadAnimas();
      setIsModalOpen(false);
    } catch (e: any) {
      if (e.message?.includes('Could not find the') || e.code === '42703') {
         setSetupRequired(true);
      }
      throw e;
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('A exclusão é irreversível. Deseja continuar?')) {
      try {
        await deleteAnima(id);
        await loadAnimas();
      } catch (error) {
        console.error(error);
        alert('Erro ao deletar.');
      }
    }
  };

  const openNew = () => {
    setEditingAnima(null);
    setIsModalOpen(true);
  };

  const openEdit = (anima: Anima) => {
    setEditingAnima(anima);
    setIsModalOpen(true);
  };

  const filteredAnimas = animas.filter(a => 
    a.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNextEvolution = (id?: string | null) => {
    if (!id) return null;
    return animas.find(a => a.id === id);
  };

  // Se precisar de setup SQL
  if (setupRequired) {
    const content = (
      <SqlSetup 
         tableName="animas"
         onRetry={loadAnimas}
         sqlCommand={`-- 1. Adicionar coluna de nível
alter table animas add column if not exists level text;
notify pgrst, 'reload config';

-- OU: Criação completa
create table if not exists animas (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  species text not null,
  image_data text,
  level text,
  attack int default 0,
  defense int default 0,
  max_health int default 100,
  attack_speed float default 1.0,
  critical_chance float default 0.0,
  next_evolution_id uuid references animas(id)
);`}
      />
    );

    if (embedded) return <div className="p-8">{content}</div>;
    
    return (
      <div className="flex min-h-screen bg-black text-zinc-50 font-sans">
        <Sidebar currentView='library' onNavigate={()=>{}} onLogout={onLogout} />
        {content}
      </div>
    );
  }

  const content = (
    <div className="max-w-6xl mx-auto p-8 md:p-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Biblioteca de Animas</h1>
          <p className="text-sm text-zinc-400">Gerencie o código genético e evoluções da sua coleção.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
             <input 
               placeholder="Filtrar espécies..." 
               className="h-9 w-64 bg-black border border-zinc-800 rounded-md pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
           <Button onClick={openNew}>
             <Plus className="mr-2 h-4 w-4" /> Criar Anima
           </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[320px] rounded-lg border border-zinc-800 bg-zinc-900/20 animate-pulse"></div>
            ))}
         </div>
      ) : filteredAnimas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-lg bg-zinc-950/50">
          <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
            <Dna className="h-6 w-6 text-zinc-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">Nenhuma espécie encontrada</h3>
          <p className="text-zinc-500 text-sm mb-6 max-w-sm text-center">
            Sua biblioteca está vazia. Comece criando o primeiro Anima.
          </p>
          <Button variant="outline" onClick={openNew}>Criar primeira espécie</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimas.map((anima) => {
            const nextEvo = getNextEvolution(anima.next_evolution_id);
            return (
              <div key={anima.id} className="group relative bg-black border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-600 transition-colors flex flex-col h-full">
                
                {/* Card Header / Image */}
                <div className="relative h-48 bg-zinc-900 overflow-hidden">
                   {anima.image_data ? (
                     <img src={anima.image_data} alt={anima.species} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                   ) : (
                     <div className="flex items-center justify-center h-full text-zinc-700">
                       <Dna className="h-12 w-12 opacity-20" />
                     </div>
                   )}
                   
                   <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/60 to-transparent p-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="flex gap-1 ml-auto">
                        <Button size="icon" variant="secondary" className="h-7 w-7 bg-black/50 backdrop-blur-md border border-white/10" onClick={() => openEdit(anima)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="destructive" className="h-7 w-7 bg-red-950/50 backdrop-blur-md border border-red-500/20 text-red-400" onClick={() => handleDelete(anima.id)}>
                          <Trash className="h-3 w-3" />
                        </Button>
                     </div>
                   </div>
                   
                   {/* Level Badge */}
                   {anima.level && (
                     <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded text-[10px] font-medium text-white uppercase tracking-wider shadow-lg">
                       {anima.level}
                     </div>
                   )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white leading-none mb-1.5">{anima.species}</h3>
                      {nextEvo ? (
                        <div className="flex items-center gap-1.5 text-xs text-indigo-400">
                          <Sparkles className="h-3 w-3" />
                          <span>Evolui para {nextEvo.species}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">Forma Final</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-auto">
                     <StatRow icon={Heart} label="HP" value={anima.max_health} color="text-red-400" />
                     <StatRow icon={Activity} label="ATK" value={anima.attack} color="text-orange-400" />
                     <StatRow icon={Shield} label="DEF" value={anima.defense} color="text-blue-400" />
                     <StatRow icon={Zap} label="SPD" value={anima.attack_speed} color="text-yellow-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingAnima ? `Configurar ${editingAnima.species}` : 'Nova Espécie'}
      >
        <AnimaModal 
          initialData={editingAnima} 
          existingAnimas={animas}
          onSave={handleSave} 
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );

  if (embedded) {
    return content;
  }

  // Fallback para comportamento antigo
  return (
    <div className="flex min-h-screen bg-black text-zinc-50 font-sans selection:bg-zinc-800">
      <Sidebar currentView='library' onNavigate={()=>{}} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto max-h-screen">
        {content}
      </main>
    </div>
  );
};

const StatRow = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => (
  <div className="flex items-center justify-between text-xs">
    <div className="flex items-center gap-1.5 text-zinc-500">
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium">{label}</span>
    </div>
    <span className={`font-mono font-medium ${color}`}>{value}</span>
  </div>
);
