export interface Scan {
  id: string;
  timestamp: string;
  userAgent: string;
  browser: string;
  device: string;
  os: string;
  referrer: string;
}

export interface QRConfig {
  fgColor?: string;
  bgColor?: string;
  ecc?: 'L' | 'M' | 'Q' | 'H';
  logoType?: 'none' | 'preset' | 'upload' | 'text';
  presetLogo?: string;
  customLogoUrl?: string;
  logoText?: string;
  logoSize?: number;
  logoShape?: 'circle' | 'square' | 'rounded';
  logoPadding?: number;
  logoBgColor?: string;
}

export interface RedirectLink {
  id: string;
  name: string;
  destinationUrl: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'paused';
  scanCount: number;
  scansInLast24h?: number;
  tags?: string[];
  qrConfig?: QRConfig;
}

export interface RedirectLinkDetailed extends RedirectLink {
  scans: Scan[];
}

export interface ThemeConfig {
  id: string;
  name: string;
  isDark: boolean;
  background: string;
  text: string;
  headingText: string;
  cardBg: string;
  cardBorder: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  buttonActive: string;
  buttonHover: string;
  inputBg: string;
  secondaryText: string;
  accentGradient: string;
  statCardBg: string;
  statCardText: string;
}
