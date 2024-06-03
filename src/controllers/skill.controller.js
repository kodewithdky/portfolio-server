import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Skill } from "../models/skill.model.js";
import { uploadOnCloudinary, cloudinary } from "../services/cloudinary.js";
import ApiError from "../middleware/error.middleware.js";
import { StatusCodes } from "http-status-codes";

//add skills
const addSkill = asyncHandler(async (req, res, next) => {
   if (!req.files || Object.keys(req.files).length === 0) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Image for skill required!")
      );
   }
   const { svg } = req.files;
   const { title, proficiency } = req.body;
   if (!title || !proficiency) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "All fields required!")
      );
   }
   const cloudinaryResponse = await uploadOnCloudinary(svg.tempFilePath);
   if (!cloudinaryResponse || cloudinaryResponse.error) {
      return next(
         new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "File didn't upload!")
      );
   }
   const skill = await Skill.create({
      title,
      proficiency,
      svg: {
         public_id: cloudinaryResponse.public_id,
         url: cloudinaryResponse.secure_url,
      },
   });
   return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, skill, "Skill added!"));
});

//get skills
const getAllSkills = asyncHandler(async (req, res, next) => {
   const skills = await Skill.find({ __v: 0 });
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, skills, "Fetched skills!"));
});

// update skills
const updateSkill = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   let skill = await Skill.findById({ _id: id });
   if (!skill) {
      return next(new ApiError(StatusCodes.NOT_FOUND, "Skills not found!"));
   }
   const { proficiency } = req.body;
   skill = await Skill.findByIdAndUpdate(
      { _id: id },
      { proficiency },
      {
         new: true,
         runValidators: true,
         useFindAndModify: false,
      }
   );
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, "Skills updated successfullly!"));
});

//delete skills
const deleteSkill = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   let skill = await Skill.findById(id);
   if (!skill) {
      return next(new ApiError(StatusCodes.NOT_FOUND, "Already deleted!"));
   }
   const skillSvgId = skill.svg.public_id;
   await cloudinary.uploader.destroy(skillSvgId);
   await skill.deleteOne();
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, "Skill deleted!"));
});

export { addSkill, updateSkill, getAllSkills, deleteSkill };
