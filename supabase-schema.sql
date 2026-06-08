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
