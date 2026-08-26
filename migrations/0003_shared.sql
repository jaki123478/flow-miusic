create table if not exists shared_playlists (
  id text primary key,
  user_id text not null,
  owner_name text not null default 'Utente',
  title text not null,
  tracks jsonb not null default '[]',
  collab boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists shared_playlists_user_idx on shared_playlists (user_id);

create table if not exists follows (
  user_id text not null,
  target_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, target_id)
);
