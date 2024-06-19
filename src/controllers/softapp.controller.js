import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { SoftApp } from "../models/softapp.model.js";
import { cloudinary, uploadOnCloudinary } from "../services/cloudinary.js";
import ApiError from "../middleware/error.middleware.js";
import { StatusCodes } from "http-status-codes";

//add app
const addApp = asyncHandler(async (req, res, next) => {
   if (!req.files || Object.keys(req.files).length === 0) {
      return next(
         new ApiError(
            StatusCodes.BAD_REQUEST,
            "Software Application Icon/Image Required!"
         )
      );
   }
   const { svg } = req.files;
   const { name } = req.body;
   if (!name) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Software name required!")
      );
   }
   const cloudinaryResponse = await uploadOnCloudinary(svg.tempFilePath);
   if (!cloudinaryResponse || cloudinaryResponse.error) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Failed to upload avatar to Cloudinary"
         )
      );
   }
   const Softapp = await SoftApp.create({
      name,
      svg: {
         public_id: cloudinaryResponse.public_id,
         url: cloudinaryResponse.secure_url,
      },
   });
   return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, Softapp, "App added!"));
});

//get apps
const getAllApps = asyncHandler(async (req, res) => {
   const SoftApps = await SoftApp.find();
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, SoftApps, "Fetched app!"));
});

//delete app
const deleteApp = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   let Softapp = await SoftApp.findById(id);
   if (!Softapp) {
      return next(new ApiError(StatusCodes.NOT_FOUND, "Already deleted!"));
   }
   const SoftAppSvgId = Softapp.svg.public_id;
   await cloudinary.uploader.destroy(SoftAppSvgId);
   await SoftApp.deleteOne();
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, "App deleted!"));
});

export { addApp, getAllApps, deleteApp };
