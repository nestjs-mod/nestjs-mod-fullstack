import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

import { StatusResponse } from '@nestjs-mod/swagger';
import { ApiOkResponse } from '@nestjs/swagger';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { randomUUID } from 'node:crypto';
import { FilesConfiguration } from '../files.configuration';
import { CurrentFilesRequest } from '../files.decorators';
import { FilesStaticEnvironments } from '../files.environments';
import { FilesError, FilesErrorEnum } from '../files.errors';
import {
  FilesDeleteFileArgs,
  FilesGetPresignedUrlArgs,
  FilesPresignedUrls,
} from '../types/dto';
import { FilesRequest } from '../types/files-request';
import { FilesRole } from '../types/files-role';

@Controller()
export class FilesController {
  constructor(
    private readonly filesConfiguration: FilesConfiguration,
    private readonly filesStaticEnvironments: FilesStaticEnvironments
  ) {}

  @Get('/files/get-presigned-url')
  @ApiOkResponse({ type: FilesPresignedUrls })
  async getPresignedUrl(
    @Query() getPresignedUrlArgs: FilesGetPresignedUrlArgs,
    @CurrentFilesRequest() filesRequest: FilesRequest,
    @InjectTranslateFunction() getText: TranslateFunction
  ) {
    const bucketName = Object.entries(this.filesConfiguration.buckets || {})
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
      filesRequest.externalUserId ??
      this.filesStaticEnvironments.filesDefaultUserId
    }/${bucketName}_${randomUUID()}.${getPresignedUrlArgs.ext}`;

    return await this.filesConfiguration.getPresignedUrls({
      bucketName,
      fullObjectName,
      ext: getPresignedUrlArgs.ext,
      userId:
        filesRequest.externalUserId ??
        this.filesStaticEnvironments.filesDefaultUserId,
    });
  }

  @Post('/files/delete-file')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StatusResponse })
  async deleteFile(
    @Query() deleteFileArgs: FilesDeleteFileArgs,
    @CurrentFilesRequest() filesRequest: FilesRequest,
    @InjectTranslateFunction() getText: TranslateFunction
  ) {
    if (
      filesRequest.filesUser?.userRole === FilesRole.Admin ||
      deleteFileArgs.downloadUrl.includes(`/${filesRequest.externalUserId}/`)
    ) {
      const { objectName, bucketName } =
        this.filesConfiguration.getFromDownloadUrlWithoutBucketNames(
          deleteFileArgs.downloadUrl
        );
      await this.filesConfiguration.deleteFile({
        bucketName,
        objectName,
        downloadUrl: deleteFileArgs.downloadUrl,
      });
      return { message: getText('ok') };
    }
    throw new FilesError(
      getText('Only those who uploaded files can delete them'),
      FilesErrorEnum.FORBIDDEN
    );
  }
}
