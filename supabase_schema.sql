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

-- 3. Tabela de Animas dos Usuários (Instâncias Adotadas)
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
  max_health_extra int default 0
);

-- 4. Tabela de Atividades (Logs de Ações)
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  timestamp timestamptz default now(),
  user_id uuid references auth.users(id),
  type text,
  message text
);

-- 5. Configuração de Políticas de Segurança (RLS)

-- Habilitar RLS nas tabelas
alter table public.animas enable row level security;
alter table public.user_animas enable row level security;
alter table public.activities enable row level security;

-- Políticas para 'animas' (Todos podem ler, apenas autenticados podem criar/editar - idealmente apenas admins)
create policy "Animas are viewable by everyone" on public.animas
  for select using (true);

create policy "Authenticated users can insert animas" on public.animas
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update animas" on public.animas
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete animas" on public.animas
  for delete using (auth.role() = 'authenticated');

-- Políticas para 'user_animas' (Usuários só acessam seus próprios animas)
create policy "Users can see their own animas" on public.user_animas
  for select using (auth.uid() = user_id);

create policy "Users can insert their own animas" on public.user_animas
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own animas" on public.user_animas
  for update using (auth.uid() = user_id);

create policy "Users can delete their own animas" on public.user_animas
  for delete using (auth.uid() = user_id);

-- Políticas para 'activities'
create policy "Users can see their own activities" on public.activities
  for select using (auth.uid() = user_id);

create policy "Users can insert their own activities" on public.activities
  for insert with check (auth.uid() = user_id);
