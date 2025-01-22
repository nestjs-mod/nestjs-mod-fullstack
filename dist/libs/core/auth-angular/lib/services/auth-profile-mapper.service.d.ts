import { UpdateProfileInput } from '@authorizerdev/authorizer-js';
import * as i0 from "@angular/core";
export declare class AuthProfileMapperService {
    toModel(data: UpdateProfileInput): {
        old_password: string | undefined;
        new_password: string | undefined;
        confirm_new_password: string | undefined;
        picture: string | undefined;
    };
    toJson(data: UpdateProfileInput): {
        old_password: string | undefined;
        new_password: string | undefined;
        confirm_new_password: string | undefined;
        picture: string | undefined;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<AuthProfileMapperService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AuthProfileMapperService>;
}
