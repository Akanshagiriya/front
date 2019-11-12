const sidebarMenus = [
  {
    header: {
      id: 'analytics',
      label: 'Analytics',
      path: '/analytics/dashboard/',
      permissions: ['admin', 'user'],
    },
    links: [
      {
        id: 'summary',
        label: 'Summary',
        permissions: ['admin'],
      },
      {
        id: 'traffic',
        label: 'Traffic',
        permissions: ['admin', 'user'],
      },
      {
        id: 'earnings',
        label: 'Earnings',
        permissions: ['admin', 'user'],
      },
      {
        id: 'engagement',
        label: 'Engagement',
        permissions: ['admin', 'user'],
        // path: '/some/path/outside/header/path',
      },
      {
        id: 'trending',
        label: 'Trending',
        permissions: ['admin', 'user'],
      },
      // {
      //   id: 'referrers',
      //   label: 'Referrers',
      //   permissions: ['admin', 'user'],
      // },
      // {
      //   id: 'plus',
      //   label: 'Plus',
      //   permissions: ['admin'],
      // },
      // {
      //   id: 'pro',
      //   label: 'Pro',
      //   permissions: ['admin'],
      // {
      //   id: 'boost',
      //   label: 'Boost',
      //   permissions: ['admin'],
      // },
      // {
      //   id: 'nodes',
      //   label: 'Nodes',
      //   permissions: ['admin'],
      // },
    ],
  },
  {
    header: {
      id: 'pro_settings',
      label: 'Pro Settings',
      path: '/pro/settings/',
      permissions: ['pro'],
    },
    links: [
      {
        id: 'general',
        label: 'General',
      },
      {
        id: 'theme',
        label: 'Theme',
      },
      {
        id: 'assets',
        label: 'Assets',
      },
      {
        id: 'hashtags',
        label: 'Hashtags',
      },
      {
        id: 'footer',
        label: 'Footer',
      },
      {
        id: 'domain',
        label: 'Domain',
      },
      {
        id: 'subscription',
        label: 'Pro Subscription',
        path: 'pro',
      },
      {
        id: ':user',
        label: 'View Pro Channel',
        path: ':user',
        newWindow: true,
      },
    ],
  },
];

export default sidebarMenus;
