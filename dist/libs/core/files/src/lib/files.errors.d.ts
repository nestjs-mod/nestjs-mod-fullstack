export declare enum FilesErrorEnum {
    COMMON = "FILES-000",
    FORBIDDEN = "FILES-001"
}
export declare const FILES_ERROR_ENUM_TITLES: Record<FilesErrorEnum, string>;
export declare class FilesError<T = unknown> extends Error {
    message: string;
    code: FilesErrorEnum;
    metadata?: T;
    constructor(message?: string | FilesErrorEnum, code?: FilesErrorEnum, metadata?: T);
}
