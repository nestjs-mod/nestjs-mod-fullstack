import { FindManyResponseMeta } from '@nestjs-mod-fullstack/common';
import { AuthUser } from '../generated/rest/dto/auth-user.entity';
export declare class FindManyAuthUserResponse {
    authUsers: AuthUser[];
    meta: FindManyResponseMeta;
}
