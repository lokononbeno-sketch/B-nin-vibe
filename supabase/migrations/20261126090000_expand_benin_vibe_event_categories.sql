-- Expand Bénin Vibe event categories and rename Shield to Chill.
update public.events set category = 'chill' where category = 'shield';
alter table public.events drop constraint if exists events_category_check;
alter table public.events add constraint events_category_check check (category = any (array[
'concert','anniversaire','piquenique','gala','miss','chill','sortie',
'festival','soiree','conference','formation','atelier','foire','ceremonie',
'sport','cinema','humour','networking','solidarite','religieux','campus',
'gastronomie','mode','excursion','lancement'
]::text[]));
