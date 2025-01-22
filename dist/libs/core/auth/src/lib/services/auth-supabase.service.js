"use strict";
var AuthSupabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSupabaseService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs-mod-fullstack/common");
const common_2 = require("@nestjs/common");
const auth_errors_1 = require("../auth.errors");
let AuthSupabaseService = AuthSupabaseService_1 = class AuthSupabaseService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_2.Logger(AuthSupabaseService_1.name);
    }
    async createAdmin(user) {
        const signupUserResult = await this.supabaseService
            .getSupabaseClient()
            .auth.signUp({
            password: user.password,
            email: user.email.toLowerCase(),
            options: {
                data: {
                    nickname: user.username,
                    roles: ['admin'],
                },
            },
        });
        if (signupUserResult.error) {
            if (signupUserResult.error.message !== 'User already registered') {
                this.logger.error(signupUserResult.error.message, signupUserResult.error.stack);
                throw new auth_errors_1.AuthError(signupUserResult.error.message);
            }
        }
        else {
            if (!signupUserResult.data?.user) {
                throw new auth_errors_1.AuthError('Failed to create a user');
            }
            if (!signupUserResult.data.user.email) {
                throw new auth_errors_1.AuthError('signupUserResult.data.user.email not set');
            }
            await this.verifyUser({
                externalUserId: signupUserResult.data.user.id,
                email: signupUserResult.data.user.email,
            });
            this.logger.debug(`Admin with email: ${signupUserResult.data.user.email} successfully created!`);
        }
    }
    async verifyUser({ externalUserId, email, }) {
        await this.updateUser(externalUserId, { email_verified: true, email });
        return this;
    }
    async updateUser(externalUserId, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params) {
        if (Object.keys(params).length > 0) {
            const updateUserResult = await this.supabaseService
                .getSupabaseClient()
                .auth.updateUser({
                email: params['email'],
            });
            if (updateUserResult.error) {
                this.logger.error(updateUserResult.error.message, updateUserResult.error.stack);
                throw new auth_errors_1.AuthError(updateUserResult.error.message);
            }
        }
    }
};
exports.AuthSupabaseService = AuthSupabaseService;
exports.AuthSupabaseService = AuthSupabaseService = AuthSupabaseService_1 = tslib_1.__decorate([
    (0, common_2.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [common_1.SupabaseService])
], AuthSupabaseService);
//# sourceMappingURL=auth-supabase.service.js.map