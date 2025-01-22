export type TObject = Record<string, unknown>;
export type TData = unknown | unknown[] | TObject | TObject[];
export declare class AuthTimezoneService {
    private logger;
    convertObject(data: TData, timezone: number | null | undefined, depth?: number): TData;
    private convertComplexObject;
    private convertPrimitive;
    private convertArray;
    private isValidStringDate;
    private isValidDate;
}
