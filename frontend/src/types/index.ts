export type CardTheme = 'classic' | 'midnight' | 'sunrise' | 'forest' | 'graphite';

export type ConnectionSource = 'qr' | 'scan' | 'manual';

export interface SocialLinks {
  linkedin?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  facebook?: string | null;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Profile {
  id: number;
  user_id: number;
  slug: string;
  display_name: string;
  title: string | null;
  company: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  public_email: string | null;
  website: string | null;
  address: string | null;
  social_links: SocialLinks;
  theme: CardTheme;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  qr_payload: string | null;
}

export interface PublicProfile {
  slug: string;
  display_name: string;
  title: string | null;
  company: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  public_email: string | null;
  website: string | null;
  address: string | null;
  social_links: SocialLinks;
  theme: CardTheme;
}

export interface ProfileInput {
  display_name: string;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  phone?: string | null;
  public_email?: string | null;
  website?: string | null;
  address?: string | null;
  social_links?: SocialLinks;
  theme?: CardTheme;
  is_public?: boolean;
}

export interface Connection {
  id: number;
  owner_id: number;
  linked_profile_id: number | null;
  source: ConnectionSource;
  full_name: string;
  title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  tags: string[];
  raw_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConnectionManualInput {
  full_name: string;
  title?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  notes?: string | null;
  tags?: string[];
}

export interface ScanExtractResult {
  raw_image_url: string;
  full_name: string | null;
  title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  raw_text: string;
}

export interface ApiErrorBody {
  detail: string | { msg: string; loc: (string | number)[] }[];
}
