"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod-fullstack/common");
const prisma_tools_1 = require("@nestjs-mod-fullstack/prisma-tools");
const validation_1 = require("@nestjs-mod-fullstack/validation");
const prisma_1 = require("@nestjs-mod/prisma");
const common_2 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const webhook_client_1 = require("@prisma/webhook-client");
const class_validator_1 = require("class-validator");
const nestjs_translates_1 = require("nestjs-translates");
const create_webhook_dto_1 = require("../generated/rest/dto/create-webhook.dto");
const update_webhook_dto_1 = require("../generated/rest/dto/update-webhook.dto");
const webhook_user_entity_1 = require("../generated/rest/dto/webhook-user.entity");
const webhook_entity_1 = require("../generated/rest/dto/webhook.entity");
const webhook_tools_service_1 = require("../services/webhook-tools.service");
const find_many_webhook_log_response_1 = require("../types/find-many-webhook-log-response");
const find_many_webhook_response_1 = require("../types/find-many-webhook-response");
const webhook_entities_1 = require("../types/webhook-entities");
const webhook_event_1 = require("../types/webhook-event");
const webhook_configuration_1 = require("../webhook.configuration");
const webhook_constants_1 = require("../webhook.constants");
const webhook_decorators_1 = require("../webhook.decorators");
const webhook_errors_1 = require("../webhook.errors");
let WebhookController = class WebhookController {
    constructor(prismaClient, webhookConfiguration, prismaToolsService, webhookToolsService, translatesService) {
        this.prismaClient = prismaClient;
        this.webhookConfiguration = webhookConfiguration;
        this.prismaToolsService = prismaToolsService;
        this.webhookToolsService = webhookToolsService;
        this.translatesService = translatesService;
    }
    async profile(webhookUser) {
        return webhookUser;
    }
    async events() {
        return this.webhookConfiguration.events.map((e) => ({
            ...e,
            descriptionLocale: { en: e.description },
        }));
    }
    async findMany(externalTenantId, webhookUser, args) {
        const { take, skip, curPage, perPage } = this.prismaToolsService.getFirstSkipFromCurPerPage({
            curPage: args.curPage,
            perPage: args.perPage,
        });
        const searchText = args.searchText;
        const orderBy = (args.sort || 'createdAt:desc')
            .split(',')
            .map((s) => s.split(':'))
            .reduce((all, [key, value]) => ({
            ...all,
            ...(key in webhook_client_1.Prisma.WebhookScalarFieldEnum
                ? {
                    [key]: value === 'desc' ? 'desc' : 'asc',
                }
                : {}),
        }), {});
        const result = await this.prismaClient.$transaction(async (prisma) => {
            return {
                webhooks: await prisma.webhook.findMany({
                    where: {
                        ...(searchText
                            ? {
                                OR: [
                                    ...((0, class_validator_1.isUUID)(searchText)
                                        ? [
                                            { id: { equals: searchText } },
                                            { externalTenantId: { equals: searchText } },
                                        ]
                                        : []),
                                    { endpoint: { contains: searchText, mode: 'insensitive' } },
                                    {
                                        eventName: { contains: searchText, mode: 'insensitive' },
                                    },
                                ],
                            }
                            : {}),
                        ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookUser.userRole === 'Admin' ? undefined : externalTenantId),
                    },
                    take,
                    skip,
                    orderBy,
                }),
                totalResults: await prisma.webhook.count({
                    where: {
                        ...(searchText
                            ? {
                                OR: [
                                    ...((0, class_validator_1.isUUID)(searchText)
                                        ? [
                                            { id: { equals: searchText } },
                                            { externalTenantId: { equals: searchText } },
                                        ]
                                        : []),
                                    { endpoint: { contains: searchText, mode: 'insensitive' } },
                                    {
                                        eventName: { contains: searchText, mode: 'insensitive' },
                                    },
                                ],
                            }
                            : {}),
                        ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookUser.userRole === 'Admin' ? undefined : externalTenantId),
                    },
                }),
            };
        });
        return {
            webhooks: result.webhooks,
            meta: {
                totalResults: result.totalResults,
                curPage,
                perPage,
            },
        };
    }
    async createOne(externalTenantId, webhookUser, args) {
        return await this.prismaClient.webhook.create({
            data: {
                ...args,
                WebhookUser_Webhook_createdByToWebhookUser: {
                    connect: { id: webhookUser.id },
                },
                WebhookUser_Webhook_updatedByToWebhookUser: {
                    connect: { id: webhookUser.id },
                },
                ...this.webhookToolsService.externalTenantIdQuery(webhookUser, externalTenantId),
            },
        });
    }
    async updateOne(externalTenantId, webhookUser, id, args) {
        return await this.prismaClient.webhook.update({
            data: { ...args, updatedAt: new Date() },
            where: {
                id,
                ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookUser.userRole === 'Admin' ? undefined : externalTenantId),
            },
        });
    }
    async deleteOne(externalTenantId, webhookUser, id, locale) {
        await this.prismaClient.webhook.delete({
            where: {
                id,
                ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookUser.userRole === 'Admin' ? undefined : externalTenantId),
            },
        });
        return { message: this.translatesService.translate('ok', locale) };
    }
    async findOne(externalTenantId, webhookUser, id) {
        return await this.prismaClient.webhook.findFirstOrThrow({
            where: {
                id,
                ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookUser.userRole === 'Admin' ? undefined : externalTenantId),
            },
        });
    }
    async findManyLogs(externalTenantId, webhookUser, id, args) {
        const { take, skip, curPage, perPage } = this.prismaToolsService.getFirstSkipFromCurPerPage({
            curPage: args.curPage,
            perPage: args.perPage,
        });
        const searchText = args.searchText;
        const orderBy = (args.sort || 'createdAt:desc')
            .split(',')
            .map((s) => s.split(':'))
            .reduce((all, [key, value]) => ({
            ...all,
            ...(key in webhook_client_1.Prisma.WebhookLogScalarFieldEnum
                ? {
                    [key]: value === 'desc' ? 'desc' : 'asc',
                }
                : {}),
        }), {});
        const result = await this.prismaClient.$transaction(async (prisma) => {
            return {
                webhookLogs: await prisma.webhookLog.findMany({
                    where: {
                        ...(searchText
                            ? {
                                OR: [
                                    ...((0, class_validator_1.isUUID)(searchText)
                                        ? [
                                            { id: { equals: searchText } },
                                            { externalTenantId: { equals: searchText } },
                                            { webhookId: { equals: searchText } },
                                        ]
                                        : []),
                                    { response: { string_contains: searchText } },
                                    { request: { string_contains: searchText } },
                                    {
                                        responseStatus: {
                                            contains: searchText,
                                            mode: 'insensitive',
                                        },
                                    },
                                ],
                            }
                            : {}),
                        ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookUser.userRole === 'Admin' ? undefined : externalTenantId),
                        webhookId: id,
                    },
                    take,
                    skip,
                    orderBy,
                }),
                totalResults: await prisma.webhookLog.count({
                    where: {
                        ...(searchText
                            ? {
                                OR: [
                                    ...((0, class_validator_1.isUUID)(searchText)
                                        ? [
                                            { id: { equals: searchText } },
                                            { externalTenantId: { equals: searchText } },
                                            { webhookId: { equals: searchText } },
                                        ]
                                        : []),
                                    { response: { string_contains: searchText } },
                                    { request: { string_contains: searchText } },
                                    {
                                        responseStatus: {
                                            contains: searchText,
                                            mode: 'insensitive',
                                        },
                                    },
                                ],
                            }
                            : {}),
                        ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookUser.userRole === 'Admin' ? undefined : externalTenantId),
                        webhookId: id,
                    },
                }),
            };
        });
        return {
            webhookLogs: result.webhookLogs,
            meta: {
                totalResults: result.totalResults,
                curPage,
                perPage,
            },
        };
    }
};
exports.WebhookController = WebhookController;
tslib_1.__decorate([
    (0, common_2.Get)('profile'),
    (0, swagger_1.ApiOkResponse)({ type: webhook_user_entity_1.WebhookUser }),
    tslib_1.__param(0, (0, webhook_decorators_1.CurrentWebhookUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [webhook_user_entity_1.WebhookUser]),
    tslib_1.__metadata("design:returntype", Promise)
], WebhookController.prototype, "profile", null);
tslib_1.__decorate([
    (0, common_2.Get)('events'),
    (0, swagger_1.ApiOkResponse)({ type: webhook_event_1.WebhookEvent, isArray: true }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], WebhookController.prototype, "events", null);
tslib_1.__decorate([
    (0, common_2.Get)(),
    (0, swagger_1.ApiOkResponse)({ type: find_many_webhook_response_1.FindManyWebhookResponse }),
    tslib_1.__param(0, (0, webhook_decorators_1.CurrentWebhookExternalTenantId)()),
    tslib_1.__param(1, (0, webhook_decorators_1.CurrentWebhookUser)()),
    tslib_1.__param(2, (0, common_2.Query)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, webhook_user_entity_1.WebhookUser,
        common_1.FindManyArgs]),
    tslib_1.__metadata("design:returntype", Promise)
], WebhookController.prototype, "findMany", null);
tslib_1.__decorate([
    (0, common_2.Post)(),
    (0, swagger_1.ApiCreatedResponse)({ type: webhook_entity_1.Webhook }),
    tslib_1.__param(0, (0, webhook_decorators_1.CurrentWebhookExternalTenantId)()),
    tslib_1.__param(1, (0, webhook_decorators_1.CurrentWebhookUser)()),
    tslib_1.__param(2, (0, common_2.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, webhook_user_entity_1.WebhookUser,
        create_webhook_dto_1.CreateWebhookDto]),
    tslib_1.__metadata("design:returntype", Promise)
], WebhookController.prototype, "createOne", null);
tslib_1.__decorate([
    (0, common_2.Put)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: webhook_entity_1.Webhook }),
    tslib_1.__param(0, (0, webhook_decorators_1.CurrentWebhookExternalTenantId)()),
    tslib_1.__param(1, (0, webhook_decorators_1.CurrentWebhookUser)()),
    tslib_1.__param(2, (0, common_2.Param)('id', new common_2.ParseUUIDPipe())),
    tslib_1.__param(3, (0, common_2.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, webhook_user_entity_1.WebhookUser, String, update_webhook_dto_1.UpdateWebhookDto]),
    tslib_1.__metadata("design:returntype", Promise)
], WebhookController.prototype, "updateOne", null);
tslib_1.__decorate([
    (0, common_2.Delete)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: common_1.StatusResponse }),
    tslib_1.__param(0, (0, webhook_decorators_1.CurrentWebhookExternalTenantId)()),
    tslib_1.__param(1, (0, webhook_decorators_1.CurrentWebhookUser)()),
    tslib_1.__param(2, (0, common_2.Param)('id', new common_2.ParseUUIDPipe())),
    tslib_1.__param(3, (0, nestjs_translates_1.CurrentLocale)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, webhook_user_entity_1.WebhookUser, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], WebhookController.prototype, "deleteOne", null);
