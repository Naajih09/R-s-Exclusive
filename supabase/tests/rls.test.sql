begin;

create extension if not exists pgtap with schema extensions;

insert into public.product_images (id, product_id, storage_path, public_url, position)
select
  '30000000-0000-4000-8000-000000000001',
  id,
  'test/published.webp',
  'https://example.invalid/published.webp',
  0
from public.products
where slug = 'classic-black-hoodie';

insert into public.product_images (id, product_id, storage_path, public_url, position)
select
  '30000000-0000-4000-8000-000000000002',
  id,
  'test/hidden.webp',
  'https://example.invalid/hidden.webp',
  0
from public.products
where slug = 'white-polo-shirt';

select plan(12);
set local role anon;

select is(
  (select whatsapp_number from public.store_settings),
  '2348000000000',
  'anonymous users can read store settings'
);
select is(
  (select count(*) from public.categories),
  3::bigint,
  'anonymous users can read categories'
);
select is(
  (select count(*) from public.products),
  6::bigint,
  'anonymous users can read published products'
);
select is(
  (select count(*) from public.products where is_published = false),
  0::bigint,
  'anonymous users cannot read hidden products'
);
select is(
  (select count(*) from public.product_images),
  1::bigint,
  'anonymous users can read images only for published products'
);

select throws_ok(
  $$insert into public.products (name, slug, price_ngn) values ('Anon item', 'anon-item', 1)$$,
  '42501',
  null,
  'anonymous users cannot insert products'
);
select throws_ok(
  $$update public.products set stock_quantity = 99 where slug = 'classic-black-hoodie'$$,
  '42501',
  null,
  'anonymous users cannot update products'
);
select throws_ok(
  $$delete from public.products where slug = 'classic-black-hoodie'$$,
  '42501',
  null,
  'anonymous users cannot delete products'
);

reset role;

-- A signed-in customer without the admin role must not get write access.
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-4000-8000-000000000001", "role": "authenticated"}';

select throws_ok(
  $$insert into public.products (name, slug, price_ngn) values ('Customer item', 'customer-item', 1)$$,
  '42501',
  null,
  'signed-in non-admin users cannot insert products'
);
update public.products set stock_quantity = 99 where slug = 'classic-black-hoodie';
reset role;
select is(
  (select stock_quantity from public.products where slug = 'classic-black-hoodie'),
  12,
  'signed-in non-admin users cannot update products'
);

-- An admin (role set in server-controlled app_metadata) can manage the catalog.
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-4000-8000-000000000002", "role": "authenticated", "app_metadata": {"role": "admin"}}';

select lives_ok(
  $$insert into public.products (name, slug, price_ngn) values ('Admin item', 'admin-item', 1)$$,
  'admins can insert products'
);
select is(
  (select count(*) from public.products where is_published = false),
  3::bigint,
  'admins can read hidden products'
);

reset role;
select * from finish();
rollback;
