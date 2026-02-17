
import { supabase } from '../lib/supabase';
import { UserAnima } from '../types';

export const fetchUserAnimas = async (userId: string): Promise<UserAnima[]> => {
  const { data, error } = await supabase
    .from('user_animas')
    .select(`
      *,
      anima:animas(*)
    `)
    .eq('user_id', userId)
    .order('is_active', { ascending: false }); // Ativo primeiro

  if (error) throw error;
  return data || [];
};

export const adoptAnima = async (userId: string, animaId: string, nickname?: string) => {
  // Gerar atributos extras aleatórios (0 a 15)
  const rng = (max: number) => Math.floor(Math.random() * max);
  
  const newAnima = {
    user_id: userId,
    anima_id: animaId,
    nickname: nickname || null,
    is_active: false, // Será setado manualmente depois ou lógica separada
    current_exp: 0,
    attack_extra: rng(15),
    defense_extra: rng(15),
    max_health_extra: rng(50),
  };

  // Verificar se é o primeiro anima do usuário (se sim, define como ativo)
  const { count } = await supabase
    .from('user_animas')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (count === 0) {
    newAnima.is_active = true;
  }

  const { data, error } = await supabase
    .from('user_animas')
    .insert([newAnima])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const setMainAnima = async (userId: string, userAnimaId: string) => {
  // 1. Desativar todos
  const { error: errorBatch } = await supabase
    .from('user_animas')
    .update({ is_active: false })
    .eq('user_id', userId);

  if (errorBatch) throw errorBatch;

  // 2. Ativar o escolhido
  const { error: errorUpdate } = await supabase
    .from('user_animas')
    .update({ is_active: true })
    .eq('id', userAnimaId);

  if (errorUpdate) throw errorUpdate;
};

export const deleteUserAnima = async (id: string) => {
  const { error } = await supabase
    .from('user_animas')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
