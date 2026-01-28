class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.explanation = message;
    }
}
export default AppError;
//# sourceMappingURL=app-error.js.map