import { AuthRole } from '../../../../../../../../node_modules/@prisma/auth-client';
export declare class UpdateAuthUserDto {
    externalUserId?: string;
    userRole?: AuthRole;
    timezone?: number | null;
    lang?: string | null;
}
