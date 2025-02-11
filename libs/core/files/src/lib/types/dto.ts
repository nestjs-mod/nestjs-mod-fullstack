import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class FilesGetPresignedUrlArgs {
  @ApiProperty({ type: String })
  @IsDefined()
  ext!: string;
}

export class FilesPresignedUrls {
  @ApiProperty({ type: String })
  downloadUrl!: string;

  @ApiProperty({ type: String })
  uploadUrl!: string;
}

export class FilesDeleteFileArgs {
  @ApiProperty({ type: String })
  @IsDefined()
  downloadUrl!: string;
}
