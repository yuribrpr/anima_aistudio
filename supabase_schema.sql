-- ATENÇÃO: Execute este script no SQL Editor do Supabase para configurar todo o banco de dados.

-- 1. Habilitar extensões necessárias
create extension if not exists "uuid-ossp";

-- 2. Tabela de Espécies de Animas (Biblioteca Geral)
create table if not exists public.animas (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  species text not null,
  image_data text,
  level text, -- 'Rookie', 'Champion', 'Ultimate', 'Mega'
  attack int default 0,
  defense int default 0,
  max_health int default 100,
  attack_speed float default 1.0,
  critical_chance float default 0.0,
  next_evolution_id uuid references public.animas(id)
);

-- 3. Tabela de Inimigos (Bestiário)
create table if not exists public.enemies (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  species text not null,
  image_data text,
  level text, -- 'Easy', 'Medium', 'Hard', 'Boss'
  attack int default 10,
  defense int default 5,
  max_health int default 100,
  attack_speed float default 1.0,
  critical_chance float default 5.0,
  reward_exp int default 10,
  reward_bits int default 5
);

-- 4. Tabela de Profiles (Dados do Usuário: Bits, XP Global)
-- Esta tabela estende auth.users
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamptz default now(),
  bits int default 0,
  manager_exp int default 0
);

-- Trigger para criar profile automaticamente quando usuário se registra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Associar trigger apenas se não existir (evita erro de duplicidade se rodar script 2x)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 5. Tabela de Animas dos Usuários (Instâncias Adotadas)
create table if not exists public.user_animas (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) not null,
  anima_id uuid references public.animas(id) not null,
  nickname text,
  is_active boolean default false,
  current_exp int default 0,
  attack_extra int default 0,
  defense_extra int default 0,
  max_health_extra int default 0,
  created_at timestamptz default now()
);

-- 6. Tabela de Atividades (Logs de Ações)
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  timestamp timestamptz default now(),
  user_id uuid references auth.users(id),
  type text,
  message text
);

-- 7. Configuração de Políticas de Segurança (RLS)

-- Habilitar RLS nas tabelas
alter table public.animas enable row level security;
alter table public.enemies enable row level security;
alter table public.user_animas enable row level security;
alter table public.activities enable row level security;
alter table public.profiles enable row level security;

-- Políticas para 'animas'
drop policy if exists "Animas are viewable by everyone" on public.animas;
create policy "Animas are viewable by everyone" on public.animas for select using (true);

drop policy if exists "Authenticated users can insert animas" on public.animas;
create policy "Authenticated users can insert animas" on public.animas for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update animas" on public.animas;
create policy "Authenticated users can update animas" on public.animas for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete animas" on public.animas;
create policy "Authenticated users can delete animas" on public.animas for delete using (auth.role() = 'authenticated');

-- Políticas para 'enemies'
drop policy if exists "Enemies are viewable by everyone" on public.enemies;
create policy "Enemies are viewable by everyone" on public.enemies for select using (true);

drop policy if exists "Authenticated users can insert enemies" on public.enemies;
create policy "Authenticated users can insert enemies" on public.enemies for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update enemies" on public.enemies;
create policy "Authenticated users can update enemies" on public.enemies for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete enemies" on public.enemies;
create policy "Authenticated users can delete enemies" on public.enemies for delete using (auth.role() = 'authenticated');

-- Políticas para 'user_animas'
drop policy if exists "Users can see their own animas" on public.user_animas;
create policy "Users can see their own animas" on public.user_animas for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own animas" on public.user_animas;
create policy "Users can insert their own animas" on public.user_animas for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own animas" on public.user_animas;
create policy "Users can update their own animas" on public.user_animas for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own animas" on public.user_animas;
create policy "Users can delete their own animas" on public.user_animas for delete using (auth.uid() = user_id);

-- Políticas para 'activities'
drop policy if exists "Users can see their own activities" on public.activities;
create policy "Users can see their own activities" on public.activities for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own activities" on public.activities;
create policy "Users can insert their own activities" on public.activities for insert with check (auth.uid() = user_id);

-- Políticas para 'profiles'
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
