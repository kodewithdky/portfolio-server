import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "./error.middleware.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
   const { accessToken } = req.cookies;
   if (!accessToken) {
      return next(
         new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated!")
      );
   }
   const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
   req.user = decoded;
   next();
});
