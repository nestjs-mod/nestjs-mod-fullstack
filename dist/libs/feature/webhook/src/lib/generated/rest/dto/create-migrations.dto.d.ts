export declare class CreateMigrationsDto {
    installed_rank: number;
    version?: string | null;
    description: string;
    type: string;
    script: string;
    checksum?: number | null;
    installed_by: string;
    execution_time: number;
    success: boolean;
}
