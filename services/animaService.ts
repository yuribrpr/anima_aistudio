
import { supabase } from '../lib/supabase';
import { Anima } from '../types';

export const fetchAnimas = async (): Promise<Anima[]> => {
  // Simplificado para evitar erro de 'schema cache' em self-joins.
  // A relação será resolvida no frontend, já que temos todos os dados.
  const { data, error } = await supabase
    .from('animas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar animas:', error);
    throw error;
  }
  return data || [];
};

export const createAnima = async (anima: Omit<Anima, 'id'>) => {
  const { data, error } = await supabase
    .from('animas')
    .insert([anima])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const updateAnima = async (id: string, anima: Partial<Anima>) => {
  const { data, error } = await supabase
    .from('animas')
    .update(anima)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data?.[0];
};

export const deleteAnima = async (id: string) => {
  const { error } = await supabase
    .from('animas')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
