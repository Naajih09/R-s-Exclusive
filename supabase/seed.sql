-- LOCAL DEVELOPMENT DATA ONLY.
-- Run with `supabase db reset --local`; never use `--include-seed` or
-- `db reset --linked` against a production project.
do $$
begin
  if current_setting('app.seed_environment', true) is distinct from 'local' then
    raise exception 'Refusing to seed a non-local database.';
  end if;
end;
$$;

begin;

insert into public.store_settings (
  id,
  store_name,
  whatsapp_number,
  phone,
  address,
  opening_hours,
  low_stock_threshold
)
values (
  1,
  '[STORE NAME]',
  '2348000000000',
  '+234 800 000 0000',
  '[STORE ADDRESS], Lagos',
  'Mon to Sat, 9am to 6pm',
  5
)
on conflict (id) do update
set store_name = excluded.store_name,
    whatsapp_number = excluded.whatsapp_number,
    phone = excluded.phone,
    address = excluded.address,
    opening_hours = excluded.opening_hours,
    low_stock_threshold = excluded.low_stock_threshold,
    updated_at = now();

insert into public.categories (id, name, slug, position)
values
  ('10000000-0000-4000-8000-000000000001', 'Clothing', 'clothing', 0),
  ('10000000-0000-4000-8000-000000000002', 'Electronics', 'electronics', 1),
  ('10000000-0000-4000-8000-000000000003', 'Food', 'food', 2)
on conflict (slug) do update
set name = excluded.name,
    position = excluded.position;

insert into public.products (
  id,
  category_id,
  name,
  slug,
  description,
  price_ngn,
  stock_quantity,
  is_published,
  details
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    (select id from public.categories where slug = 'clothing'),
    'Classic Black Hoodie',
    'classic-black-hoodie',
    'A comfortable cotton blend hoodie for everyday wear.',
    18500,
    12,
    true,
    '{"Size": ["M", "L", "XL"], "Color": "Black"}'::jsonb
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    (select id from public.categories where slug = 'clothing'),
    'Ankara Day Dress',
    'ankara-day-dress',
    'A colourful Ankara print dress for casual outings.',
    24000,
    4,
    true,
    '{"Size": ["S", "M", "L"], "Color": "Multicolour"}'::jsonb
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    (select id from public.categories where slug = 'clothing'),
    'White Polo Shirt',
    'white-polo-shirt',
    'A plain cotton polo shirt. This sample is hidden from customers.',
    9500,
    7,
    false,
    '{"Size": ["M", "L", "XL"], "Color": "White"}'::jsonb
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    (select id from public.categories where slug = 'electronics'),
    'Portable Bluetooth Speaker',
    'portable-bluetooth-speaker',
    'Compact wireless speaker with USB charging.',
    32000,
    9,
    true,
    '{"Brand": "SoundMate", "Color": "Blue"}'::jsonb
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    (select id from public.categories where slug = 'electronics'),
    'Kitchen Blender 600W',
    'kitchen-blender-600w',
    'Six hundred watt countertop blender with a glass jug.',
    47500,
    2,
    true,
    '{"Brand": "HomePro", "Power": "600W"}'::jsonb
  ),
  (
    '20000000-0000-4000-8000-000000000006',
    (select id from public.categories where slug = 'electronics'),
    'USB-C Wall Charger',
    'usb-c-wall-charger',
    'A twenty watt USB-C charger. This sample is hidden from customers.',
    12500,
    0,
    false,
    '{"Power": "20W", "Color": "White"}'::jsonb
  ),
  (
    '20000000-0000-4000-8000-000000000007',
    (select id from public.categories where slug = 'food'),
    'Smoked Catfish 1kg',
    'smoked-catfish-1kg',
    'Locally smoked catfish, packed by weight.',
    16500,
    5,
    true,
    '{"Weight": "1kg"}'::jsonb
  ),
  (
    '20000000-0000-4000-8000-000000000008',
    (select id from public.categories where slug = 'food'),
    'Ofada Rice 5kg',
    'ofada-rice-5kg',
    'Locally sourced Ofada rice in a five kilogram bag.',
    21000,
    0,
    true,
    '{"Weight": "5kg"}'::jsonb
  )
on conflict (slug) do update
set category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price_ngn = excluded.price_ngn,
    stock_quantity = excluded.stock_quantity,
    is_published = excluded.is_published,
    details = excluded.details,
    updated_at = now();

commit;
