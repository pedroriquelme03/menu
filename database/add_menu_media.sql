-- Mídia do cardápio: coluna de vídeo e buckets públicos.
-- Rode este script no SQL Editor do projeto Supabase do cardápio (QeeL).

alter table public.menu_items
  add column if not exists video_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('menu-images', 'menu-images', true, 2097152, array['image/webp']::text[]),
  ('menu-videos', 'menu-videos', true, 20971520, array['video/mp4']::text[])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Allow public read menu media" on storage.objects;
drop policy if exists "Allow public insert menu media" on storage.objects;
drop policy if exists "Allow public update menu media" on storage.objects;
drop policy if exists "Allow public delete menu media" on storage.objects;

create policy "Allow public read menu media"
on storage.objects for select
to public
using (bucket_id in ('menu-images', 'menu-videos'));

create policy "Allow public insert menu media"
on storage.objects for insert
to public
with check (
  (bucket_id = 'menu-images' and lower(storage.extension(name)) = 'webp')
  or
  (bucket_id = 'menu-videos' and lower(storage.extension(name)) = 'mp4')
);

create policy "Allow public update menu media"
on storage.objects for update
to public
using (bucket_id in ('menu-images', 'menu-videos'))
with check (
  (bucket_id = 'menu-images' and lower(storage.extension(name)) = 'webp')
  or
  (bucket_id = 'menu-videos' and lower(storage.extension(name)) = 'mp4')
);

create policy "Allow public delete menu media"
on storage.objects for delete
to public
using (bucket_id in ('menu-images', 'menu-videos'));
