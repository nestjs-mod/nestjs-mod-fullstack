export declare class UpdateMigrationsDto {
  version?: string | null;
  description?: string;
  type?: string;
  script?: string;
  checksum?: number | null;
  installed_by?: string;
  execution_time?: number;
  success?: boolean;
}
