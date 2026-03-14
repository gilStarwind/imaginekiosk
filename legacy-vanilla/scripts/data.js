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
  },
  sunrise: {
    label: 'Sunrise',
    gradient: 'linear-gradient(180deg,#ff8a66 0%,#ff5858 50%,#9d32ff 100%)',
    vars: {
      '--brand': '#ff9a5f',
      '--brand-700': '#ff6f61',
      '--brand-900': '#b03c79',
      '--on-brand': '#1a0b1f',
      '--surface': '#1d1022',
      '--surface-2': '#25152b',
      '--on-surface': '#ffe4f4',
      '--text-base': '#ffe9f7',
      '--text-muted': '#ffc7d5',
      '--text-subtle': '#ffd7ea'
    }
  },
  lagoon: {
    label: 'Lagoon',
    gradient: 'linear-gradient(180deg,#00c9ff 0%,#92fe9d 100%)',
    vars: {
      '--brand': '#41d1ff',
      '--brand-700': '#00b4d8',
      '--brand-900': '#0077b6',
      '--on-brand': '#04253a',
      '--surface': '#003049',
      '--surface-2': '#022b43',
      '--on-surface': '#d6f5ff',
      '--text-base': '#dff6ff',
      '--text-muted': '#a6e3ff',
      '--text-subtle': '#b2ffd6'
    }
  }
};

