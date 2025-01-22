"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesModule = void 0;
const common_1 = require("@nestjs-mod/common");
const minio_1 = require("@nestjs-mod/minio");
const files_controller_1 = require("./controllers/files.controller");
const files_constants_1 = require("./files.constants");
const common_2 = require("@nestjs-mod-fullstack/common");
exports.FilesModule = (0, common_1.createNestModule)({
    moduleName: files_constants_1.FILES_MODULE,
    moduleCategory: common_1.NestModuleCategory.feature,
    controllers: [files_controller_1.FilesController],
    imports: [
        common_2.SupabaseModule.forFeature({ featureModuleName: files_constants_1.FILES_FEATURE }),
        minio_1.MinioModule.forFeature({
            featureModuleName: files_constants_1.FILES_FEATURE,
        }),
    ],
}).FilesModule;
//# sourceMappingURL=files.module.js.map