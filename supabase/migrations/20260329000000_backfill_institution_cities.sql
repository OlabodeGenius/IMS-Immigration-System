-- Backfill city values for known Kazakh institutions so geographic filtering works correctly.

-- ALMATY universities
UPDATE public.institutions
SET city = 'Almaty'
WHERE name ILIKE '%KBTU%'
   OR name ILIKE '%Kazakh-British%'
   OR name ILIKE '%KIMEP%'
   OR name ILIKE '%Al-Farabi%'
   OR name ILIKE '%Almaty%';

-- ASTANA universities
UPDATE public.institutions
SET city = 'Astana'
WHERE name ILIKE '%Nazarbayev%'
   OR name ILIKE '%Bolashak%'
   OR name ILIKE '%Astana%'
   OR name ILIKE '%AITU%'
   OR name ILIKE '%Astana IT%'
   OR name ILIKE '%Nur-Sultan%';

-- SHYMKENT universities
UPDATE public.institutions
SET city = 'Shymkent'
WHERE name ILIKE '%Shymkent%'
   OR name ILIKE '%South Kazakhstan%'
   OR name ILIKE '%SKMA%';

-- KARAGANDA universities
UPDATE public.institutions
SET city = 'Karaganda'
WHERE name ILIKE '%Karaganda%'
   OR name ILIKE '%Karagandy%'
   OR name ILIKE '%Buketov%';

-- AKTOBE universities
UPDATE public.institutions
SET city = 'Aktobe'
WHERE name ILIKE '%Aktobe%';

-- ATYRAU universities
UPDATE public.institutions
SET city = 'Atyrau'
WHERE name ILIKE '%Atyrau%';

-- PAVLODAR universities
UPDATE public.institutions
SET city = 'Pavlodar'
WHERE name ILIKE '%Pavlodar%'
   OR name ILIKE '%Toraigyrov%';

-- OSKEMEN universities
UPDATE public.institutions
SET city = 'Oskemen'
WHERE name ILIKE '%Oskemen%'
   OR name ILIKE '%Ust-Kamenogorsk%'
   OR name ILIKE '%East Kazakhstan%';

-- TARAZ universities
UPDATE public.institutions
SET city = 'Taraz'
WHERE name ILIKE '%Taraz%';

-- Verify: show all institutions and their city
SELECT id, name, city FROM public.institutions ORDER BY city, name;
