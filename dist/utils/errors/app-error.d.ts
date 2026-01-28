declare class AppError extends Error {
    statusCode: number;
    explanation: string;
    constructor(message: string, statusCode: number);
}
export default AppError;
//# sourceMappingURL=app-error.d.ts.map