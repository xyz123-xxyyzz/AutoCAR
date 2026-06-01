-- AutoCAR Gelişmiş Supabase Mimarisi (v2.0)

-- 1. PROFILES TABLOSU (Kullanıcı Yönetimi ve Güvenlik)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  is_admin boolean default false,
  credits integer default 0,
  is_unlimited boolean default false,
  device_ip text, -- Hesap paylaşımını engellemek için IP takibi
  api_key text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- 2. SCRAPED_CARS TABLOSU (Chrome Eklentisinden Gelen Saf Veri Deposu)
create table public.scraped_cars (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text, -- Sahibinden, Arabam, Letgo vb.
  url text not null,
  title text not null,
  price text not null,
  description text,
  specs jsonb default '{}'::jsonb, -- Kilometre, Boya, Vites vb.
  images text[] default '{}', -- Resim linkleri dizisi
  is_analyzed boolean default false, -- AI tetiklendi mi?
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.scraped_cars enable row level security;

create policy "Users can view their own scraped cars" on scraped_cars for select using ( auth.uid() = user_id );
create policy "Users can insert their own scraped cars" on scraped_cars for insert with check ( auth.uid() = user_id );

-- 3. ANALYZED_CARS TABLOSU (Yapay Zekanın Döndürdüğü Ekspertiz Raporları)
create table public.analyzed_cars (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scraped_car_id uuid references public.scraped_cars(id) on delete cascade not null,
  
  -- Puanlamalar
  market_speed_score integer not null,
  price_perf_score integer not null,
  condition_score integer not null,
  overall_score integer not null,
  
  -- Analiz Metinleri ve Detaylar
  ai_report text not null,
  detailed_specs jsonb not null, -- {"name", "value", "status", "comment", "note"} objelerinin dizisi
  competitor_analysis jsonb not null, -- {"pros", "cons", "text"} objesi
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.analyzed_cars enable row level security;

create policy "Users can view their own analyzed cars" on analyzed_cars for select using ( auth.uid() = user_id );
create policy "Users can insert their own analyzed cars" on analyzed_cars for insert with check ( auth.uid() = user_id );

-- 4. OTOMATİK PROFİL OLUŞTURMA (Tetikleyici)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
