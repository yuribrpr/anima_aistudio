
import { supabase } from '../lib/supabase';
import { Activity } from '../types';

export const logActivity = async (userId: string, type: 'login' | 'update' | 'action' | 'alert', message: string) => {
  const { error } = await supabase
    .from('activities')
    .insert([
      { 
        user_id: userId, 
        type, 
        message, 
        timestamp: new Date().toISOString() 
      }
    ]);

  if (error) console.error('Erro ao logar atividade:', error);
};

export const fetchRecentActivities = async (userId: string): Promise<Activity[]> => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Erro ao buscar atividades:', error);
    return [];
  }

  // Mapear campos do banco para a interface se necessário
  return data.map((item: any) => ({
    id: item.id,
    type: item.type,
    message: item.message,
    timestamp: new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }));
};
