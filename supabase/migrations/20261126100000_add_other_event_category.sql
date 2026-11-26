-- Allow organizers to publish events that do not fit an existing category.
alter table public.events drop constraint if exists events_category_check;
alter table public.events add constraint events_category_check check (category = any (array[
'concert','anniversaire','piquenique','gala','miss','chill','sortie',
'festival','soiree','conference','formation','atelier','foire','ceremonie',
'sport','cinema','humour','networking','solidarite','religieux','campus',
'gastronomie','mode','excursion','lancement','autres'
]::text[]));
