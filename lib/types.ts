export interface MissionLink {
  label: string;
  href: string;
}

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  focus: string;
  involved: string;
  contact: string;
  body: string;
  image: string;
  links: MissionLink[];
}

export interface Settings {
  announcement: string;
  idleMs: number;
  highlightMs: number;
  theme: string;
  splashTitle: string;
  splashSubtitle: string;
  splashImage: string;
  webBlocklist: string[];
  sheetUrl?: string;
}
