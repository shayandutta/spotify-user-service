import { StatusCodes } from "http-status-codes";
import { UserService } from "../services/index.js";
import { SuccessResponse } from "../utils/common/index.js";
import { tryCatch } from "../utils/index.js";
const registerUser = tryCatch(async (req, res) => {
    const { name, email, password } = req.body;
    const result = await UserService.createUser({ name, email, password });
    SuccessResponse.data = result;
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
});
export default {
    registerUser,
};
//# sourceMappingURL=user-controller.js.map