export declare const SkipAuthGuard: import("@nestjs/core").ReflectableDecorator<true, true>;
export declare const CheckAuthRole: import("@nestjs/core").ReflectableDecorator<import("@prisma/auth-client").$Enums.AuthRole[], import("@prisma/auth-client").$Enums.AuthRole[]>;
export declare const CurrentAuthRequest: (...dataOrPipes: unknown[]) => ParameterDecorator;
export declare const CurrentAuthUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
export declare function UseAuthInterceptorsAndGuards(options?: {
    allowEmptyUser?: boolean;
}): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
