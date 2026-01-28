import { User } from "../models/index.js";
import AppError from "../utils/errors/app-error.js";
import { StatusCodes } from "http-status-codes";

class UserRepository {
  async create(data: Record<string, unknown>) {
    const response = await User.create(data);
    return response;
  }

  async getByEmail(email: string) {
    const response = await User.findOne({ email });
    return response;
  }

  async get(id: string) {
    const response = await User.findById(id);
    if (!response) {
      throw new AppError(
        "Not able to find the resource",
        StatusCodes.NOT_FOUND,
      );
    }
    return response;
  }
}

export default UserRepository;
