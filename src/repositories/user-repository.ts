import type { Model } from "mongoose";
import type { IUser } from "../models/user.js";
import { User } from "../models/index.js";
import CrudRepository from "./crud-repository.js";

class UserRepository extends CrudRepository<IUser> {
  constructor() {
    super(User as Model<IUser>);
  }

  async getByEmail(email: string) {
    const response = await this.model.findOne({ email });
    return response;
  }
}

export default UserRepository;
