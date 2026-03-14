import fs from 'fs';
import path from 'path';
import { Mission, Settings } from './types';

const DATA_DIR = process.cwd();
const MISSIONS_FILE = path.join(DATA_DIR, 'missions.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'config.json');

export const DEFAULT_SETTINGS: Settings = {
  announcement: '',
  idleMs: 60000,
  highlightMs: 10000,
  theme: 'evergreen',
  splashTitle: 'Imagine Serving Others',
  splashSubtitle: 'Touch to discover stories of hope and find your place to serve.',
  splashImage: '/images/general/logo.png',
  webBlocklist: ['wycliffe.org', 'facebook.com', 'rideabilitysc.com'],
};

export const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'give-hope-global',
    title: 'Give Hope Global',
    subtitle: '',
    focus: 'Give Hope and its partners are seeing positive life change in communities in Haiti, Africa and the US.',
    involved: 'Pray, give, or serve. Ask about upcoming needs and events.',
    contact: 'https://www.givehopeglobal.org',
    body: 'The vision of Give Hope Global is to enable the people we serve to serve others both spiritually and physically. We hope to see these children change their country someday.',
    image: '/images/missions/givehope_color.png',
    links: [{ label: 'Visit Website', href: 'https://www.givehopeglobal.org' }]
  },
  {
    id: 'rideability',
    title: 'Rideability Therapeutic Riding Center',
    subtitle: '',
    focus: 'Supporting therapeutic riding to empower individuals with special needs.',
    involved: 'Volunteer at sessions, help with care, or provide resources.',
    contact: 'rideabilitysc@gmail.com',
    body: 'RideAbility is a non-profit organization dedicated to enhancing the lives of children and adults with disabilities through therapeutic adaptive riding, equine-assisted services, and experiential learning with horses.',
    image: '/images/missions/rideability.png',
    links: [{ label: 'Visit Website', href: 'https://www.rideabilitysc.com' }]
  }
  // Simplified array for default fallback
];

export async function getMissions(): Promise<Mission[]> {
  try {
    if (fs.existsSync(MISSIONS_FILE)) {
      const data = fs.readFileSync(MISSIONS_FILE, 'utf-8');
      return JSON.parse(data) as Mission[];
    }
  } catch (error) {
    console.error('Failed to read missions file', error);
  }
  return DEFAULT_MISSIONS;
}

export async function saveMissions(missions: Mission[]): Promise<void> {
  fs.writeFileSync(MISSIONS_FILE, JSON.stringify(missions, null, 2), 'utf-8');
}

export async function getSettings(): Promise<Settings> {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Failed to read settings file', error);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}
