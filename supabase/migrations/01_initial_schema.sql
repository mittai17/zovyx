-- Enable the necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgsodium";
create extension if not exists "supabase_vault" with schema vault;

-- ==========================================
-- 1. Profiles Table
-- ==========================================
create table if not exists public.profiles (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null unique,
    activepieces_project_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
    on public.profiles for select
    using ( auth.uid() = user_id );

create policy "Users can insert own profile"
    on public.profiles for insert
    with check ( auth.uid() = user_id );

create policy "Users can update own profile"
    on public.profiles for update
    using ( auth.uid() = user_id );

-- ==========================================
-- 2. OpenClaw Memories Table
-- ==========================================
create table if not exists public.openclaw_memories (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    key text not null,
    value jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, key)
);

-- RLS for OpenClaw Memories
alter table public.openclaw_memories enable row level security;

create policy "Users can view own memories"
    on public.openclaw_memories for select
    using ( auth.uid() = user_id );

create policy "Users can insert own memories"
    on public.openclaw_memories for insert
    with check ( auth.uid() = user_id );

create policy "Users can update own memories"
    on public.openclaw_memories for update
    using ( auth.uid() = user_id );

create policy "Users can delete own memories"
    on public.openclaw_memories for delete
    using ( auth.uid() = user_id );

-- ==========================================
-- 3. Secure Vault for Activepieces JWT
-- ==========================================
-- We will use the Supabase Vault to store Activepieces JWT tokens securely.
-- Create a helper table to map user_id to a vault secret_id
create table if not exists public.user_vault_secrets (
    user_id uuid references auth.users(id) on delete cascade not null primary key,
    secret_id uuid not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for user_vault_secrets
alter table public.user_vault_secrets enable row level security;

create policy "Users can view own vault secret mapping"
    on public.user_vault_secrets for select
    using ( auth.uid() = user_id );

-- Helper functions for managing Activepieces JWT in the vault securely
-- Requires security definer to interact with vault safely
create or replace function public.set_activepieces_jwt(jwt_token text)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
    v_secret_id uuid;
    v_user_id uuid := auth.uid();
begin
    if v_user_id is null then
        raise exception 'Not authenticated';
    end if;

    -- Check if user already has a secret mapped
    select secret_id into v_secret_id from public.user_vault_secrets where user_id = v_user_id;

    if v_secret_id is not null then
        -- Delete old secret
        delete from vault.secrets where id = v_secret_id;
    end if;

    -- Insert new secret
    insert into vault.secrets (secret, name, description)
    values (jwt_token, 'activepieces_jwt_' || v_user_id, 'Activepieces JWT for user')
    returning id into v_secret_id;

    -- Update or insert mapping
    insert into public.user_vault_secrets (user_id, secret_id)
    values (v_user_id, v_secret_id)
    on conflict (user_id) do update set secret_id = excluded.secret_id, updated_at = now();

end;
$$;

create or replace function public.get_activepieces_jwt()
returns text
language plpgsql
security definer
set search_path = public, vault
as $$
declare
    v_secret text;
    v_secret_id uuid;
    v_user_id uuid := auth.uid();
begin
    if v_user_id is null then
        raise exception 'Not authenticated';
    end if;

    -- Get mapping
    select secret_id into v_secret_id from public.user_vault_secrets where user_id = v_user_id;

    if v_secret_id is null then
        return null;
    end if;

    -- Get secret
    select decrypted_secret into v_secret from vault.decrypted_secrets where id = v_secret_id;

    return v_secret;
end;
$$;

-- Grant execute to authenticated users
grant execute on function public.set_activepieces_jwt(text) to authenticated;
grant execute on function public.get_activepieces_jwt() to authenticated;
