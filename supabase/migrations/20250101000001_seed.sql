-- Infinity Horlogerie — catalog seed v1
-- Mirrors data/products.ts (12 models, 4 collections) so the live path matches the seed.
-- Idempotent: skips rows whose unique key already exists.

-- Collections
insert into public.collections (id, slug, name, eyebrow, description, hero_image)
values
  ('20000000-0000-4000-8000-000000000001'::uuid, 'meridian',      'Meridian',      'The quintessential collection', 'Steel cases, hand-finished dials, and a precision born in the workshop. The Meridian is INFINITY''s point of entry — and its point of reference.', '/products/shot-angle.webp'),
  ('20000000-0000-4000-8000-000000000002'::uuid, 'nocturne',      'Nocturne',      'Dressed in shadow',            'High-contrast, bold, and quietly theatrical. Nocturne pairs midnight dials with applied gold indices and sweeping seconds in deep anthracite.', '/products/watch-navy.webp'),
  ('20000000-0000-4000-8000-000000000003'::uuid, 'serie-limitee', 'Série Limitée', 'Small series, numbered',       'No more than fifty of each. Each piece engraved with its own number, finished by a single maker from crown to clasp.', '/products/watch-gold.webp'),
  ('20000000-0000-4000-8000-000000000004'::uuid, 'aurora',        'Aurora',        'Companion to the day',         'Proportioned for the wrist, luminous in spirit. Aurora is our collection for those who dress light and live long.', '/products/watch-rose.webp')
on conflict (slug) do nothing;

