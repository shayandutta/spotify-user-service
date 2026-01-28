import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/index.js";
import AppError from "../utils/errors/app-error.js";
import { StatusCodes } from "http-status-codes";

const userRepository = new UserRepository();

async function createUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existingUser = await userRepository.getByEmail(data.email);
  if (existingUser) {
    throw new AppError("User already exists", StatusCodes.BAD_REQUEST);
  }
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await userRepository.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
  return { user, token };
}

export default {
  createUser,
};
