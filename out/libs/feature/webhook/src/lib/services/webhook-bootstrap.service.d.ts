import { HttpService } from '@nestjs/axios';
import { OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/webhook-client';
import { WebhookEnvironments } from '../webhook.environments';
import { WebhookService } from './webhook.service';
export declare class WebhookServiceBootstrap implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly prismaClient;
    private readonly webhookEnvironments;
    private readonly httpService;
    private readonly webhookService;
    private readonly logger;
    private eventsRef?;
    constructor(prismaClient: PrismaClient, webhookEnvironments: WebhookEnvironments, httpService: HttpService, webhookService: WebhookService);
    onModuleDestroy(): void;
    onApplicationBootstrap(): Promise<void>;
    private subscribeToEvents;
    private getCurrentDatabaseDate;
    private httpRequest;
    private createDefaultUsers;
}
