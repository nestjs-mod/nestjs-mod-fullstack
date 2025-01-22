import { SignupInput } from '@authorizerdev/authorizer-js';
import * as i0 from "@angular/core";
export declare class AuthSignUpMapperService {
    toModel(data: SignupInput): {
        email: string | undefined;
        password: string;
        confirm_password: string;
    };
    toJson(data: SignupInput): {
        email: string | undefined;
        password: string;
        confirm_password: string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<AuthSignUpMapperService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AuthSignUpMapperService>;
}
