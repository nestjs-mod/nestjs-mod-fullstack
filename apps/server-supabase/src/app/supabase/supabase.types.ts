import { User } from '@supabase/supabase-js';

export type SupabaseUser = Partial<User> & {
  picture?: string;
};

export type CheckAccessOptions = {
  roles?: string[];
  permissions: string[];
  types?: string[];
};

export type SupabaseRequest = {
  supabaseUser?: SupabaseUser;
  externalUserId?: string;
  externalAppId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: any;
  skippedBySupabase?: boolean;
  skipEmptySupabaseUser?: boolean;
};
