import { ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { AuthEnvironments } from './auth.environments';
import { SupabaseError } from '@nestjs-mod-fullstack/common';
export declare class AuthExceptionsFilter extends BaseExceptionFilter {
    private readonly authEnvironments;
    private logger;
    constructor(authEnvironments: AuthEnvironments);
    catch(exception: SupabaseError, host: ArgumentsHost): void;
}
