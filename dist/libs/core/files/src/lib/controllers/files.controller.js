"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = exports.DeleteFileArgs = exports.PresignedUrls = exports.GetPresignedUrlArgs = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs-mod-fullstack/common");
const minio_1 = require("@nestjs-mod/minio");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const nestjs_translates_1 = require("nestjs-translates");
const node_crypto_1 = require("node:crypto");
const files_decorators_1 = require("../files.decorators");
const files_errors_1 = require("../files.errors");
const files_role_1 = require("../types/files-role");
class GetPresignedUrlArgs {
}
exports.GetPresignedUrlArgs = GetPresignedUrlArgs;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ type: String }),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], GetPresignedUrlArgs.prototype, "ext", void 0);
class PresignedUrls {
}
exports.PresignedUrls = PresignedUrls;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ type: String }),
    tslib_1.__metadata("design:type", String)
], PresignedUrls.prototype, "downloadUrl", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ type: String }),
    tslib_1.__metadata("design:type", String)
], PresignedUrls.prototype, "uploadUrl", void 0);
class DeleteFileArgs {
}
exports.DeleteFileArgs = DeleteFileArgs;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ type: String }),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], DeleteFileArgs.prototype, "downloadUrl", void 0);
let FilesController = class FilesController {
    constructor(minioEnvironments, minioConfiguration, supabaseService, minioFilesService) {
        this.minioEnvironments = minioEnvironments;
        this.minioConfiguration = minioConfiguration;
        this.supabaseService = supabaseService;
        this.minioFilesService = minioFilesService;
    }
    async getPresignedUrl(getPresignedUrlArgs, filesRequest, getText) {
        const bucketName = Object.entries(this.minioConfiguration.buckets || {})
            .filter(([, options]) => options.ext.includes(getPresignedUrlArgs.ext))
            .map(([name]) => name)?.[0];
        if (!bucketName) {
            throw new files_errors_1.FilesError(getText('Uploading files with extension "{{ext}}" is not supported'), files_errors_1.FilesErrorEnum.FORBIDDEN, { ext: getPresignedUrlArgs.ext });
        }
        const fullObjectName = `${filesRequest.externalUserId ?? this.minioEnvironments.minioDefaultUserId}/${bucketName}_${(0, node_crypto_1.randomUUID)()}.${getPresignedUrlArgs.ext}`;
        return {
            downloadUrl: this.supabaseService
                .getSupabaseClient()
                .storage.from(bucketName)
                .getPublicUrl(fullObjectName).data.publicUrl,
            uploadUrl: (await this.supabaseService
                .getSupabaseClient()
                .storage.from(bucketName)
                .createSignedUploadUrl(fullObjectName, { upsert: true })).data?.signedUrl,
        };
    }
    async deleteFile(deleteFileArgs, filesRequest, getText) {
        if (filesRequest.filesUser?.userRole === files_role_1.FilesRole.Admin ||
            deleteFileArgs.downloadUrl.includes(`/${filesRequest.externalUserId}/`)) {
            const { objectName, bucketName } = this.minioFilesService.getFromDownloadUrlWithoutBucketNames(deleteFileArgs.downloadUrl);
            await this.supabaseService
                .getSupabaseClient()
                .storage.from(bucketName)
                .remove([objectName]);
            return { message: getText('ok') };
        }
        throw new files_errors_1.FilesError(getText('Only those who uploaded files can delete them'), files_errors_1.FilesErrorEnum.FORBIDDEN);
    }
};
exports.FilesController = FilesController;
tslib_1.__decorate([
    (0, common_1.Get)('/files/get-presigned-url'),
    (0, swagger_1.ApiOkResponse)({ type: PresignedUrls }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, files_decorators_1.CurrentFilesRequest)()),
    tslib_1.__param(2, (0, nestjs_translates_1.InjectTranslateFunction)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [GetPresignedUrlArgs, Object, Function]),
    tslib_1.__metadata("design:returntype", Promise)
], FilesController.prototype, "getPresignedUrl", null);
tslib_1.__decorate([
    (0, common_1.Post)('/files/delete-file'),
    (0, swagger_1.ApiOkResponse)({ type: common_2.StatusResponse }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, files_decorators_1.CurrentFilesRequest)()),
    tslib_1.__param(2, (0, nestjs_translates_1.InjectTranslateFunction)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [DeleteFileArgs, Object, Function]),
    tslib_1.__metadata("design:returntype", Promise)
], FilesController.prototype, "deleteFile", null);
exports.FilesController = FilesController = tslib_1.__decorate([
    (0, swagger_1.ApiExtraModels)(files_errors_1.FilesError),
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [minio_1.MinioEnvironments,
        minio_1.MinioConfiguration,
        common_2.SupabaseService,
        minio_1.MinioFilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map