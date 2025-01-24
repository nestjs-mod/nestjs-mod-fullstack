import { SupabaseService } from '@nestjs-mod-fullstack/common';
import {
  MinioConfiguration,
  MinioEnvironments,
  MinioFilesService,
  PresignedUrlsRequest,
  PresignedUrls as PresignedUrlsResponse,
} from '@nestjs-mod/minio';
import { TranslateFunction } from 'nestjs-translates';
import { FilesRequest } from '../types/files-request';
export declare class GetPresignedUrlArgs implements PresignedUrlsRequest {
  ext: string;
}
export declare class PresignedUrls implements PresignedUrlsResponse {
  downloadUrl: string;
  uploadUrl: string;
}
export declare class DeleteFileArgs {
  downloadUrl: string;
}
export declare class FilesController {
  private readonly minioEnvironments;
  private readonly minioConfiguration;
  private readonly supabaseService;
  private readonly minioFilesService;
  constructor(
    minioEnvironments: MinioEnvironments,
    minioConfiguration: MinioConfiguration,
    supabaseService: SupabaseService,
    minioFilesService: MinioFilesService
  );
  getPresignedUrl(
    getPresignedUrlArgs: GetPresignedUrlArgs,
    filesRequest: FilesRequest,
    getText: TranslateFunction
  ): Promise<{
    downloadUrl: string;
    uploadUrl: string | undefined;
  }>;
  deleteFile(
    deleteFileArgs: DeleteFileArgs,
    filesRequest: FilesRequest,
    getText: TranslateFunction
  ): Promise<{
    message: string;
  }>;
}
