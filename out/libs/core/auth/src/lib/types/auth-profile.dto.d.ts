import { AuthRole } from '@prisma/auth-client';
import { CreateAuthUserDto } from '../generated/rest/dto/create-auth-user.dto';
declare const AuthProfileDto_base: import("@nestjs/common").Type<Pick<CreateAuthUserDto, "timezone" | "lang">>;
export declare class AuthProfileDto extends AuthProfileDto_base {
    userRole?: AuthRole | null;
}
export {};
