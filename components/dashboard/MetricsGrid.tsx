
import React from 'react';
import { Coins, Trophy, Users, Zap } from 'lucide-react';

interface MetricsGridProps {
  bits: number;
  managerLevel: number; // ou XP
  totalAnimas: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ bits, managerLevel, totalAnimas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-black border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Saldo de Bits</h3>
          <Coins className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="flex items-baseline gap-1">
           <span className="text-3xl font-bold text-white font-mono">{bits}</span>
           <span className="text-xs text-zinc-500">BTS</span>
        </div>
      </div>

      <div className="bg-black border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Experiência</h3>
          <Zap className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="flex items-baseline gap-1">
           <span className="text-3xl font-bold text-white font-mono">{managerLevel}</span>
           <span className="text-xs text-zinc-500">XP</span>
        </div>
      </div>

      <div className="bg-black border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Animas Adotados</h3>
          <Users className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-1">
           <span className="text-3xl font-bold text-white font-mono">{totalAnimas}</span>
           <span className="text-xs text-zinc-500">Companheiros</span>
        </div>
      </div>
    </div>
  );
};
