-- Update KBTU Address
UPDATE public.institutions 
SET address = '59 Tole Bi St, Almaty 050000, Kazakhstan'
WHERE name ILIKE '%Kazakh-British%' OR name ILIKE '%KBTU%';

-- Update KIMEP Address
UPDATE public.institutions 
SET address = '2 Abai Ave, Almaty 050010, Kazakhstan'
WHERE name ILIKE '%KIMEP%';

-- Verify updates
SELECT id, name, address FROM public.institutions WHERE name ILIKE '%KBTU%' OR name ILIKE '%KIMEP%';
