import { AuthToken, LoginInput, SignupInput, UpdateProfileInput, User } from '@authorizerdev/authorizer-js';
import { BehaviorSubject } from 'rxjs';
import { AuthConfiguration } from './auth.configuration';
import { AuthorizerService } from './authorizer.service';
import { TokensService } from './tokens.service';
import * as i0 from "@angular/core";
export declare class AuthService {
    protected readonly tokensService: TokensService;
    protected readonly authConfiguration?: AuthConfiguration | undefined;
    protected readonly authorizerService?: AuthorizerService | undefined;
    profile$: BehaviorSubject<User | undefined>;
    constructor(tokensService: TokensService, authConfiguration?: AuthConfiguration | undefined, authorizerService?: AuthorizerService | undefined);
    getAuthorizerClientID(): string;
    setAuthorizerClientID(clientID: string): void;
    signUp(data: SignupInput): import("rxjs").Observable<{
        profile: User | undefined;
        tokens: AuthToken | undefined;
    }>;
    updateProfile(data: UpdateProfileInput): import("rxjs").Observable<User | {
        new: User | undefined;
    } | undefined>;
    signIn(data: LoginInput): import("rxjs").Observable<{
        profile: User | undefined;
        tokens: AuthToken | undefined;
    }>;
    signOut(): import("rxjs").Observable<User | undefined>;
    refreshToken(): import("rxjs").Observable<User | undefined>;
    clearProfileAndTokens(): import("rxjs").Observable<User | undefined>;
    setProfileAndTokens(result: AuthToken | undefined): import("rxjs").Observable<User | undefined>;
    getAuthorizationHeaders(): Record<string, string>;
    setProfile(result: User | undefined): import("rxjs").Observable<User | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<AuthService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AuthService>;
}
