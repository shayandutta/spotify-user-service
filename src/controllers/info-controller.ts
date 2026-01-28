import { StatusCodes } from "http-status-codes";
import tryCatch from "../utils/TryCatch.js";


const info = tryCatch(async(req, res)=> {
  return res
  .status(StatusCodes.OK)
  .json({
    success: true,
    message: 'API-Gateway is live',
    error: {},
    data: {}
})
})

export default {
  info,
};