-- Products
insert into public.products (
  id, slug, name, subtitle, collection_id, price_cents, compare_at_price_cents, currency,
  tagline, description, long_description, images, specs, bestseller, new_arrival, published, stock
)
select * from (values
  ('10000000-0000-4000-8000-000000000001'::uuid, 'meridian-one',      'Meridian One',            'Cal. A1 · Silver opaline', (select id from public.collections where slug = 'meridian'),
    490000, null, 'USD', 'The point of reference.', 'Our definitive dress watch: a 40mm steel case, a silver opaline dial, and the self-winding Calibre A1 finished to chronometer tolerance.',
    'The Meridian One is where the house began. Its case is machined from a single billet of 904L steel, hand-bevelled, and closed by a sapphire caseback that reveals the rose-gold rotor sweeping beneath. The dial carries no date — only time, uninterrupted. We believe restraint is the rarest form of luxury.',
    '["/products/shot-angle.webp","/products/shot-front.webp","/products/shot-profile.webp","/products/shot-bracelet.webp","/products/shot-caseback.webp"]'::jsonb,
    '[{"label":"Case","value":"40mm · 904L steel"},{"label":"Movement","value":"Calibre A1 · automatic"},{"label":"Reserve","value":"70 hours"},{"label":"Water","value":"100m"},{"label":"Crystal","value":"Box sapphire, 6x AR"}]'::jsonb,
    true, false, true, 0),
  ('10000000-0000-4000-8000-000000000002'::uuid, 'meridian-date',     'Meridian Date',           'Cal. A1-D · 40mm',    (select id from public.collections where slug = 'meridian'),
    560000, null, 'USD', 'Time, with a practical flourish.', 'The compensated date at three, framed in a printed railway track. Everything else — silent.',
    'A perfectly legible date window, in a case that remains a statement of quiet. The Meridian Date is the One, plus the one small indulgence.',
    '["/products/shot-angle.webp","/products/shot-front.webp","/products/shot-profile.webp","/products/shot-bracelet.webp","/products/shot-caseback.webp"]'::jsonb,
    '[{"label":"Case","value":"40mm · 904L steel"},{"label":"Movement","value":"Calibre A1-D4 · automatic"},{"label":"Reserve","value":"70 hours"},{"label":"Water","value":"100m"}]'::jsonb,
    false, false, true, 0),
  ('10000000-0000-4000-8000-000000000003'::uuid, 'nocturne-41',       'Nocturne 41',             'Calibre N5 · midnight dial', (select id from public.collections where slug = 'nocturne'),
    675000, null, 'USD', 'Dressed in shadow.', 'A midnight lacquer dial with rose-gold indices and a seconds hand that catches every flicker of light.',
    'Nocturne is the house after dark. The dial is lacquered blue-black and sunray-brushed until it reads as velvet, then anchored with applied rose-gold batons. The casewear is sculpted to hold its own under candlelight and stage light alike.',
    '["/products/watch-navy.webp","/products/shot-profile.webp","/products/shot-front.webp"]'::jsonb,
    '[{"label":"Case","value":"41mm · steel, rose-gold pins"},{"label":"Movement","value":"Calibre N5 · automatic"},{"label":"Reserve","value":"72 hours"},{"label":"Water","value":"200m"}]'::jsonb,
    true, true, true, 0),
  ('10000000-0000-4000-8000-000000000004'::uuid, 'nocturne-squelette','Nocturne Squelette',      'Calibre N9-S · skeleton', (select id from public.collections where slug = 'nocturne'),
    1290000, 1390000, 'USD', 'Time, opened to the light.', 'A fully skeletonised movement, hand-bevelled across 138 edges, floating above a midnight-blue mainplate.',
    'We skeletonise every plate and bridge of the N9 by hand — then re-arrange the hours in an open-worked ring so the architecture is never obscured. Two dial-less years of development; fifty pieces a year.',
    '["/products/watch-navy.webp","/products/shot-profile.webp","/products/shot-front.webp"]'::jsonb,
    '[{"label":"Case","value":"41mm · platinum 950 / steel"},{"label":"Movement","value":"Calibre N9 · skeleton"},{"label":"Reserve","value":"80 hours"},{"label":"Made","value":"One per fortnight"}]'::jsonb,
    false, true, true, 0),
  ('10000000-0000-4000-8000-000000000005'::uuid, 'serie-limitee-rose','Série Limitée — Rosé',    'Numbered · 050 pieces',  (select id from public.collections where slug = 'serie-limitee'),
    840000, null, 'USD', 'Fifty pieces. One signature.', 'A rose-gold case, coral dial, and hand-painted spheres. Each example engraved with its number and a single initial.',
    'For the Série Limitée we set our own limits. Fifty movements, adjusted and signed by the watchmaker who finished them. The coral lacquered dial wears a heat-blued sweep hand kept silent until water. When the edition closes, the lineage closes with it.',
    '["/products/watch-rose.webp","/products/shot-angle.webp","/products/shot-crown.webp"]'::jsonb,
    '[{"label":"Case","value":"39mm · rose gold"},{"label":"Movement","value":"Calibre S2 · manual"},{"label":"Reserve","value":"100 hours"},{"label":"Edition","value":"No. 14/50"}]'::jsonb,
    false, true, true, 0),
  ('10000000-0000-4000-8000-000000000006'::uuid, 'serie-limitee-bronze','Série Limitée — Bronze', 'CuSn8 · 25 pieces',      (select id from public.collections where slug = 'serie-limitee'),
    720000, null, 'USD', 'It will take on the years gracefully.', 'A CuAl bronze case that slowly takes a personal patina. Numbered caseback, green dial river.',
    'Bronze is a material only for the patient. We use a cupronickel alloy that develops a warm, organic patina unique to every owner. The dial is a deep eucalyptus green with applied gold indices and a caseback engraved with the owner''s initials.',
    '["/products/watch-bronze.webp","/products/shot-angle.webp","/products/shot-profile.webp"]'::jsonb,
    '[{"label":"Case","value":"40mm · CuAl bronze"},{"label":"Movement","value":"Calibre S3 · automatic"},{"label":"Reserve","value":"70 hours"}]'::jsonb,
    false, true, true, 0),
  ('10000000-0000-4000-8000-000000000007'::uuid, 'aurora-38',         'Aurora 38',               'Calibre A2 · 38mm',      (select id from public.collections where slug = 'aurora'),
    510000, null, 'USD', 'Light, proportioned.', 'A rose-gold-flushed 38mm case with a champagne dial. The Aurora is our most intimate watch.',
    'In cities the wrist still wants subtlety. The Aurora 38 wears like a jewel and tells time like an instrument — rose-gold hands over a champagne dial, end links sculpted to drape, and a movement slender enough to disappear under a cuff.',
    '["/products/watch-rose.webp","/products/shot-angle.webp","/products/shot-crown.webp"]'::jsonb,
    '[{"label":"Case","value":"38mm · light steel"},{"label":"Movement","value":"Calibre A2 · automatic"},{"label":"Reserve","value":"62 hours"}]'::jsonb,
    true, false, true, 0),
  ('10000000-0000-4000-8000-000000000008'::uuid, 'heritage-monogram', 'Heritage Monogram',       'Calibre A1-G · engraved', (select id from public.collections where slug = 'aurora'),
    1170000, null, 'USD', 'An heirloom relook.', 'A hand-engraved gold crown, engraved caseband, and a two-tone display that echoes the archives.',
    'We borrowed nothing from the past except its patience. The Heritage Monogram pairs a hand-engraved rose-gold crown with a warm silver dial and applied gold numerals, and the whole case is polished for three hours before it leaves.',
    '["/products/watch-gold.webp","/products/shot-crown.webp","/products/shot-front.webp","/products/watch-gold-crown.webp"]'::jsonb,
    '[{"label":"Case","value":"40mm · gold-capped steel"},{"label":"Movement","value":"Calibre A1-G · automatic"},{"label":"Reserve","value":"70 hours"}]'::jsonb,
    false, false, true, 0),
  ('10000000-0000-4000-8000-000000000009'::uuid, 'nocturne-chronograph','Nocturne Chronograph',   'Calibre N7-C · column wheel', (select id from public.collections where slug = 'nocturne'),
    980000, null, 'USD', 'Measured in tenths.', 'A column-wheel chronograph whose counters are arranged with a lateral clutch — and a bracelet styled for the dark.',
    'Few column-wheel chronographs remain at this price; fewer still are this legible. The Nocturne Chronograph uses our in-house N7-C with a vertical clutch, and offers a 12-hour totaliser framed in midnight. Shielded from light and errant magnetic fields, it is the tool-watch of the evening.',
    '["/products/watch-navy.webp","/products/shot-profile.webp","/products/shot-front.webp"]'::jsonb,
    '[{"label":"Case","value":"41mm · 904L steel"},{"label":"Movement","value":"Calibre N7-C · column wheel"},{"label":"Reserve","value":"72 hours"},{"label":"Water","value":"200m"}]'::jsonb,
    true, false, true, 0),
  ('10000000-0000-4000-8000-000000000010'::uuid, 'meridian-gmt',      'Meridian GMT',            'Calibre A5 · true GMT',  (select id from public.collections where slug = 'meridian'),
    890000, 940000, 'USD', 'Two cities, one wrist.', 'A jumping, true local GMT with an inscribed 24-hour ring — made indifferent to your timezone.',
    'The GMT is the traveller''s Meridian. The central jumping home hand is set against a printed 24-hour flange; a polished frame keeps the rotating bezel rigid. It crosses time zones with the indifference of a good airline bartender.',
    '["/products/shot-angle.webp","/products/shot-front.webp","/products/shot-profile.webp","/products/shot-bracelet.webp","/products/shot-caseback.webp"]'::jsonb,
    '[{"label":"Case","value":"41mm · 904L steel"},{"label":"Movement","value":"Calibre A2-G · true GMT"},{"label":"Reserve","value":"70 hours"}]'::jsonb,
    false, false, true, 0),
  ('10000000-0000-4000-8000-000000000011'::uuid, 'aurora-midnight',   'Aurora — Midnight',       'Calibre M2 · 37mm',      (select id from public.collections where slug = 'aurora'),
    690000, null, 'USD', 'The small hours, small.', 'A 37mm midnight-dialed variant that catches slipped in, two-hand minimum, yet reads at a glance across theatres.',
    'The Aurora at midnight. In a cinema it reads like newsprint. A sapphire case of 37mm and a two-hand gold-spoken manual-wind that asks you to remember it each evening — a ritual, if you keep time near.',
    '["/products/watch-navy.webp","/products/shot-profile.webp","/products/shot-front.webp"]'::jsonb,
    '[{"label":"Case","value":"37mm"},{"label":"Movement","value":"Calibre M2 · manual"},{"label":"Reserve","value":"58 hours"}]'::jsonb,
    false, true, true, 0),
  ('10000000-0000-4000-8000-000000000012'::uuid, 'nocturne-noir',     'Nocturne Noir',           'Cintré · 44mm',          (select id from public.collections where slug = 'nocturne'),
    775000, null, 'USD', 'Theatre of the wrist.', 'A convex, almost black 44mm case with a stepped bezel, and a dial that disappears into the case at its edges.',
    'Noir is the house''s dark matter. It swallows light at its dial edges, which draws the hand to the middle where a single gold sweep runs. A restrained case — anti-dome and anti-glare — that still catches every streetlight it passes.',
    '["/products/watch-navy.webp","/products/shot-profile.webp","/products/shot-front.webp"]'::jsonb,
    '[{"label":"Case","value":"44mm convex"},{"label":"Movement","value":"Calibre N11 · automatic"},{"label":"Water","value":"200m"}]'::jsonb,
    false, false, true, 0)
) as v(
  id, slug, name, subtitle, collection_id, price_cents, compare_at_price_cents, currency,
  tagline, description, long_description, images, specs, bestseller, new_arrival, published, stock
)
on conflict (slug) do nothing;

