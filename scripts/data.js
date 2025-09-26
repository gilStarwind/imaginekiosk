import { clone } from './helpers.js';

export const ASSET_ROOT = 'images';
export const MISSION_IMAGE_DIR = `${ASSET_ROOT}/missions/`;
export const GENERAL_IMAGE_DIR = `${ASSET_ROOT}/general/`;
export const LOGO_URL = `${GENERAL_IMAGE_DIR}logo.png`;
// Lightweight inline SVG placeholder (works offline)
export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">` +
      `<defs>` +
      `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0%" stop-color="#0b1220"/>` +
      `<stop offset="100%" stop-color="#0f172a"/>` +
      `</linearGradient>` +
      `</defs>` +
      `<rect width="1200" height="800" fill="url(#g)"/>` +
      `<g fill="#99f6e4" font-family="sans-serif" text-anchor="middle">` +
      `<text x="600" y="380" font-size="64" font-weight="700">Mission Image</text>` +
      `<text x="600" y="440" font-size="28" fill="#a7f3d0">Add a photo in Admin</text>` +
      `</g>` +
      `</svg>`
  );

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
  // Generic boilerplate text for initial load; customize via Admin
  // Note: images can be set later in Admin; start blank
  {
    id: 'give-hope-global',
    title: 'Give Hope Global',
    subtitle: '',
    focus: 'Mission Focus: Briefly describe the heart of this ministry and who it serves.',
    involved: 'How to Get Involved: Pray, give, or serve. Ask about upcoming needs and events.',
    contact: 'missions@imaginechurchnow.com',
    body: 'About this Mission: Add a short paragraph with story, impact, or goals so guests understand why this matters.',
    image: '/images/missions/givehope_color.png',
    links: []
  },
  {
    id: 'rideability-therapeutic-riding-center',
    title: 'Rideability Therapeutic Riding Center',
    subtitle: '',
    focus: 'Mission Focus: Supporting therapeutic riding to empower individuals with special needs.',
    involved: 'How to Get Involved: Volunteer at sessions, help with care, or provide resources.',
    contact: 'missions@imaginechurchnow.com',
    body: 'About this Mission: Share how riding builds strength, confidence, and connection for participants and families.',
    image: '/images/missions/rideability.png',
    links: []
  },
  {
    id: 'kairos-prison-ministry',
    title: 'Kairos Prison Ministry',
    subtitle: '',
    focus: 'Mission Focus: Bring Christ’s love and forgiveness to the incarcerated and their families.',
    involved: 'How to Get Involved: Pray, write encouragement, serve meals, or support weekend retreats.',
    contact: 'missions@imaginechurchnow.com',
    body: 'About this Mission: Kairos changes lives through community, compassion, and consistent presence.',
    image: '/images/missions/kairos.png',
    links: []
  },
  {
    id: 'community-bible-study',
    title: 'Community Bible Study',
    subtitle: '',
    focus: 'Mission Focus: Help people encounter God through Scripture in community.',
    involved: 'How to Get Involved: Join a study, invite a friend, or serve as a leader.',
    contact: 'missions@imaginechurchnow.com',
    body: 'About this Mission: Life transformation happens as we gather, read, and respond to God’s Word.',
    image: '/images/missions/community_bible_study.png',
    links: []
  },
  {
    id: 'palmetto-womens-center',
    title: 'Palmetto Women’s Center',
    subtitle: '',
    focus: 'Mission Focus: Provide life-affirming support, resources, and care for women and families.',
    involved: 'How to Get Involved: Donate supplies, volunteer your skills, or become a prayer partner.',
    contact: 'missions@imaginechurchnow.com',
    body: 'About this Mission: Compassionate, confidential help at crucial moments.',
    image: '/images/missions/palmetto_womens.png',
    links: []
  },
  {
    id: 'tender-hearts-ministries',
    title: 'Tender Hearts Ministries',
    subtitle: '',
    focus: 'Mission Focus: Serve neighbors in need with practical help and hope.',
    involved: 'How to Get Involved: Give goods, serve on-site, or support programs financially.',
    contact: 'missions@imaginechurchnow.com',
    body: 'About this Mission: Meeting immediate needs can open doors to lasting change.',
    image: '/images/missions/tender_hearts.png',
    links: []
  },
  {
    id: 'philippine-hope',
    title: 'Philippine Hope',
    subtitle: '',
    focus: 'Mission Focus: Partner in gospel-centered outreach and practical aid in the Philippines.',
    involved: 'How to Get Involved: Pray, sponsor a project, or join a future trip.',
    contact: 'missions@imaginechurchnow.com',
    body: 'About this Mission: Sharing Christ’s love through service, presence, and partnership.',
    image: '/images/missions/givehope_color.png',
    links: []
  },
  {
    id: 'kinard-elementary-school',
    title: 'Kinard Elementary School',
    subtitle: '',
    focus: 'Mission Focus: Encourage students and support staff through tangible care.',
    involved: 'How to Get Involved: Provide school supplies, mentorship, or staff appreciation help.',
    contact: 'missions@imaginechurchnow.com',
    body: 'About this Mission: Investing in local schools strengthens families and our community.',
    image: '/images/missions/kinard.png',
    links: []
  },
  {
    id: 'young-life-of-western-york-county',
    title: 'Young Life of Western York County',
    subtitle: '',
    focus: 'Mission Focus: Reach teens with the gospel through relationships and shared life.',
    involved: 'How to Get Involved: Become a leader, provide meals, or sponsor camp scholarships.',
    contact: 'missions@imaginechurchnow.com',
    body: 'About this Mission: Caring adults earn the right to be heard and point teens to Jesus.',
    image: '/images/missions/younglife.png',
    links: []
  },
  {
    id: 'wycliffe-bible-translators-se-asia',
    title: 'Wycliffe Bible Translators: Missionaries in Southeast Asia',
    subtitle: '',
    focus: 'Mission Focus: Accelerate Bible translation so every language can access God’s Word.',
    involved: 'How to Get Involved: Pray for teams, give to translation projects, share updates.',
    contact: 'missions@imaginechurchnow.com',
    body: 'About this Mission: Scripture in the heart language transforms lives and communities.',
    image: './images/missions/wycliffe.svg',
    links: [{ label: 'https://www.wycliffe.org', href: '#' }]
  },
  {
    id: 'clover-area-assistance-center',
    title: 'Clover Area Assistance Center',
    subtitle: '',
    focus: 'Mission Focus: Provide food, financial assistance, and resources for local families.',
    involved: 'How to Get Involved: Serve at the pantry, donate goods, or assist with client care.',
    contact: 'missions@imaginechurchnow.com',
    body: 'About this Mission: Compassionate care that meets needs with dignity and respect.',
    image: './images/missions/cloverarea-logo.png',
    links: [{ label: 'Visit Website', href: 'https://cloverareaassistance.org' }]
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
