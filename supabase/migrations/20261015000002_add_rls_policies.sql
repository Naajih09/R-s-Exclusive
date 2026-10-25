grant usage on schema public to anon, authenticated;
revoke all privileges on public.store_settings, public.categories, public.products, public.product_images
  from anon, public;
grant select on public.store_settings, public.categories, public.products, public.product_images
  to anon, authenticated;
grant insert, update, delete
  on public.store_settings, public.categories, public.products, public.product_images
  to authenticated;

-- Store owners are users whose server-controlled app_metadata.role is "admin".
-- Users cannot edit app_metadata themselves, so signing up grants no write access.
create function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create policy "public read settings" on public.store_settings
  for select using (true);

create policy "public read categories" on public.categories
  for select using (true);

create policy "public read published products" on public.products
  for select using (is_published = true);

create policy "public read images of published products" on public.product_images
  for select using (
    exists (
      select 1
      from public.products as p
      where p.id = product_id
        and p.is_published = true
    )
  );

create policy "owner all settings" on public.store_settings
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "owner all categories" on public.categories
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "owner all products" on public.products
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "owner all images" on public.product_images
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
