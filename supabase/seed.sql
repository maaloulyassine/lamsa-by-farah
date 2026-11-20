begin;

insert into public.categories (name, slug, icon, sort_order)
values
  ('Salles de mariage', 'salles-de-mariage', 'building', 1),
  ('Robes de mariée', 'robes-de-mariee', 'dress', 2),
  ('Coiffure et maquillage', 'coiffure-maquillage', 'flower', 3),
  ('Décoration', 'decoration', 'flower', 4),
  ('Traiteurs et chefs', 'traiteurs-et-chefs', 'cloche', 5),
  ('Wedding cakes / gâteaux', 'gateaux', 'cake', 6),
  ('Photographes et vidéastes', 'photo-video', 'camera', 7),
  ('DJ et artistes', 'dj-artistes', 'music', 8),
  ('Fleurs', 'fleurs', 'flower', 9),
  ('Location de voitures', 'location-voitures', 'car', 10)
on conflict (slug) do update
set name = excluded.name, icon = excluded.icon, sort_order = excluded.sort_order, is_active = true;

insert into public.providers
  (slug,name,category_id,governorate_id,city,address,description,price_from,price_to,rating,review_count,is_demo,is_active)
values
  ('demo-salle-elegance','Salle Élégance — Démo',(select id from categories where slug='salles-de-mariage'),(select id from governorates where slug='tunis'),'Tunis','Zone fictive','Salle de démonstration élégante.',4500,7000,4.8,120,true,true),
  ('demo-salle-jasmin','Salle Jasmin — Démo',(select id from categories where slug='salles-de-mariage'),(select id from governorates where slug='ariana'),'Ariana','Zone fictive','Salle fictive pour essai du catalogue.',3800,6200,4.6,82,true,true),
  ('demo-robe-elyssa','Maison Elyssa — Démo',(select id from categories where slug='robes-de-mariee'),(select id from governorates where slug='tunis'),'Tunis','Zone fictive','Créations de robes fictives pour démonstration.',1200,3500,4.9,96,true,true),
  ('demo-robe-samira','Atelier Samira — Démo',(select id from categories where slug='robes-de-mariee'),(select id from governorates where slug='sousse'),'Sousse','Zone fictive','Atelier fictif de robes de mariée.',1500,4200,4.7,71,true,true),
  ('demo-beauty-lina','Lina Beauty — Démo',(select id from categories where slug='coiffure-maquillage'),(select id from governorates where slug='monastir'),'Monastir','Zone fictive','Coiffure et maquillage fictifs pour démonstration.',450,900,4.8,64,true,true),
  ('demo-beauty-nour','Nour Coiffure — Démo',(select id from categories where slug='coiffure-maquillage'),(select id from governorates where slug='tunis'),'Tunis','Zone fictive','Service fictif coiffure et maquillage.',500,1100,4.6,58,true,true),
  ('demo-deco-royal','Royal Décoration — Démo',(select id from categories where slug='decoration'),(select id from governorates where slug='ariana'),'Ariana','Zone fictive','Décoration fictive sur mesure.',1800,4500,4.7,88,true,true),
  ('demo-deco-rêve','Rêve Décor — Démo',(select id from categories where slug='decoration'),(select id from governorates where slug='sousse'),'Sousse','Zone fictive','Scénographie fictive pour mariage.',2200,4800,4.9,77,true,true),
  ('demo-traiteur-carthage','Carthage Traiteur — Démo',(select id from categories where slug='traiteurs-et-chefs'),(select id from governorates where slug='tunis'),'Tunis','Zone fictive','Menu fictif tunisien pour démonstration.',2500,6000,4.8,109,true,true),
  ('demo-traiteur-olive','L’Olivier — Démo',(select id from categories where slug='traiteurs-et-chefs'),(select id from governorates where slug='monastir'),'Monastir','Zone fictive','Traiteur fictif gastronomique.',2800,6500,4.7,91,true,true),
  ('demo-gateau-miel','Maison du Miel — Démo',(select id from categories where slug='gateaux'),(select id from governorates where slug='sousse'),'Sousse','Zone fictive','Wedding cake fictif personnalisé.',650,1800,4.8,53,true,true),
  ('demo-gateau-jasmine','Jasmine Cakes — Démo',(select id from categories where slug='gateaux'),(select id from governorates where slug='tunis'),'Tunis','Zone fictive','Gâteaux fictifs pour démonstration.',700,2200,4.6,47,true,true),
  ('demo-photo-syma','Syma Photo — Démo',(select id from categories where slug='photo-video'),(select id from governorates where slug='ariana'),'Ariana','Zone fictive','Studio photographique fictif.',1800,4200,4.9,130,true,true),
  ('demo-video-capitole','Capitole Vidéo — Démo',(select id from categories where slug='photo-video'),(select id from governorates where slug='monastir'),'Monastir','Zone fictive','Vidéo mariage fictive.',2000,5000,4.7,69,true,true),
  ('demo-dj-eclat','Éclat DJ — Démo',(select id from categories where slug='dj-artistes'),(select id from governorates where slug='tunis'),'Tunis','Zone fictive','Animation musicale fictive.',900,2600,4.6,74,true,true),
  ('demo-dj-medina','Médina Live — Démo',(select id from categories where slug='dj-artistes'),(select id from governorates where slug='sousse'),'Sousse','Zone fictive','Artistes fictifs pour démonstration.',1200,3000,4.8,61,true,true),
  ('demo-fleurs-azur','Azur Fleurs — Démo',(select id from categories where slug='fleurs'),(select id from governorates where slug='monastir'),'Monastir','Zone fictive','Compositions florales fictives.',600,1800,4.7,43,true,true),
  ('demo-fleurs-lys','Lys Boutique — Démo',(select id from categories where slug='fleurs'),(select id from governorates where slug='tunis'),'Tunis','Zone fictive','Fleuriste fictif de démonstration.',550,1600,4.5,39,true,true),
  ('demo-auto-promenade','Promenade Cars — Démo',(select id from categories where slug='location-voitures'),(select id from governorates where slug='ariana'),'Ariana','Zone fictive','Voitures fictives avec chauffeur.',700,2200,4.8,66,true,true),
  ('demo-auto-royale','Royale Cars — Démo',(select id from categories where slug='location-voitures'),(select id from governorates where slug='sousse'),'Sousse','Zone fictive','Location fictive pour mariage.',800,2500,4.6,52,true,true)
on conflict (slug) do update
set name = excluded.name,
    category_id = excluded.category_id,
    governorate_id = excluded.governorate_id,
    city = excluded.city,
    address = excluded.address,
    description = excluded.description,
    price_from = excluded.price_from,
    price_to = excluded.price_to,
    rating = excluded.rating,
    review_count = excluded.review_count,
    is_demo = true,
    is_active = true;

commit;
