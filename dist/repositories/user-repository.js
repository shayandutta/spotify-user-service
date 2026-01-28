import { User } from "../models/index.js";
import AppError from "../utils/errors/app-error.js";
import { StatusCodes } from "http-status-codes";
class UserRepository {
    async create(data) {
        const response = await User.create(data);
        return response;
    }
    async getByEmail(email) {
        const response = await User.findOne({ email });
        return response;
    }
    async get(id) {
        const response = await User.findById(id);
        if (!response) {
            throw new AppError("Not able to find the resource", StatusCodes.NOT_FOUND);
        }
        return response;
    }
}
export default UserRepository;
//# sourceMappingURL=user-repository.js.map