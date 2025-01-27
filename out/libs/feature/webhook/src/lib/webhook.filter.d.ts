import { ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { WebhookError } from './webhook.errors';
export declare class WebhookExceptionsFilter extends BaseExceptionFilter {
    private logger;
    catch(exception: WebhookError, host: ArgumentsHost): void;
}
