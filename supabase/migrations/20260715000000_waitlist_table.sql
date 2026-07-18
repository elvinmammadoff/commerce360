create table public.waitlist (
  id         bigint generated always as identity primary key,
  email      text        not null unique,
  source     text        not null default 'marketing_page',
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- No direct anon/authenticated access — only service role writes via server actions
