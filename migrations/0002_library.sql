create table if not exists user_library (
  user_id text primary key,
  liked jsonb not null default '[]',
  recents jsonb not null default '[]',
  playlists jsonb not null default '[]',
  settings jsonb not null default '{}',
  volume real not null default 0.9,
  listen_ms bigint not null default 0,
  updated_at timestamptz not null default now()
);
