export declare enum AuthErrorEnum {
    COMMON = "AUTH-000",
    FORBIDDEN = "AUTH-001",
    USER_NOT_FOUND = "AUTH-002"
}
export declare const AUTH_ERROR_ENUM_TITLES: Record<AuthErrorEnum, string>;
export declare class AuthError<T = unknown> extends Error {
    message: string;
    code: AuthErrorEnum;
    metadata?: T;
    constructor(message?: string | AuthErrorEnum, code?: AuthErrorEnum, metadata?: T);
}
