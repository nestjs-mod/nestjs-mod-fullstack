import { AuthError } from '@nestjs-mod-fullstack/auth';
import {
  FilesConfiguration,
  FilesPresignedUrls,
} from '@nestjs-mod-fullstack/files';
import { MinioFilesService } from '@nestjs-mod/minio';
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SupabaseWithMinioFilesConfiguration implements FilesConfiguration {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly minioFilesService: MinioFilesService
  ) {}

  getFromDownloadUrlWithoutBucketNames(downloadUrl: string) {
    return this.minioFilesService.getFromDownloadUrlWithoutBucketNames(
      downloadUrl
    );
  }

  async deleteFile({
    bucketName,
    objectName,
  }: {
    bucketName: string;
    objectName: string;
  }) {
    const result = await this.supabaseService
      .getSupabaseClient()
      .storage.from(bucketName)
      .remove([objectName]);
    if (result.error?.message) {
      throw new AuthError(result.error?.message);
    }
    return null;
  }

  async getPresignedUrls({
    bucketName,
    fullObjectName,
  }: {
    bucketName: string;
    fullObjectName: string;
  }) {
    const result = await this.supabaseService
      .getSupabaseClient()
      .storage.from(bucketName)
      .createSignedUploadUrl(fullObjectName, { upsert: true });
    if (result.error?.message) {
      throw new AuthError(result.error?.message);
    }
    if (!result?.data) {
      throw new AuthError('data not set');
    }

    return {
      downloadUrl: this.supabaseService
        .getSupabaseClient()
        .storage.from(bucketName)
        .getPublicUrl(fullObjectName).data.publicUrl,
      uploadUrl: result.data.signedUrl,
    } as FilesPresignedUrls;
  }
}
