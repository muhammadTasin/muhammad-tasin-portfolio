create table if not exists public.engineering_evidence_snapshot (
  id smallint primary key check (id = 1),
  generated_at timestamptz not null,
  payload jsonb not null
);
alter table public.engineering_evidence_snapshot enable row level security;
revoke all on public.engineering_evidence_snapshot from anon, authenticated;
grant all on public.engineering_evidence_snapshot to service_role;

create or replace function public.publish_engineering_evidence(snapshot jsonb)
returns void language sql security invoker set search_path = '' as $$
  insert into public.engineering_evidence_snapshot (id, generated_at, payload)
  values (1, (snapshot->>'generatedAt')::timestamptz, snapshot)
  on conflict (id) do update
    set generated_at = excluded.generated_at, payload = excluded.payload
    where excluded.generated_at > public.engineering_evidence_snapshot.generated_at;
$$;
revoke all on function public.publish_engineering_evidence(jsonb) from public, anon, authenticated;
grant execute on function public.publish_engineering_evidence(jsonb) to service_role;
