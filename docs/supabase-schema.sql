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

create table if not exists public.content_sections (
  tenant_id text not null,
  section_id text not null,
  title text not null,
  copy text not null default '',
  page_copy text not null default '',
  image_url text not null default '',
  media jsonb not null default '[]'::jsonb,
  link text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (tenant_id, section_id)
);

create index if not exists content_sections_tenant_sort_idx
  on public.content_sections (tenant_id, sort_order asc);

insert into storage.buckets (id, name, public)
values ('cbr-content', 'cbr-content', true)
on conflict (id) do update set public = true;

alter table public.content_sections
add column if not exists media jsonb not null default '[]'::jsonb;

alter table public.content_sections
add column if not exists page_copy text not null default '';