export const DEFAULT_SETTINGS = {
  announcement: '',
  idleMs: 60000,
  highlightMs: 10000,
  theme: 'evergreen',
  splashTitle: 'Imagine Serving Others',
  splashSubtitle: 'Touch to discover stories of hope and find your place to serve.',
  splashImage: LOGO_URL,
  // Domains that should not be opened in the in-app iframe (suffix match)
  webBlocklist: ['wycliffe.org', 'facebook.com', 'rideabilitysc.com']
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
    focus: 'Give Hope and its partners are seeing positive life change in communities in Haiti, Africa and the US. We are thankful to God for the opportunity to provide hope to those who are suffering.',
    involved: 'Pray, give, or serve. Ask about upcoming needs and events.',
    contact: 'https://www.givehopeglobal.org',
    body: 'The vision of Give Hope Global is to enable the people we serve to serve others both spiritually and physically. We hope to see these children change their country someday. We believe there are no limits to what they can achieve. The concept of preparing them to help others drives our plans and programs.',
    image: '/images/missions/givehope_color.png',
    links: [{ label: 'Visit Website', href: 'https://www.givehopeglobal.org' }]
  },
  {
    id: 'rideability-therapeutic-riding-center',
    title: 'Rideability Therapeutic Riding Center',
    subtitle: '',
    focus: 'Supporting therapeutic riding to empower individuals with special needs.',
    involved: 'Volunteer at sessions, help with care, or provide resources.',
    contact: 'rideabilitysc@gmail.com',
    body: 'RideAbility is a non-profit organization dedicated to enhancing the lives of children and adults with disabilities through therapeutic adaptive riding, equine-assisted services, and experiential learning with horses.',
    image: '/images/missions/rideability.png',
    links: [{ label: 'Visit Website', href: 'https://www.rideabilitysc.com' }]
  },
  {
    id: 'kairos-prison-ministry',
    title: 'Kairos Prison Ministry',
    subtitle: '',
    focus: 'Bring Christ`s love and forgiveness to the incarcerated and their families.',
    involved: 'Pray, write encouragement, serve meals, or support weekend retreats.',
    contact: 'https://kairosprisonministry.org/about-us/contact-us/',
    body: 'The Kairos programs take the participants on a journey that demonstrates the love and forgiveness of Jesus Christ. Kairos Prison Ministry is Christian in nature, although no religious affiliation is necessary to be a participant.',
    image: '/images/missions/kairos.png',
    links: [{ label: 'Visit Website', href: 'https://www.kairoslegacy.org' }]
  },
  {
    id: 'community-bible-study',
    title: 'Community Bible Study',
    subtitle: '',
    focus: 'Help people encounter God through Scripture in community.',
    involved: 'Join a study, invite a friend, or serve as a leader.',
    contact: 'info@communitybiblestudy.org',
    body: 'We love seeing what happens in people`s lives when they discover God through the study of His Word. We have Bible studies for all age groups and stages of life, from classes for toddlers and teens to classes for adults who are single and married. Together we explore the Bible and what it tells us about the God who has woven His story through history and is present with us now.',
    image: '/images/missions/community_bible_study.png',
    links: [{ label: 'Visit Website', href: 'https://www.communitybiblestudy.org' }]
  },
  {
    id: 'palmetto-womens-center',
    title: 'Palmetto Women’s Center',
    subtitle: '',
    focus: 'Provide life-affirming support, resources, and care for women and families.',
    involved: 'Donate supplies, volunteer your skills, or become a prayer partner.',
    contact: 'info@palmettowomenscenter.com',
    body: 'We empower women and families facing unexpected pregnancies in Rock Hill, South Carolina. We provide accurate information, free services, and practical support with a holistic and compassionate approach. ​We give each of our clients the care and attention they need, empowering them to make an informed decision for themselves and their future. ​ Palmetto Women`s Center is a 501c3 non-profit in the state of South Carolina. ​Community support ensures our ability to meet the needs of local women and men facing unexpected pregnancies. We are 100% funded through the generosity of individuals, businesses, and organizations in our community. All donations are tax-deductible.',
    image: '/images/missions/palmetto_womens.png',
    links: [{ label: 'Visit Website', href: 'https://www.palmettowomenscenter.com' }]
  },
  {
    id: 'tender-hearts-ministries',
    title: 'Tender Hearts Ministries',
    subtitle: '',
    focus: 'Serve neighbors in need with practical help and hope.',
    involved: 'Give goods, serve on-site, or support programs financially.',
    contact: 'public_relations@tenderheartsinyork.org',
    body: 'Tender Hearts Ministries is a non-profit 501(c)3 Christian organization that started in the City of York, South Carolina. For over 15 years, we have served families as well as men with children, women with children and homelessness in our community by transforming their lives in God’s glory. The operation is managed with paid staff and volunteers from our great community. As God leads, we partner with churches, individuals, businesses and organizations to maximize our reach.',
    image: '/images/missions/tender_hearts.png',
    links: [{ label: 'Visit Website', href: 'https://tenderheartssc.org' }]
  },
  {
    id: 'philippine-hope',
    title: 'Philippine Hope',
    subtitle: '',
    focus: 'Partner in gospel-centered outreach and practical aid in the Philippines.',
    involved: 'Pray, sponsor a project, or join a future trip.',
    contact: 'https://www.facebook.com/hopephilippinesofficial',
    body: 'Sharing Christ’s love through service, presence, and partnership.',
    image: '/images/missions/phphope.png',
    links: [{ label: 'Visit Website', href: 'https://www.facebook.com/hopephilippinesofficial/' }]
  },
  {
    id: 'kinard-elementary-school',
    title: 'Kinard Elementary School',
    subtitle: '',
    focus: 'Encourage students and support staff through tangible care.',
    involved: 'Provide school supplies, mentorship, or staff appreciation help.',
    contact: 'https://www.clover.k12.sc.us/o/kes',
    body: 'Kinard Elementary, a vibrant and nurturing learning community located in the heart of Clover, South Carolina. As a proud Leader in Me school, we are dedicated to fostering leadership, academic excellence, and personal growth for students from kindergarten through fifth grade.',
    image: '/images/missions/kinard.png',
    links: [{ label: 'Visit Website', href: 'https://www.clover.k12.sc.us/o/kes' }]
  },
  {
    id: 'young-life-of-western-york-county',
    title: 'Young Life of Western York County',
    subtitle: '',
    focus: 'Reach teens with the gospel through relationships and shared life.',
    involved: 'Become a leader, provide meals, or sponsor camp scholarships.',
    contact: 'https://younglife.org',
    body: 'Young Life is a mission devoted to introducing adolescents to Jesus Christ and helping them grow in their faith.',
    image: '/images/missions/younglife.png',
    links: [{ label: 'Visit Website', href: 'https://younglife.org' }]
  },
  {
    id: 'wycliffe-bible-translators-se-asia',
    title: 'Wycliffe Bible Translators: Missionaries in Southeast Asia',
    subtitle: '',
    focus: 'Accelerate Bible translation so every language can access God’s Word.',
    involved: 'Pray for teams, give to translation projects, share updates.',
    contact: 'https://www.wycliffe.org',
    body: 'That’s why Wycliffe Bible Translators USA exists: to work with churches, communities and partner organizations until everyone can access God`s Word in a language that touches their hearts. We`ll keep on working so all people — speaking or signing more than 7,000 languages worldwide — can have the Bible in the formats and languages that serve them best.',
    image: './images/missions/wycliffe.svg',
    links: [{ label: 'Visit Website', href: 'https://www.wycliffe.org' }]
  },
  {
    id: 'clover-area-assistance-center',
    title: 'Clover Area Assistance Center',
    subtitle: '',
    focus: 'Provide food, financial assistance, and resources for local families.',
    involved: 'Serve at the pantry, donate goods, or assist with client care.',
    contact: 'https://cloverareaassistance.org/contact-us/',
    body: 'Clover Area Assistance Center (CAAC) responds effectively and compassionately to those in need who live within the boundaries of the Clover School District. Basic, urgent needs are met through food, financial assistance, health services, and education. It is through local partnerships and collaborations that we strive to help people bridge the gap between dependence and self-sufficiency.',
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
