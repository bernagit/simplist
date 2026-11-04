type Item = { label: string; slug: string; translations: { en: string } }
type Group = { label: string; translations: { en: string }; items: Item[] }

export const sidebar: Group[] = [
  {
    label: 'Inizia',
    translations: { en: 'Getting Started' },
    items: [
      { label: 'Installazione', slug: 'getting-started/installation', translations: { en: 'Installation' } },
      { label: 'Primi passi', slug: 'getting-started/first-steps', translations: { en: 'First Steps' } }
    ]
  },
  {
    label: 'Guida utente',
    translations: { en: 'User Guide' },
    items: [
      { label: 'Panoramica', slug: 'user-guide', translations: { en: 'Overview' } },
      { label: 'Liste e sezioni', slug: 'user-guide/lists', translations: { en: 'Lists and sections' } },
      { label: 'Attività', slug: 'user-guide/tasks', translations: { en: 'Tasks' } },
      { label: 'Calendario e ricerca', slug: 'user-guide/calendar', translations: { en: 'Calendar and search' } },
      { label: 'Condivisione e inviti', slug: 'user-guide/sharing', translations: { en: 'Sharing and invites' } },
      { label: 'Notifiche', slug: 'user-guide/notifications', translations: { en: 'Notifications' } },
      { label: 'Impostazioni e scorciatoie', slug: 'user-guide/settings', translations: { en: 'Settings and shortcuts' } }
    ]
  },
  {
    label: 'Self Hosting',
    translations: { en: 'Self Hosting' },
    items: [
      { label: 'Panoramica', slug: 'self-hosting', translations: { en: 'Overview' } },
      { label: 'Deploy con Docker', slug: 'self-hosting/docker', translations: { en: 'Deploy with Docker' } },
      { label: 'Configurazione', slug: 'self-hosting/configuration', translations: { en: 'Configuration' } },
      { label: 'Aggiornamenti e backup', slug: 'self-hosting/maintenance', translations: { en: 'Updates and backups' } }
    ]
  },
  {
    label: 'Sviluppo',
    translations: { en: 'Development' },
    items: [{ label: 'Panoramica', slug: 'development', translations: { en: 'Overview' } }]
  },
  {
    label: 'Versioni',
    translations: { en: 'Releases' },
    items: [{ label: 'Changelog', slug: 'changelog', translations: { en: 'Changelog' } }]
  }
]
