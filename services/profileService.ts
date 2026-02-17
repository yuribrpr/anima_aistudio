
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // Se o erro for "não encontrado", pode ser que o trigger falhou ou usuário antigo.
    // Retornamos um objeto padrão ou null.
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
  
  return data;
};
