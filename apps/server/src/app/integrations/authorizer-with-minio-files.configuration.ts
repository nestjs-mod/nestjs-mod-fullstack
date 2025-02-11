import { FilesConfiguration } from '@nestjs-mod-fullstack/files';
import { MinioFilesService } from '@nestjs-mod/minio';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthorizerWithMinioFilesConfiguration
  implements FilesConfiguration
{
  constructor(private readonly minioFilesService: MinioFilesService) {}

  getFromDownloadUrlWithoutBucketNames(downloadUrl: string) {
    return this.minioFilesService.getFromDownloadUrlWithoutBucketNames(
      downloadUrl
    );
  }

  async deleteFile({
    downloadUrl,
  }: {
    bucketName: string;
    objectName: string;
    downloadUrl: string;
  }) {
    return await lastValueFrom(this.minioFilesService.deleteFile(downloadUrl));
  }

  async getPresignedUrls({
    bucketName,
    ext,
    userId,
  }: {
    bucketName: string;
    fullObjectName: string;
    ext: string;
    userId: string;
  }) {
    return await lastValueFrom(
      this.minioFilesService.getPresignedUrls({
        bucketName,
        expiry: 60,
        ext: ext,
        userId: userId,
      })
    );
  }
}
