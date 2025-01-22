"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseModule = void 0;
const common_1 = require("@nestjs-mod/common");
const core_1 = require("@nestjs/core");
const supabase_constants_1 = require("./supabase.constants");
const supabase_environments_1 = require("./supabase.environments");
const supabase_guard_1 = require("./supabase.guard");
const supabase_service_1 = require("./supabase.service");
const supabase_configuration_1 = require("./supabase.configuration");
exports.SupabaseModule = (0, common_1.createNestModule)({
    moduleName: supabase_constants_1.SUPABASE_MODULE,
    moduleCategory: common_1.NestModuleCategory.core,
    moduleDescription: 'Universal javaScript SDK for Supabase API',
    configurationModel: supabase_configuration_1.SupabaseConfiguration,
    environmentsModel: supabase_environments_1.SupabaseEnvironments,
    sharedProviders: [supabase_service_1.SupabaseService],
    providers: [{ provide: core_1.APP_GUARD, useClass: supabase_guard_1.SupabaseGuard }],
}).SupabaseModule;
//# sourceMappingURL=supabase.module.js.map