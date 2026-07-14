-- Waitlist rate limiting.
--
-- Stores one row per allowed submission, keyed by a salted hash of the client
-- IP (raw IPs never reach the database). The waitlist_check_rate_limit()
-- function does an atomic count-and-record and is SECURITY DEFINER, so the
-- anon role can enforce limits without direct read/write access to the table.

create table if not exists public.waitlist_rate_limit (
  id         bigint generated always as identity primary key,
  ip_hash    text        not null,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_rate_limit_ip_created_idx
  on public.waitlist_rate_limit (ip_hash, created_at desc);

-- Lock the table down: no direct anon/authenticated access. All reads/writes go
-- through the SECURITY DEFINER function below.
alter table public.waitlist_rate_limit enable row level security;
revoke all on public.waitlist_rate_limit from anon, authenticated;

-- Returns 'hourly' | 'cooldown' | 'ok'. Records the attempt only when allowed,
-- and opportunistically prunes rows older than the largest window so the table
-- stays bounded.
create or replace function public.waitlist_check_rate_limit(p_ip_hash text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  hourly_count int;
  minute_count int;
begin
  -- Housekeeping: nothing older than 1 hour affects any decision.
  delete from public.waitlist_rate_limit
  where created_at < now() - interval '1 hour';

  select count(*) into hourly_count
  from public.waitlist_rate_limit
  where ip_hash = p_ip_hash
    and created_at > now() - interval '1 hour';

  if hourly_count >= 3 then
    return 'hourly';
  end if;

  select count(*) into minute_count
  from public.waitlist_rate_limit
  where ip_hash = p_ip_hash
    and created_at > now() - interval '1 minute';

  if minute_count >= 1 then
    return 'cooldown';
  end if;

  insert into public.waitlist_rate_limit (ip_hash) values (p_ip_hash);
  return 'ok';
end;
$$;

revoke all on function public.waitlist_check_rate_limit(text) from public;
grant execute on function public.waitlist_check_rate_limit(text) to anon, authenticated;
