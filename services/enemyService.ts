
import { supabase } from '../lib/supabase';
import { Enemy } from '../types';

export const fetchEnemies = async (): Promise<Enemy[]> => {
  const { data, error } = await supabase
    .from('enemies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar inimigos:', error);
    throw error;
  }
  return data || [];
};

export const createEnemy = async (enemy: Omit<Enemy, 'id'>) => {
  const { data, error } = await supabase
    .from('enemies')
    .insert([enemy])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const updateEnemy = async (id: string, enemy: Partial<Enemy>) => {
  const { data, error } = await supabase
    .from('enemies')
    .update(enemy)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data?.[0];
};

export const deleteEnemy = async (id: string) => {
  const { error } = await supabase
    .from('enemies')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
