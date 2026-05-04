create table if not exists public.leads (
  id text primary key,
  tenant_id text not null,
  name text not null,
  phone text not null,
  interest text not null,
  source text not null check (source in ('Landing', 'Asesor IA', 'WhatsApp', 'Referido')),
  temperature text not null check (temperature in ('hot', 'warm', 'cold')),
  stage text not null check (stage in ('Nuevo', 'Contactado', 'Calificado', 'Visita', 'Apartado')),
  budget text not null default 'Por definir',
  last_contact text not null default 'Ahora',
  next_action text not null default 'Primer contacto por WhatsApp',
  score integer not null default 85 check (score >= 0 and score <= 100),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists leads_tenant_created_at_idx
  on public.leads (tenant_id, created_at desc);
