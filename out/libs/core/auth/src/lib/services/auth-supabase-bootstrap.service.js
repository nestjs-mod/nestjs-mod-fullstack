"use strict";
var AuthSupabaseBootstrapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSupabaseBootstrapService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod/common");
const common_2 = require("@nestjs/common");
const auth_environments_1 = require("../auth.environments");
const auth_supabase_service_1 = require("./auth-supabase.service");
let AuthSupabaseBootstrapService = AuthSupabaseBootstrapService_1 = class AuthSupabaseBootstrapService {
    constructor(authSupabaseService, authEnvironments) {
        this.authSupabaseService = authSupabaseService;
        this.authEnvironments = authEnvironments;
        this.logger = new common_2.Logger(AuthSupabaseBootstrapService_1.name);
    }
    async onModuleInit() {
        this.logger.debug('onModuleInit');
        if (!(0, common_1.isInfrastructureMode)()) {
            try {
                await this.createAdmin();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            catch (err) {
                this.logger.error(err, err.stack);
            }
        }
    }
    async createAdmin() {
        try {
            if (this.authEnvironments.adminEmail &&
                this.authEnvironments.adminPassword) {
                await this.authSupabaseService.createAdmin({
                    username: this.authEnvironments.adminUsername,
                    password: this.authEnvironments.adminPassword,
                    email: this.authEnvironments.adminEmail,
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (err) {
            this.logger.error(err, err.stack);
        }
    }
};
exports.AuthSupabaseBootstrapService = AuthSupabaseBootstrapService;
exports.AuthSupabaseBootstrapService = AuthSupabaseBootstrapService = AuthSupabaseBootstrapService_1 = tslib_1.__decorate([
    (0, common_2.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [auth_supabase_service_1.AuthSupabaseService,
        auth_environments_1.AuthEnvironments])
], AuthSupabaseBootstrapService);
//# sourceMappingURL=auth-supabase-bootstrap.service.js.map