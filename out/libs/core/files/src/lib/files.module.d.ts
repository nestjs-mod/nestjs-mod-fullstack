export declare const FilesModule: Record<"forFeatureAsync", (asyncOptions?: import("@nestjs-mod/common").ForFeatureAsyncMethodOptions<never, never, never, never, never, never> | undefined) => Promise<import("@nestjs/common").DynamicModule>> & Record<"forFeature", (options?: {
    featureModuleName: string;
    contextName?: string;
} | undefined) => Promise<import("@nestjs/common").DynamicModule>> & Record<"forRoot", (options?: {
    contextName?: string;
} | undefined) => Promise<import("@nestjs/common").DynamicModule>> & Record<"forRootAsync", (asyncOptions?: import("@nestjs-mod/common").ForRootAsyncMethodOptions<never, never, never, never> | undefined) => Promise<import("@nestjs/common").DynamicModule>>;
