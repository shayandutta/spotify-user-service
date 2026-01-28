import { StatusCodes } from "http-status-codes";
const info = (_req, res) => {
    return res.status(StatusCodes.OK).json({
        success: true,
        message: "User service is live",
        error: {},
        data: {},
    });
};
export default {
    info,
};
//# sourceMappingURL=info-controller.js.map