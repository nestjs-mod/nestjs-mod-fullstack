"use strict";
var WebhookServiceBootstrap_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookServiceBootstrap = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod/common");
const prisma_1 = require("@nestjs-mod/prisma");
const axios_1 = require("@nestjs/axios");
const common_2 = require("@nestjs/common");
const webhook_client_1 = require("@prisma/webhook-client");
const axios_2 = require("axios");
const crypto_1 = require("crypto");
const rxjs_1 = require("rxjs");
const webhook_constants_1 = require("../webhook.constants");
const webhook_environments_1 = require("../webhook.environments");
const webhook_service_1 = require("./webhook.service");
let WebhookServiceBootstrap = WebhookServiceBootstrap_1 = class WebhookServiceBootstrap {
    constructor(prismaClient, webhookEnvironments, httpService, webhookService) {
        this.prismaClient = prismaClient;
        this.webhookEnvironments = webhookEnvironments;
        this.httpService = httpService;
        this.webhookService = webhookService;
        this.logger = new common_2.Logger(WebhookServiceBootstrap_1.name);
    }
    onModuleDestroy() {
        if (this.eventsRef) {
            this.eventsRef.unsubscribe();
            this.eventsRef = undefined;
        }
    }
    async onApplicationBootstrap() {
        if ((0, common_1.isInfrastructureMode)()) {
            return;
        }
        await this.createDefaultUsers();
        this.subscribeToEvents();
    }
    subscribeToEvents() {
        if (this.eventsRef) {
            this.eventsRef.unsubscribe();
            this.eventsRef = undefined;
        }
        this.eventsRef = this.webhookService.events$
            .asObservable()
            .pipe((0, rxjs_1.concatMap)(async ({ eventName, eventBody, eventHeaders }) => {
            this.logger.debug({ eventName, eventBody, eventHeaders });
            const [{ now }] = await this.getCurrentDatabaseDate();
            const webhooks = await this.prismaClient.webhook.findMany({
                where: { eventName: { contains: eventName }, enabled: true },
            });
            for (const webhook of webhooks) {
                if (!webhook.workUntilDate || now <= webhook.workUntilDate) {
                    const headers = {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ...(webhook.headers || {}),
                        ...(eventHeaders || {}),
                    };
                    const webhookLog = await this.prismaClient.webhookLog.create({
                        select: { id: true },
                        data: {
                            externalTenantId: webhook.externalTenantId,
                            request: {
                                url: webhook.endpoint,
                                body: eventBody,
                                headers,
                            },
                            responseStatus: '',
                            webhookStatus: 'Pending',
                            response: {},
                            webhookId: webhook.id,
                        },
                    });
                    try {
                        await this.prismaClient.webhookLog.update({
                            where: { id: webhookLog.id },
                            data: { webhookStatus: 'Process', updatedAt: new Date() },
                        });
                        const request = await this.httpRequest({
                            endpoint: webhook.endpoint,
                            eventBody,
                            headers,
                            requestTimeout: webhook.requestTimeout || 5000,
                        });
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        let response, responseStatus;
                        try {
                            response = request.data;
                            responseStatus = request.statusText;
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        }
                        catch (err) {
                            this.logger.error(err, err.stack);
                            response = String(err.message);
                            responseStatus = 'unhandled';
                        }
                        await this.prismaClient.webhookLog.update({
                            where: { id: webhookLog.id },
                            data: {
                                responseStatus,
                                response,
                                webhookStatus: 'Success',
                                updatedAt: new Date(),
                            },
                        });
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    }
                    catch (err) {
                        this.logger.error(err, err.stack);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        let response, responseStatus;
                        try {
                            response = err.response?.data || String(err.message);
                            responseStatus = err.response?.statusText;
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        }
                        catch (err2) {
                            this.logger.error(err2, err2.stack);
                            response = String(err2.message);
                            responseStatus = 'unhandled';
                        }
                        try {
                            await this.prismaClient.webhookLog.update({
                                where: { id: webhookLog.id },
                                data: {
                                    responseStatus,
                                    response,
                                    webhookStatus: err instanceof rxjs_1.TimeoutError ? 'Timeout' : 'Error',
                                    updatedAt: new Date(),
                                },
                            });
                        }
                        catch (err) {
                            this.logger.error(err, err.stack);
                        }
                    }
                }
            }
        }))
            .subscribe();
    }
    async getCurrentDatabaseDate() {
        return await this.prismaClient.$queryRaw `SELECT NOW();`;
    }
    async httpRequest({ endpoint, eventBody, headers, requestTimeout, }) {
        return await (0, rxjs_1.firstValueFrom)(this.httpService
            .post(endpoint, eventBody, {
            ...(Object.keys(headers)
                ? { headers: new axios_2.AxiosHeaders({ ...headers }) }
                : {}),
        })
            .pipe((0, rxjs_1.timeout)(requestTimeout)));
    }
    async createDefaultUsers() {
        try {
            if (this.webhookEnvironments.superAdminExternalUserId) {
                const existsUser = await this.prismaClient.webhookUser.findFirst({
                    where: {
                        externalUserId: this.webhookEnvironments.superAdminExternalUserId,
                        userRole: 'Admin',
                    },
                });
                if (!existsUser) {
                    await this.prismaClient.webhookUser.create({
                        data: {
                            externalTenantId: (0, crypto_1.randomUUID)(),
                            externalUserId: this.webhookEnvironments.superAdminExternalUserId,
                            userRole: 'Admin',
                        },
                    });
                }
            }
        }
        catch (err) {
            this.logger.error(err, err.stack);
        }
    }
};
exports.WebhookServiceBootstrap = WebhookServiceBootstrap;
exports.WebhookServiceBootstrap = WebhookServiceBootstrap = WebhookServiceBootstrap_1 = tslib_1.__decorate([
    (0, common_2.Injectable)(),
    tslib_1.__param(0, (0, prisma_1.InjectPrismaClient)(webhook_constants_1.WEBHOOK_FEATURE)),
    tslib_1.__metadata("design:paramtypes", [webhook_client_1.PrismaClient,
        webhook_environments_1.WebhookEnvironments,
        axios_1.HttpService,
        webhook_service_1.WebhookService])
], WebhookServiceBootstrap);
//# sourceMappingURL=webhook-bootstrap.service.js.map