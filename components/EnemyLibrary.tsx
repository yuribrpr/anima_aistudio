
import React, { useState, useEffect } from 'react';
import { Enemy } from '../types';
import { fetchEnemies, createEnemy, updateEnemy, deleteEnemy } from '../services/enemyService';
import { Modal } from './ui/Modal';
import { EnemyModal } from './EnemyModal';
import { Button } from './ui/Button';
import { Plus, Search, Edit, Trash, Skull, Activity, Shield, Heart, Zap, Coins, Sparkles } from 'lucide-react';
import { SqlSetup } from './SqlSetup';

export const EnemyLibrary: React.FC = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnemy, setEditingEnemy] = useState<Enemy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [setupRequired, setSetupRequired] = useState(false);

  const loadEnemies = async () => {
    try {
      setLoading(true);
      const data = await fetchEnemies();
      setEnemies(data);
      setSetupRequired(false);
    } catch (error: any) {
      console.error("Erro ao carregar inimigos:", error);
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
    loadEnemies();
  }, []);

  const handleSave = async (data: Omit<Enemy, 'id'>) => {
    try {
      if (editingEnemy) {
        await updateEnemy(editingEnemy.id, data);
      } else {
        await createEnemy(data);
      }
      await loadEnemies();
      setIsModalOpen(false);
    } catch (e: any) {
       if (e.message?.includes('does not exist')) setSetupRequired(true);
       throw e;
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este inimigo do bestiário?')) {
      try {
        await deleteEnemy(id);
        await loadEnemies();
      } catch (error) {
        console.error(error);
        alert('Erro ao deletar.');
      }
    }
  };

  const openNew = () => {
    setEditingEnemy(null);
    setIsModalOpen(true);
  };

  const openEdit = (enemy: Enemy) => {
    setEditingEnemy(enemy);
    setIsModalOpen(true);
  };

  const filteredEnemies = enemies.filter(e => 
    e.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (setupRequired) {
    return (
      <SqlSetup 
        tableName="enemies"
        onRetry={loadEnemies}
        sqlCommand={`-- 1. Criar tabela de inimigos
create table if not exists enemies (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  species text not null,
  image_data text,
  level text,
  attack int default 10,
  defense int default 5,
  max_health int default 100,
  attack_speed float default 1.0,
  critical_chance float default 5.0,
  reward_exp int default 10,
  reward_bits int default 5
);

-- 2. Habilitar RLS e políticas
alter table enemies enable row level security;
create policy "Enemies are viewable by everyone" on enemies for select using (true);
create policy "Authenticated users can insert enemies" on enemies for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update enemies" on enemies for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete enemies" on enemies for delete using (auth.role() = 'authenticated');`}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 md:p-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Skull className="text-red-500" /> Bestiário (Inimigos)
          </h1>
          <p className="text-sm text-zinc-400">Gerencie os oponentes que os usuários enfrentarão em batalha.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
             <input 
               placeholder="Filtrar inimigos..." 
               className="h-9 w-64 bg-black border border-zinc-800 rounded-md pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-900 transition-all"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
           <Button onClick={openNew} className="bg-red-900 hover:bg-red-800 text-white border-none">
             <Plus className="mr-2 h-4 w-4" /> Criar Inimigo
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
      ) : filteredEnemies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-lg bg-zinc-950/50">
          <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
            <Skull className="h-6 w-6 text-zinc-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">Nenhum inimigo registrado</h3>
          <p className="text-zinc-500 text-sm mb-6 max-w-sm text-center">
            O mundo está seguro... por enquanto. Crie ameaças para desafiar os jogadores.
          </p>
          <Button variant="outline" onClick={openNew}>Criar primeira ameaça</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnemies.map((enemy) => (
            <div key={enemy.id} className="group relative bg-black border border-zinc-800 rounded-lg overflow-hidden hover:border-red-900/50 transition-colors flex flex-col h-full hover:shadow-[0_0_20px_-10px_rgba(220,38,38,0.2)]">
              
              {/* Card Header / Image */}
              <div className="relative h-48 bg-zinc-900 overflow-hidden">
                 {enemy.image_data ? (
                   <img src={enemy.image_data} alt={enemy.species} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0" />
                 ) : (
                   <div className="flex items-center justify-center h-full text-zinc-700">
                     <Skull className="h-12 w-12 opacity-20" />
                   </div>
                 )}
                 
                 <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent p-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="flex gap-1 ml-auto">
                      <Button size="icon" variant="secondary" className="h-7 w-7 bg-black/50 backdrop-blur-md border border-white/10" onClick={() => openEdit(enemy)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-7 w-7 bg-red-950/50 backdrop-blur-md border border-red-500/20 text-red-400" onClick={() => handleDelete(enemy.id)}>
                        <Trash className="h-3 w-3" />
                      </Button>
                   </div>
                 </div>
                 
                 {/* Level Badge */}
                 <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-red-950/80 backdrop-blur-sm border border-red-500/20 rounded text-[10px] font-bold text-red-200 uppercase tracking-wider shadow-lg">
                   {enemy.level}
                 </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none mb-1.5">{enemy.species}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-red-700" /> {enemy.max_health}</span>
                      <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                      <span className="flex items-center gap-1"><Activity className="h-3 w-3 text-red-700" /> {enemy.attack}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-900">
                   <div className="flex items-center justify-between text-xs">
                     <span className="text-zinc-500 uppercase font-medium tracking-wide">Drops:</span>
                     <div className="flex gap-3">
                       <span className="flex items-center gap-1.5 text-indigo-400 font-mono">
                         <Sparkles className="h-3 w-3" /> +{enemy.reward_exp} XP
                       </span>
                       <span className="flex items-center gap-1.5 text-yellow-500 font-mono">
                         <Coins className="h-3 w-3" /> +{enemy.reward_bits}
                       </span>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingEnemy ? `Editar ${editingEnemy.species}` : 'Novo Inimigo'}
      >
        <EnemyModal 
          initialData={editingEnemy} 
          onSave={handleSave} 
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};
