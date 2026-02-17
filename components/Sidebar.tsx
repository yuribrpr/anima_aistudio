
import React from 'react';
import { Dna, LogOut, Settings, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navItems = [
    { name: 'Visão Geral', icon: LayoutGrid, active: false },
    { name: 'Animas', icon: Dna, active: true },
    { name: 'Configurações', icon: Settings, active: false },
  ];

  return (
    <aside className="w-64 bg-black border-r border-zinc-800 flex flex-col hidden md:flex sticky top-0 h-screen">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="black"/>
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Nexus</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all ${
                item.active 
                  ? 'bg-zinc-900 text-white font-medium' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <item.icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-zinc-500'}`} />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-4 px-2">
           <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700"></div>
           <div className="flex flex-col">
             <span className="text-xs font-medium text-white">Admin User</span>
             <span className="text-[10px] text-zinc-500">admin@nexus.com</span>
           </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-zinc-500 hover:text-red-400 transition-colors text-xs font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair da conta
        </button>
      </div>
    </aside>
  );
};
