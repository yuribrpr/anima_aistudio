
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface UserProfile {
  id: string; // References auth.users
  bits: number;
  manager_exp: number;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AnimaLevel = 'Rookie' | 'Champion' | 'Ultimate' | 'Mega';

export interface Anima {
  id: string;
  species: string;
  image_data: string; // Base64 ou URL
  level?: AnimaLevel;
  attack: number;
  defense: number;
  max_health: number;
  attack_speed: number;
  critical_chance: number;
  next_evolution_id?: string | null;
  
  // Joins (opcional, dependendo de como buscamos)
  next_evolution?: {
    species: string;
    image_data: string;
  };
}

export interface Enemy {
  id: string;
  species: string;
  image_data: string;
  level: string; // 'Easy', 'Medium', 'Hard', 'Boss'
  attack: number;
  defense: number;
  max_health: number;
  attack_speed: number;
  critical_chance: number;
  
  // Recompensas
  reward_exp: number;
  reward_bits: number;
}

export interface UserAnima {
  id: string;
  user_id: string;
  anima_id: string;
  nickname?: string;
  is_active: boolean;
  current_exp: number;
  
  // Atributos Extras (IVs/EVs)
  attack_extra: number;
  defense_extra: number;
  max_health_extra: number;
  
  created_at: string;
  
  // Join
  anima?: Anima;
}

export interface Activity {
  id: string;
  type: 'login' | 'update' | 'action' | 'alert';
  message: string;
  timestamp: string;
}

export type ViewState = 'overview' | 'library' | 'enemies' | 'adoption' | 'my-animas' | 'settings';
