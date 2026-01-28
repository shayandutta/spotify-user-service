const tryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error
            });
        }
    };
};
export default tryCatch;
//# sourceMappingURL=TryCatch.js.map