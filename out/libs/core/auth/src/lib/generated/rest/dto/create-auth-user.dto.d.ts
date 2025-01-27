import { AuthRole } from '../../../../../../../../node_modules/@prisma/auth-client';
export declare class CreateAuthUserDto {
    externalUserId: string;
    userRole: AuthRole;
    timezone?: number | null;
    lang?: string | null;
}
