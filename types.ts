
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: string;
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

export interface Activity {
  id: string;
  type: 'login' | 'update' | 'action' | 'alert';
  message: string;
  timestamp: string;
}
