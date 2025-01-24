import { AuthRole } from '../../../../../../../../node_modules/@prisma/auth-client';
export declare class AuthUserDto {
  id: string;
  externalUserId: string;
  userRole: AuthRole;
  timezone: number | null;
  createdAt: Date;
  updatedAt: Date;
  lang: string | null;
}
