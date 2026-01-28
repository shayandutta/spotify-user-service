import { StatusCodes } from "http-status-codes";

const info = (
  _req: import("express").Request,
  res: import("express").Response,
) => {
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
