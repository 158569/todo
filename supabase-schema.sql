create table if not exists public.todo_documents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.todo_documents enable row level security;

drop policy if exists "todo_documents_select_own" on public.todo_documents;
create policy "todo_documents_select_own"
on public.todo_documents
for select
using (auth.uid() = user_id);

drop policy if exists "todo_documents_insert_own" on public.todo_documents;
create policy "todo_documents_insert_own"
on public.todo_documents
for insert
with check (auth.uid() = user_id);

drop policy if exists "todo_documents_update_own" on public.todo_documents;
create policy "todo_documents_update_own"
on public.todo_documents
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.set_todo_documents_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists todo_documents_set_updated_at on public.todo_documents;
create trigger todo_documents_set_updated_at
before update on public.todo_documents
for each row
execute function public.set_todo_documents_updated_at();

create table if not exists public.todo_push_subscriptions (
  endpoint text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription jsonb not null,
  p256dh text not null default '',
  auth text not null default '',
  user_agent text not null default '',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, endpoint)
);

create index if not exists todo_push_subscriptions_user_id_idx
on public.todo_push_subscriptions(user_id);

alter table public.todo_push_subscriptions enable row level security;

drop policy if exists "todo_push_subscriptions_select_own" on public.todo_push_subscriptions;
create policy "todo_push_subscriptions_select_own"
on public.todo_push_subscriptions
for select
using (auth.uid() = user_id);

drop policy if exists "todo_push_subscriptions_insert_own" on public.todo_push_subscriptions;
create policy "todo_push_subscriptions_insert_own"
on public.todo_push_subscriptions
for insert
with check (auth.uid() = user_id);

drop policy if exists "todo_push_subscriptions_update_own" on public.todo_push_subscriptions;
create policy "todo_push_subscriptions_update_own"
on public.todo_push_subscriptions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "todo_push_subscriptions_delete_own" on public.todo_push_subscriptions;
create policy "todo_push_subscriptions_delete_own"
on public.todo_push_subscriptions
for delete
using (auth.uid() = user_id);

create or replace function public.set_todo_push_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists todo_push_subscriptions_set_updated_at on public.todo_push_subscriptions;
create trigger todo_push_subscriptions_set_updated_at
before update on public.todo_push_subscriptions
for each row
execute function public.set_todo_push_subscriptions_updated_at();

create table if not exists public.todo_push_deliveries (
  delivery_key text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  reminder_tag text not null,
  sent_at timestamptz not null default now()
);

create index if not exists todo_push_deliveries_user_sent_idx
on public.todo_push_deliveries(user_id, sent_at desc);

alter table public.todo_push_deliveries enable row level security;
