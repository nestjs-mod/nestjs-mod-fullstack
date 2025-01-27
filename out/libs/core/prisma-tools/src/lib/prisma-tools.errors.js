"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.DATABASE_ERROR_ENUM_TITLES = exports.DatabaseErrorEnum = void 0;
const nestjs_translates_1 = require("nestjs-translates");
var DatabaseErrorEnum;
(function (DatabaseErrorEnum) {
    DatabaseErrorEnum["COMMON"] = "DB-000";
    DatabaseErrorEnum["UNHANDLED_ERROR"] = "DB-001";
    DatabaseErrorEnum["UNIQUE_ERROR"] = "DB-002";
    DatabaseErrorEnum["INVALID_IDENTIFIER"] = "DB-003";
    DatabaseErrorEnum["INVALID_LINKED_TABLE_IDENTIFIER"] = "DB-004";
    DatabaseErrorEnum["DATABASE_QUERY_ERROR"] = "DB-005";
    DatabaseErrorEnum["NOT_FOUND_ERROR"] = "DB-006";
})(DatabaseErrorEnum || (exports.DatabaseErrorEnum = DatabaseErrorEnum = {}));
exports.DATABASE_ERROR_ENUM_TITLES = {
    [DatabaseErrorEnum.COMMON]: (0, nestjs_translates_1.getText)('Common db error'),
    [DatabaseErrorEnum.UNHANDLED_ERROR]: (0, nestjs_translates_1.getText)('Unhandled error'),
    [DatabaseErrorEnum.UNIQUE_ERROR]: (0, nestjs_translates_1.getText)('Unique error'),
    [DatabaseErrorEnum.INVALID_IDENTIFIER]: (0, nestjs_translates_1.getText)('Invalid identifier'),
    [DatabaseErrorEnum.INVALID_LINKED_TABLE_IDENTIFIER]: (0, nestjs_translates_1.getText)('Invalid linked table identifier'),
    [DatabaseErrorEnum.DATABASE_QUERY_ERROR]: (0, nestjs_translates_1.getText)('Database query error'),
    [DatabaseErrorEnum.NOT_FOUND_ERROR]: (0, nestjs_translates_1.getText)('Not found error'),
};
class DatabaseError extends Error {
    constructor(message, code, metadata) {
        const messageAsCode = Boolean(message &&
            Object.values(DatabaseErrorEnum).includes(message));
        const preparedCode = messageAsCode ? message : code;
        const preparedMessage = preparedCode
            ? exports.DATABASE_ERROR_ENUM_TITLES[preparedCode]
            : message;
        code = preparedCode || DatabaseErrorEnum.COMMON;
        message = preparedMessage || exports.DATABASE_ERROR_ENUM_TITLES[code];
        super(message);
        this.code = DatabaseErrorEnum.COMMON;
        this.code = code;
        this.message = message;
        this.metadata = metadata;
    }
}
exports.DatabaseError = DatabaseError;
//# sourceMappingURL=prisma-tools.errors.js.map