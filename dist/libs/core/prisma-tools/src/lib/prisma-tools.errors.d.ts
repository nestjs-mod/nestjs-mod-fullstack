export declare enum DatabaseErrorEnum {
    COMMON = "DB-000",
    UNHANDLED_ERROR = "DB-001",
    UNIQUE_ERROR = "DB-002",
    INVALID_IDENTIFIER = "DB-003",
    INVALID_LINKED_TABLE_IDENTIFIER = "DB-004",
    DATABASE_QUERY_ERROR = "DB-005",
    NOT_FOUND_ERROR = "DB-006"
}
export declare const DATABASE_ERROR_ENUM_TITLES: Record<DatabaseErrorEnum, string>;
export declare class DatabaseError<T = unknown> extends Error {
    code: DatabaseErrorEnum;
    metadata?: T;
    constructor(message?: string | DatabaseErrorEnum, code?: DatabaseErrorEnum, metadata?: T);
}
