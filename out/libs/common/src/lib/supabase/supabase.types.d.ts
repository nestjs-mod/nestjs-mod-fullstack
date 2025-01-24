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
  headers?: any;
  skippedBySupabase?: boolean;
};
