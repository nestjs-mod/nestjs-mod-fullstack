import { ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaToolsEnvironments } from './prisma-tools.environments';
import { PrismaToolsService } from './prisma-tools.service';
export declare class PrismaToolsExceptionsFilter extends BaseExceptionFilter {
    private readonly prismaToolsService;
    private readonly prismaToolsEnvironments;
    private logger;
    constructor(prismaToolsService: PrismaToolsService, prismaToolsEnvironments: PrismaToolsEnvironments);
    catch(exception: HttpException, host: ArgumentsHost): void;
}
