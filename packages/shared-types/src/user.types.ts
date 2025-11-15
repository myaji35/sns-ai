// User and Profile Types

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  industry?: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  platform: 'google_sheets' | 'instagram' | 'facebook' | 'naver';
  account_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
