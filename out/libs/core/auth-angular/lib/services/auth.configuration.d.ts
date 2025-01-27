import { InjectionToken } from '@angular/core';
import { UpdateProfileInput, User } from '@authorizerdev/authorizer-js';
import { Observable } from 'rxjs';
export type AfterUpdateProfileEvent = {
    old?: User;
    new?: User;
};
export declare class AuthConfiguration {
    constructor(options?: AuthConfiguration);
    beforeUpdateProfile?(data: UpdateProfileInput): Observable<UpdateProfileInput>;
    afterUpdateProfile?(data: AfterUpdateProfileEvent): Observable<User | undefined>;
    getAuthorizationHeaders?(): Record<string, string>;
}
export declare const AUTH_CONFIGURATION_TOKEN: InjectionToken<string>;
