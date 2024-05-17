export declare class Errors extends Error {
    errors: Array<{
        errorType: string;
        message: string;
    }>;
    constructor(errors: Array<{
        errorType: string;
        message: string;
    }>);
    get message(): string;
}
