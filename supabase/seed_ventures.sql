-- Seed SmartProBono umbrella ventures
-- Safe to re-run (upserts by slug).

insert into public.ventures (slug, name, description, status) values
  (
    'smartprobonoip',
    'SmartProBonoIP',
    'AI-powered IP readiness and referral tool for overlooked inventors.',
    'active'
  ),
  (
    'smartprobono_legal',
    'SmartProBono Legal Access',
    'Planned venture for legal access pathways.',
    'planned'
  ),
  (
    'smartprobono_family',
    'SmartProBono Family Support',
    'Planned venture for family support resources.',
    'planned'
  ),
  (
    'smartprobono_business',
    'SmartProBono Business Support',
    'Planned venture for founder and small-business support.',
    'planned'
  ),
  (
    'smartprobono_community',
    'SmartProBono Community Resources',
    'Planned venture for community resource routing.',
    'planned'
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();