tslib_1.__decorate([
    (0, common_2.Get)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: webhook_entity_1.Webhook }),
    tslib_1.__param(0, (0, webhook_decorators_1.CurrentWebhookExternalTenantId)()),
    tslib_1.__param(1, (0, webhook_decorators_1.CurrentWebhookUser)()),
    tslib_1.__param(2, (0, common_2.Param)('id', new common_2.ParseUUIDPipe())),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, webhook_user_entity_1.WebhookUser, String]),
    tslib_1.__metadata("design:returntype", Promise)
], WebhookController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_2.Get)(':id/logs'),
    (0, swagger_1.ApiOkResponse)({ type: find_many_webhook_log_response_1.FindManyWebhookLogResponse }),
    tslib_1.__param(0, (0, webhook_decorators_1.CurrentWebhookExternalTenantId)()),
    tslib_1.__param(1, (0, webhook_decorators_1.CurrentWebhookUser)()),
    tslib_1.__param(2, (0, common_2.Param)('id', new common_2.ParseUUIDPipe())),
    tslib_1.__param(3, (0, common_2.Query)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, webhook_user_entity_1.WebhookUser, String, common_1.FindManyArgs]),
    tslib_1.__metadata("design:returntype", Promise)
], WebhookController.prototype, "findManyLogs", null);
exports.WebhookController = WebhookController = tslib_1.__decorate([
    (0, swagger_1.ApiExtraModels)(webhook_errors_1.WebhookError, webhook_entities_1.WebhookEntities, validation_1.ValidationError),
    (0, swagger_1.ApiBadRequestResponse)({
        schema: { allOf: (0, swagger_1.refs)(webhook_errors_1.WebhookError, validation_1.ValidationError) },
    }),
    (0, swagger_1.ApiTags)('Webhook'),
    (0, webhook_decorators_1.CheckWebhookRole)([webhook_client_1.WebhookRole.User, webhook_client_1.WebhookRole.Admin]),
    (0, common_2.Controller)('/webhook'),
    tslib_1.__param(0, (0, prisma_1.InjectPrismaClient)(webhook_constants_1.WEBHOOK_FEATURE)),
    tslib_1.__metadata("design:paramtypes", [webhook_client_1.PrismaClient,
        webhook_configuration_1.WebhookConfiguration,
        prisma_tools_1.PrismaToolsService,
        webhook_tools_service_1.WebhookToolsService,
        nestjs_translates_1.TranslatesService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map