-- Run in Supabase: SQL Editor → New query → paste & run

create table public.mvp_votes (
  month_key text not null,
  voter_id text not null,
  candidate text not null,
  voted_at timestamptz not null default now(),
  primary key (month_key, voter_id)
);

create index mvp_votes_month_key_idx on public.mvp_votes (month_key);

alter table public.mvp_votes enable row level security;

create policy "mvp_votes_select"
  on public.mvp_votes for select
  using (true);

create policy "mvp_votes_insert"
  on public.mvp_votes for insert
  with check (true);

create policy "mvp_votes_update"
  on public.mvp_votes for update
  using (true);

create policy "mvp_votes_delete"
  on public.mvp_votes for delete
  using (true);

-- Optional: live updates when someone votes (Table Editor → mvp_votes → Realtime → enable)
