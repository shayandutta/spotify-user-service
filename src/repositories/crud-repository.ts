import type { Model } from "mongoose";
import AppError from "../utils/errors/app-error.js";
import { StatusCodes } from "http-status-codes";

class CrudRepository<T> {
  constructor(protected model: Model<T>) {}

  async create(data: Record<string, unknown>) {
    const response = await this.model.create(data as T);
    return response;
  }

  async destroy(id: string) {
    const response = await this.model.findByIdAndDelete(id);
    if (!response) {
      throw new AppError(
        "Not able to find the resource",
        StatusCodes.NOT_FOUND,
      );
    }
    return response;
  }

  async get(id: string) {
    const response = await this.model.findById(id);
    if (!response) {
      throw new AppError(
        "Not able to find the resource",
        StatusCodes.NOT_FOUND,
      );
    }
    return response;
  }

  async getAll() {
    const response = await this.model.find();
    return response;
  }

  async update(id: string, data: Record<string, unknown>) {
    const response = await this.model.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!response) {
      throw new AppError(
        "Not able to find the resource",
        StatusCodes.NOT_FOUND,
      );
    }
    return response;
  }
}

export default CrudRepository;
