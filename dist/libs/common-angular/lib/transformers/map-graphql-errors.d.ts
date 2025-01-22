export declare function mapGraphqlErrors<T>(): import("rxjs").OperatorFunction<{
    data: T;
    errors: {
        message: string;
    }[];
}, T>;
