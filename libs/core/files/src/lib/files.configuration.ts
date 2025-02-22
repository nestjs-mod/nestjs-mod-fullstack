import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { FilesPresignedUrls } from './types/dto';

export enum FilesDefaultBucketNames {
  images = 'images',
  video = 'video',
  documents = 'documents',
}

export type FilesModuleBucket = Record<
  string,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    policy: any;
    ext: string[];
  }
>;

@ConfigModel()
export class FilesConfiguration {
  @ConfigModelProperty({
    description: 'Function for get from download url without bucket names',
  })
  getFromDownloadUrlWithoutBucketNames!: (downloadUrl: string) => {
    bucketName: string;
    objectName: string;
  };

  @ConfigModelProperty({
    description: 'Function for get presigned urls',
  })
  getPresignedUrls!: ({
    bucketName,
    fullObjectName,
    ext,
    userId,
  }: {
    bucketName: string;
    fullObjectName: string;
    ext: string;
    userId: string;
  }) => Promise<FilesPresignedUrls>;

  @ConfigModelProperty({
    description: 'Function for delete file',
  })
  deleteFile!: ({
    bucketName,
    objectName,
    downloadUrl,
  }: {
    bucketName: string;
    objectName: string;
    downloadUrl: string;
  }) => Promise<void | null>;

  @ConfigModelProperty({
    description: 'Buckets with policy',
    default: {
      [FilesDefaultBucketNames.images]: {
        policy: {
          Version: '2012-10-17',
          Statement: [
            /*{
                    Effect: 'Allow',
                    Principal: {
                        AWS: ['*'],
                    },
                    Action: ['s3:ListBucketMultipartUploads' , 's3:GetBucketLocation', 's3:ListBucket'],
                    Resource: [`arn:aws:s3:::${bucketName}`],
                },*/
            {
              Effect: 'Allow',
              Principal: {
                AWS: ['*'],
              },
              Action: [
                's3:PutObject',
                's3:AbortMultipartUpload',
                's3:DeleteObject',
                's3:GetObject' /*, 's3:ListMultipartUploadParts'*/,
              ],
              Resource: ['jpg', 'jpeg', 'png', 'gif'].map(
                (ext) => `arn:aws:s3:::images/*.${ext}`
              ),
            },
          ],
          Conditions: [['content-length-range', 1024 * 1024 * 5]],
        },
        ext: ['jpg', 'jpeg', 'png', 'gif'],
      },
      [FilesDefaultBucketNames.video]: {
        policy: {
          Version: '2012-10-17',
          Statement: [
            /*{
                    Effect: 'Allow',
                    Principal: {
                        AWS: ['*'],
                    },
                    Action: ['s3:ListBucketMultipartUploads' , 's3:GetBucketLocation', 's3:ListBucket'],
                    Resource: [`arn:aws:s3:::${bucketName}`],
                },*/
            {
              Effect: 'Allow',
              Principal: {
                AWS: ['*'],
              },
              Action: [
                's3:PutObject',
                's3:AbortMultipartUpload',
                's3:DeleteObject',
                's3:GetObject' /*, 's3:ListMultipartUploadParts'*/,
              ],
              Resource: ['mp4'].map((ext) => `arn:aws:s3:::video/*.${ext}`),
            },
          ],
          Conditions: [['content-length-range', 1024 * 1024 * 50]],
        },
        ext: ['mp4'],
      },
      [FilesDefaultBucketNames.documents]: {
        policy: {
          Version: '2012-10-17',
          Statement: [
            /*{
                    Effect: 'Allow',
                    Principal: {
                        AWS: ['*'],
                    },
                    Action: ['s3:ListBucketMultipartUploads' , 's3:GetBucketLocation', 's3:ListBucket'],
                    Resource: [`arn:aws:s3:::${bucketName}`],
                },*/
            {
              Effect: 'Allow',
              Principal: {
                AWS: ['*'],
              },
              Action: [
                's3:PutObject',
                's3:AbortMultipartUpload',
                's3:DeleteObject',
                's3:GetObject' /*, 's3:ListMultipartUploadParts'*/,
              ],
              Resource: [
                'doc',
                'docx',
                'xls',
                'md',
                'odt',
                'txt',
                'xml',
                'rtf',
                'csv',
              ].map((ext) => `arn:aws:s3:::documents/*.${ext}`),
            },
          ],
          Conditions: [['content-length-range', 1024 * 1024 * 10]],
        },
        ext: ['doc', 'docx', 'xls', 'md', 'odt', 'txt', 'xml', 'rtf', 'csv'],
      },
    } as FilesModuleBucket,
  })
  buckets?: FilesModuleBucket;
}
