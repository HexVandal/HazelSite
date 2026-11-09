-- Gloom first-party API schema (PostgreSQL 14+). Apply with: npm run db:migrate
create extension if not exists pgcrypto;

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text not null default '',
  password_hash text not null,
  role text not null default 'editor' check (role in ('owner','admin','editor','moderator','viewer')),
  totp_secret text,
  totp_pending_secret text,
  totp_enabled boolean not null default false,
  recovery_code_hashes text[] not null default '{}',
  session_version integer not null default 0,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null check (role in ('admin','editor','moderator','viewer')),
  token_hash text not null unique,
  invited_by uuid not null references admin_users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references admin_users(id) on delete cascade,
  name text not null,
  prefix text not null,
  token_hash text not null unique,
  scopes text[] not null default '{}',
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  body text not null default '',
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  featured_image_url text,
  author_id uuid references admin_users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Older local volumes may already contain a blog_posts table without the newer fields.
-- Keep this migration safe for both fresh and previously initialized databases.
alter table blog_posts add column if not exists summary text not null default '';
alter table blog_posts add column if not exists body text not null default '';
alter table blog_posts add column if not exists tags text[] not null default '{}';
alter table blog_posts add column if not exists status text not null default 'draft';
alter table blog_posts add column if not exists featured_image_url text;
alter table blog_posts add column if not exists author_id uuid references admin_users(id) on delete set null;
alter table blog_posts add column if not exists published_at timestamptz;
alter table blog_posts add column if not exists created_at timestamptz not null default now();
alter table blog_posts add column if not exists updated_at timestamptz not null default now();
create index if not exists blog_posts_public_idx on blog_posts(status,published_at desc);



create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_key text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  public_url text not null,
  blurhash text,
  alt_text text not null default '',
  uploaded_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);


create table if not exists structured_logs (
  id bigserial primary key,
  level text not null check (level in ('debug','info','warn','error')),
  event text not null,
  request_id text,
  actor_id uuid references admin_users(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists structured_logs_recent_idx on structured_logs(created_at desc);

create table if not exists telemetry_samples (
  id bigserial primary key,
  sampled_at timestamptz not null default now(),
  process_uptime_seconds double precision not null,
  rss_bytes bigint not null,
  heap_used_bytes bigint not null,
  load_1m double precision,
  db_latency_ms double precision,
  db_pool_total integer not null default 0
);

create table if not exists api_rate_limits (
  bucket text primary key,
  window_started_at timestamptz not null,
  request_count integer not null default 0
);
