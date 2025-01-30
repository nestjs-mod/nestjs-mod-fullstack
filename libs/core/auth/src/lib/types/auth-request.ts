import { AuthUser } from '../generated/rest/dto/auth-user.entity';

export type AuthRequest = {
  authUser?: AuthUser | null;
  headers: Record<string, string>;
  externalUserId?: string;
  externalUser?: { email: string; role: string };
  skippUserNotFoundError?: boolean;
};
