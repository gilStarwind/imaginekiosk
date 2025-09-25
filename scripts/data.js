import { clone } from './helpers.js';

export const ASSET_ROOT = 'images';
export const MISSION_IMAGE_DIR = `${ASSET_ROOT}/missions/`;
export const GENERAL_IMAGE_DIR = `${ASSET_ROOT}/general/`;
export const LOGO_URL = `${GENERAL_IMAGE_DIR}logo.png`;

// Optional Google Sheets CSV (File > Share > Publish to web > CSV)
export const SHEET_CSV_URL = '';
export const ADMIN_PIN = '112200';

export const THEMES = {
  evergreen: {
    label: 'Evergreen',
    gradient: 'linear-gradient(180deg,#022c22 0%,#02131b 55%,#031c28 100%)',
    vars: {
      '--brand': '#62b37a',
      '--brand-700': '#3b8d5e',
      '--brand-900': '#1f5d3f',
      '--on-brand': '#06130d',
      '--surface': '#0b1220',
      '--surface-2': '#0f172a',
      '--on-surface': '#d1fae5',
      '--text-base': '#d1fae5',
      '--text-muted': '#99f6e4',
      '--text-subtle': '#a7f3d0'
    }
  },
  ocean: {
    label: 'Ocean',
    gradient: 'linear-gradient(180deg,#061537 0%,#031a2e 55%,#06253f 100%)',
    vars: {
      '--brand': '#38bdf8',
      '--brand-700': '#0ea5e9',
      '--brand-900': '#0369a1',
      '--on-brand': '#02121d',
      '--surface': '#071224',
      '--surface-2': '#0b172d',
      '--on-surface': '#cfe9ff',
      '--text-base': '#dbeafe',
      '--text-muted': '#bae6fd',
      '--text-subtle': '#c4e1ff'
    }
  },
  ember: {
    label: 'Ember',
    gradient: 'linear-gradient(180deg,#2d0a0a 0%,#170608 55%,#2f1216 100%)',
    vars: {
      '--brand': '#fb923c',
      '--brand-700': '#ea580c',
      '--brand-900': '#9a3412',
      '--on-brand': '#2a0f05',
      '--surface': '#1a0909',
      '--surface-2': '#210d0d',
      '--on-surface': '#fde8d3',
      '--text-base': '#fee7d3',
      '--text-muted': '#fcd2b8',
      '--text-subtle': '#fdba74'
    }
  }
};

export const DEFAULT_SETTINGS = {
  announcement: '',
  idleMs: 60000,
  highlightMs: 8000,
  theme: 'evergreen',
  splashTitle: 'Welcome to Imagine Church',
  splashSubtitle: 'Tap below to explore how Imagine Church is moving through missions and outreach.',
  splashImage: ''
};

export const DEFAULT_META = {
  updatedAt: null
};

export const DEFAULT_MISSIONS = [
  {
    id: 'kairos',
    title: 'Cookies for Kairos',
    subtitle: 'Bake hope. Share grace with those inside.',
    focus: 'Support Kairos Prison Ministry by baking dozens of cookies for weekend retreats.',
    involved: 'Bake 2–4 dozen cookies, pray over each batch, drop off by the due date.',
    contact: 'missions@imaginechurchnow.com',
    body: 'Kairos brings the love and forgiveness of Jesus Christ to incarcerated individuals and their families. Cookies are a tangible way to open hearts and start conversations.',
    image: `${MISSION_IMAGE_DIR}kairos.jpg`, // place kairos.jpg under images/missions/
    links: [
      { label: 'Cookie Guidelines (PDF)', href: '#' },
      { label: 'Sign Up', href: '#' }
    ]
  },
  {
    id: 'trauma',
    title: 'Trauma Center',
    subtitle: 'Care for the wounded. Restore dignity and hope.',
    focus: 'Partner with local trauma recovery services to provide supplies and volunteer hours.',
    involved: 'Donate gift cards / hygiene kits, volunteer for intake or prayer team.',
    contact: 'care@imaginechurchnow.com',
    body: 'We serve survivors with practical resources, compassionate presence, and pathways to long-term healing.',
    image: `${MISSION_IMAGE_DIR}trauma.jpg`,
    links: [
      { label: 'Needed Items List', href: '#' },
      { label: 'Volunteer Form', href: '#' }
    ]
  },
  {
    id: 'other',
    title: 'Some Other Thing',
    subtitle: 'Another local or global mission focus.',
    focus: 'Describe the cause and the practical impact here.',
    involved: 'Provide 2–3 clear next steps to engage.',
    contact: 'hello@imaginechurchnow.com',
    body: 'Use this slot for a rotating or seasonal mission (e.g., school supply drive, Honduras trip, etc.).',
    image: `${MISSION_IMAGE_DIR}seasonal.jpg`,
    links: [{ label: 'Learn More', href: '#' }]
  }
];

export const state = {
  settings: { ...DEFAULT_SETTINGS },
  meta: { ...DEFAULT_META },
  missions: clone(DEFAULT_MISSIONS),
  pendingMissions: [],
  pendingSettings: null,
  historyStack: [],
  appStarted: false,
  highlightTimer: null,
  idleTimer: null,
  missionsDirHandle: null,
  generalDirHandle: null
};

export const FS_SUPPORTED = 'showDirectoryPicker' in window;
