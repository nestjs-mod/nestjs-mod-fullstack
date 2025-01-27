import { AuthToken } from '@authorizerdev/authorizer-js';
import * as i0 from "@angular/core";
export declare class TokensService {
    private tokens$;
    getRefreshToken(): string | null;
    getAccessToken(): string | null;
    setTokens(tokens: AuthToken): void;
    getStream(): import("rxjs").Observable<AuthToken | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TokensService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TokensService>;
}
