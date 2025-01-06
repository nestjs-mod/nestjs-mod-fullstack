import { Controller, Get, Post, Query } from '@nestjs/common';

import { StatusResponse, SupabaseService } from '@nestjs-mod-fullstack/common';
import {
  MinioConfiguration,
  MinioEnvironments,
  MinioFilesService,
  PresignedUrlsRequest,
  PresignedUrls as PresignedUrlsResponse,
} from '@nestjs-mod/minio';
import { ApiExtraModels, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { randomUUID } from 'node:crypto';
import { CurrentFilesRequest } from '../files.decorators';
import { FilesError, FilesErrorEnum } from '../files.errors';
import { FilesRequest } from '../types/files-request';
import { FilesRole } from '../types/files-role';

export class GetPresignedUrlArgs implements PresignedUrlsRequest {
  @ApiProperty({ type: String })
  @IsDefined()
  ext!: string;
}

export class PresignedUrls implements PresignedUrlsResponse {
  @ApiProperty({ type: String })
  downloadUrl!: string;

  @ApiProperty({ type: String })
  uploadUrl!: string;
}

export class DeleteFileArgs {
  @ApiProperty({ type: String })
  @IsDefined()
  downloadUrl!: string;
}

@ApiExtraModels(FilesError)
@Controller()
export class FilesController {
  constructor(
    private readonly minioEnvironments: MinioEnvironments,
    private readonly minioConfiguration: MinioConfiguration,
    private readonly supabaseService: SupabaseService,
    private readonly minioFilesService: MinioFilesService
  ) {}

  @Get('/files/get-presigned-url')
  @ApiOkResponse({ type: PresignedUrls })
  async getPresignedUrl(
    @Query() getPresignedUrlArgs: GetPresignedUrlArgs,
    @CurrentFilesRequest() filesRequest: FilesRequest,
    @InjectTranslateFunction() getText: TranslateFunction
  ) {
    const bucketName = Object.entries(this.minioConfiguration.buckets || {})
      .filter(([, options]) => options.ext.includes(getPresignedUrlArgs.ext))
      .map(([name]) => name)?.[0];
    if (!bucketName) {
      throw new FilesError(
        getText('Uploading files with extension "{{ext}}" is not supported'),
        FilesErrorEnum.FORBIDDEN,
        { ext: getPresignedUrlArgs.ext }
      );
    }
    const fullObjectName = `${
      filesRequest.externalUserId ?? this.minioEnvironments.minioDefaultUserId
    }/${bucketName}_${randomUUID()}.${getPresignedUrlArgs.ext}`;

    return {
      downloadUrl: this.supabaseService
        .getSupabaseClient()
        .storage.from(bucketName)
        .getPublicUrl(fullObjectName).data.publicUrl,
      uploadUrl: (
        await this.supabaseService
          .getSupabaseClient()
          .storage.from(bucketName)
          .createSignedUploadUrl(fullObjectName, { upsert: true })
      ).data?.signedUrl,
    };
  }

  @Post('/files/delete-file')
  @ApiOkResponse({ type: StatusResponse })
  async deleteFile(
    @Query() deleteFileArgs: DeleteFileArgs,
    @CurrentFilesRequest() filesRequest: FilesRequest,
    @InjectTranslateFunction() getText: TranslateFunction
  ) {
    if (
      filesRequest.filesUser?.userRole === FilesRole.Admin ||
      deleteFileArgs.downloadUrl.includes(`/${filesRequest.externalUserId}/`)
    ) {
      const { objectName, bucketName } =
        this.minioFilesService.getFromDownloadUrlWithoutBucketNames(
          deleteFileArgs.downloadUrl
        );
      await this.supabaseService
        .getSupabaseClient()
        .storage.from(bucketName)
        .remove([objectName]);
      return { message: getText('ok') };
    }
    throw new FilesError(
      getText('Only those who uploaded files can delete them'),
      FilesErrorEnum.FORBIDDEN
    );
  }
}
