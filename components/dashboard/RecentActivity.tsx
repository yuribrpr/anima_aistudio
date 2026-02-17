
import React from 'react';
import { Activity } from '../../types';
import { Clock, History } from 'lucide-react';

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className="space-y-6">
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#1f1f1f] rounded-lg">
          <History className="h-8 w-8 text-[#222] mb-3" />
          <p className="text-[#444] text-[13px] italic">Nenhum evento registrado no cluster.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-[#1f1f1f]"></div>
          <div className="space-y-8">
            {activities.map((activity) => (
              <div key={activity.id} className="relative pl-6 group">
                {/* Dot */}
                <div className="absolute left-0 top-1.5 w-[7px] h-[7px] rounded-full bg-[#333] group-hover:bg-white border border-black transition-all z-10 shadow-[0_0_8px_rgba(255,255,255,0.05)]"></div>
                
                <div className="space-y-1.5">
                  <p className="text-[13px] font-medium text-[#ccc] group-hover:text-white transition-colors leading-relaxed">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#444] font-bold uppercase tracking-wider">
                    <Clock className="h-3 w-3" />
                    {activity.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-8 pt-4 border-t border-[#1f1f1f]">
        <button className="text-[11px] text-[#666] hover:text-white transition-all font-bold uppercase tracking-widest flex items-center gap-2">
          Ver Histórico Completo <History className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
