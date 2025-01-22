import { WebhookConfiguration, WebhookStaticConfiguration } from './webhook.configuration';
import { WebhookEnvironments } from './webhook.environments';
export declare const WebhookModule: Record<"forFeatureAsync", (asyncOptions?: import("@nestjs-mod/common").ForFeatureAsyncMethodOptions<WebhookConfiguration, WebhookStaticConfiguration, never, WebhookEnvironments, never, never> | undefined) => Promise<import("@nestjs/common").DynamicModule>> & Record<"forFeature", (options?: {
    featureModuleName: string;
    contextName?: string;
} | undefined) => Promise<import("@nestjs/common").DynamicModule>> & Record<"forRoot", (options?: import("@nestjs-mod/common").ForRootMethodOptions<WebhookStaticConfiguration, WebhookConfiguration, never, WebhookEnvironments> | undefined) => Promise<import("@nestjs/common").DynamicModule>> & Record<"forRootAsync", (asyncOptions?: import("@nestjs-mod/common").ForRootAsyncMethodOptions<WebhookStaticConfiguration, WebhookConfiguration, never, WebhookEnvironments> | undefined) => Promise<import("@nestjs/common").DynamicModule>>;