-- Variants
insert into public.product_variants (id, product_id, name, price_cents, stock)
select * from (values
  -- Meridian One
  ('30000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Steel bracelet',   490000, 14),
  ('30000000-0000-4000-8000-000000000002'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Anthracite strap', 480000, 22),
  ('30000000-0000-4000-8000-000000000003'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Ivory strap',      480000, 18),
  -- Meridian Date
  ('30000000-0000-4000-8000-000000000004'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'Steel bracelet',   560000, 9),
  ('30000000-0000-4000-8000-000000000005'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'Navy strap',       550000, 26),
  -- Nocturne 41
  ('30000000-0000-4000-8000-000000000006'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 'Midnight dial · bracelet', 675000, 12),
  ('30000000-0000-4000-8000-000000000007'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 'Midnight dial · navy strap', 665000, 21),
  -- Nocturne Squelette
  ('30000000-0000-4000-8000-000000000008'::uuid, '10000000-0000-4000-8000-000000000004'::uuid, 'Platinum case',    1290000, 3),
  ('30000000-0000-4000-8000-000000000009'::uuid, '10000000-0000-4000-8000-000000000004'::uuid, 'Steel case',       1120000, 7),
  -- Série Limitée Rosé
  ('30000000-0000-4000-8000-000000000010'::uuid, '10000000-0000-4000-8000-000000000005'::uuid, 'Rose gold · coral', 840000, 2),
  -- Série Limitée Bronze
  ('30000000-0000-4000-8000-000000000011'::uuid, '10000000-0000-4000-8000-000000000006'::uuid, 'CuAl bronze',      720000, 4),
  -- Aurora 38
  ('30000000-0000-4000-8000-000000000012'::uuid, '10000000-0000-4000-8000-000000000007'::uuid, 'Rose-tinted steel', 510000, 16),
  ('30000000-0000-4000-8000-000000000013'::uuid, '10000000-0000-4000-8000-000000000007'::uuid, 'Ivory strap',      500000, 24),
  -- Heritage Monogram
  ('30000000-0000-4000-8000-000000000014'::uuid, '10000000-0000-4000-8000-000000000008'::uuid, 'Gold bracelet',    1190000, 6),
  ('30000000-0000-4000-8000-000000000015'::uuid, '10000000-0000-4000-8000-000000000008'::uuid, 'Black strap',      1170000, 10),
  -- Nocturne Chronograph
  ('30000000-0000-4000-8000-000000000016'::uuid, '10000000-0000-4000-8000-000000000009'::uuid, 'Midnight · steel bracelet', 980000, 8),
  ('30000000-0000-4000-8000-000000000017'::uuid, '10000000-0000-4000-8000-000000000009'::uuid, 'Midnight · leather', 965000, 14),
  -- Meridian GMT
  ('30000000-0000-4000-8000-000000000018'::uuid, '10000000-0000-4000-8000-000000000010'::uuid, 'Steel bracelet',   890000, 11),
  ('30000000-0000-4000-8000-000000000019'::uuid, '10000000-0000-4000-8000-000000000010'::uuid, 'Travel strap',     880000, 19),
  -- Aurora Midnight
  ('30000000-0000-4000-8000-000000000020'::uuid, '10000000-0000-4000-8000-000000000011'::uuid, 'Midnight · band',  690000, 5),
  -- Nocturne Noir
  ('30000000-0000-4000-8000-000000000021'::uuid, '10000000-0000-4000-8000-000000000012'::uuid, 'Black bracelet',   775000, 6)
) as v(id, product_id, name, price_cents, stock)
on conflict (id) do nothing;

-- Reviews
insert into public.reviews (id, product_id, author, rating, date, title, body)
select * from (values
  ('40000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Julien M.', 5, '2025-11-04', 'Exceptional restraint', 'No logo noise, no exhibition fuss. Just a flawless machine on the wrist.'),
  ('40000000-0000-4000-8000-000000000002'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'Stefania K.', 5, '2025-11-04', 'The bracelet is unreal', 'Clasp alignment is flawless and the taper is pure class.'),
  ('40000000-0000-4000-8000-000000000003'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'Omar T.', 4, '2025-11-04', 'Great value', 'The date is perfectly legible, the finishing superb.'),
  ('40000000-0000-4000-8000-000000000004'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 'Victor L.', 5, '2025-11-04', 'Velvet under glass', 'The dial depth is unlike anything in this class.'),
  ('40000000-0000-4000-8000-000000000005'::uuid, '10000000-0000-4000-8000-000000000004'::uuid, 'Anya D.', 5, '2025-11-04', 'Art deco science', 'Close to a minute reel of it under a loupe.'),
  ('40000000-0000-4000-8000-000000000006'::uuid, '10000000-0000-4000-8000-000000000005'::uuid, 'Klara B.', 5, '2025-11-04', 'A numbered heirloom', 'Feels like it was made for a museum.'),
  ('40000000-0000-4000-8000-000000000007'::uuid, '10000000-0000-4000-8000-000000000007'::uuid, 'Lena S.', 5, '2025-11-04', 'A quiet masterpiece', 'Subtle, serious, and somehow still glamorous.'),
  ('40000000-0000-4000-8000-000000000008'::uuid, '10000000-0000-4000-8000-000000000009'::uuid, 'Tomasz F.', 4, '2025-11-04', 'The counters are poetry', 'Wear it dark, keep it running.')
) as v(id, product_id, author, rating, date, title, body)
on conflict (id) do nothing;
