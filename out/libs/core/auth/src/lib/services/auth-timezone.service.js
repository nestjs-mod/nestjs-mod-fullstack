"use strict";
var AuthTimezoneService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTimezoneService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
let AuthTimezoneService = AuthTimezoneService_1 = class AuthTimezoneService {
    constructor() {
        this.logger = new common_1.Logger(AuthTimezoneService_1.name);
    }
    convertObject(data, timezone, depth = 10) {
        if (depth === 0) {
            return data;
        }
        if (Array.isArray(data)) {
            return this.convertArray(data, timezone, depth);
        }
        if ((typeof data === 'string' ||
            typeof data === 'number' ||
            typeof data === 'function') &&
            !this.isValidDate(data) &&
            !this.isValidStringDate(data)) {
            return data;
        }
        try {
            if (data && timezone) {
                if (this.isValidDate(data)) {
                    data = this.convertPrimitive(data, timezone);
                }
                else {
                    this.convertComplexObject(data, timezone, depth);
                }
            }
        }
        catch (err) {
            if (err instanceof Error) {
                this.logger.error(err, err.stack);
            }
        }
        return data;
    }
    convertComplexObject(data, timezone, depth) {
        const keys = Object.keys(data);
        for (const key of keys) {
            data[key] = this.convertObject(data[key], timezone, depth - 1);
        }
    }
    convertPrimitive(data, timezone) {
        if (this.isValidStringDate(data) && typeof data === 'string') {
            data = new Date(data);
        }
        data = (0, date_fns_1.addHours)(data, timezone);
        return data;
    }
    convertArray(data, timezone, depth) {
        const newArray = [];
        for (const item of data) {
            newArray.push(this.convertObject(item, timezone, depth - 1));
        }
        return newArray;
    }
    isValidStringDate(data) {
        return typeof data === 'string' && isNaN(+data) && (0, date_fns_1.isValid)(new Date(data));
    }
    isValidDate(data) {
        if (data && typeof data === 'object' && (0, date_fns_1.isValid)(data)) {
            return true;
        }
        return typeof data === 'string' && isNaN(+data) && (0, date_fns_1.isValid)(new Date(data));
    }
};
exports.AuthTimezoneService = AuthTimezoneService;
exports.AuthTimezoneService = AuthTimezoneService = AuthTimezoneService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AuthTimezoneService);
//# sourceMappingURL=auth-timezone.service.js.map