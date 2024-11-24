import { Controller, Get, Post, Query } from '@nestjs/common';

import {
  MinioConfiguration,
  MinioFilesService,
  PresignedUrlsRequest,
  PresignedUrls as PresignedUrlsResponse,
} from '@nestjs-mod/minio';
import { ApiExtraModels, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { FilesError, FilesErrorEnum } from '../files.errors';

import { CurrentFilesRequest } from '../files.decorators';
import { FilesRequest } from '../types/files-request';
import { StatusResponse } from '@nestjs-mod-fullstack/common';
import { map } from 'rxjs';
import { FilesRole } from '../types/files-role';
import { IsDefined } from 'class-validator';

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
    private readonly minioConfiguration: MinioConfiguration,
    private readonly minioFilesService: MinioFilesService
  ) {}

  @Get('/files/get-presigned-url')
  @ApiOkResponse({ type: PresignedUrls })
  getPresignedUrl(
    @Query() getPresignedUrlArgs: GetPresignedUrlArgs,
    @CurrentFilesRequest() filesRequest: FilesRequest
  ) {
    const bucketName = Object.entries(this.minioConfiguration.buckets || {})
      .filter(([, options]) => options.ext.includes(getPresignedUrlArgs.ext))
      .map(([name]) => name)?.[0];
    if (!bucketName) {
      throw new FilesError(
        `Uploading files with extension "{{ext}}" is not supported`,
        FilesErrorEnum.FORBIDDEN,
        { ext: getPresignedUrlArgs.ext }
      );
    }
    return this.minioFilesService.getPresignedUrls({
      bucketName,
      expiry: 60,
      ext: getPresignedUrlArgs.ext,
      userId: filesRequest.externalUserId,
    });
  }

  @Post('/files/delete-file')
  @ApiOkResponse({ type: StatusResponse })
  deleteFile(
    @Query() deleteFileArgs: DeleteFileArgs,
    @CurrentFilesRequest() filesRequest: FilesRequest
  ) {
    if (
      filesRequest.filesUser?.userRole === FilesRole.Admin ||
      deleteFileArgs.downloadUrl.includes(`/${filesRequest.externalUserId}/`)
    ) {
      return this.minioFilesService
        .deleteFile(deleteFileArgs.downloadUrl)
        .pipe(map(() => ({ message: 'ok' })));
    }
    throw new FilesError(
      `Only those who uploaded files can delete them`,
      FilesErrorEnum.FORBIDDEN
    );
  }
}
