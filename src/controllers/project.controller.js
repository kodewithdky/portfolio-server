import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/project.model.js";
import { cloudinary, uploadOnCloudinary } from "../services/cloudinary.js";
import ApiError from "../middleware/error.middleware.js";
import { StatusCodes } from "http-status-codes";

//add project
const addProject = asyncHandler(async (req, res, next) => {
   if (!req.files || Object.keys(req.files).length === 0) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Project banner image required!")
      );
   }
   const { projectBanner } = req.files;
   const {
      title,
      description,
      gitRepoLink,
      projectLink,
      stack,
      technologies,
      deployed,
   } = req.body;
   if (
      !title ||
      !description ||
      !gitRepoLink ||
      !projectLink ||
      !stack ||
      !technologies ||
      !deployed
   ) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Please provide all details!")
      );
   }
   const cloudinaryResponse = await uploadOnCloudinary(
      projectBanner.tempFilePath
   );
   if (!cloudinaryResponse || cloudinaryResponse.error) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Failed to upload project image!"
         )
      );
   }
   const project = await Project.create({
      title,
      description,
      gitRepoLink,
      projectLink,
      stack,
      technologies,
      deployed,
      projectBanner: {
         public_id: cloudinaryResponse.public_id,
         url: cloudinaryResponse.secure_url,
      },
   });
   return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, project, "Project added!"));
});

//get single project
const getSingleProject = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   const project = await Project.findById(id);
   if (!project) {
      return next(new ApiError(StatusCodes.NOT_FOUND, "Project not found!"));
   }
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, project, "Fetched project!"));
});

//get all project
const getAllProjects = asyncHandler(async (req, res, next) => {
   const projects = await Project.find({ __v: 0 });
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, projects, "Fetched projects!"));
});

//update project
const updateProject = asyncHandler(async (req, res, next) => {
   const {
      title,
      description,
      stack,
      technologies,
      deployed,
      projectLink,
      gitRepoLink,
   } = req.body;
   if (
      [
         title,
         description,
         stack,
         technologies,
         deployed,
         projectLink,
         gitRepoLink,
      ].some((field) => field?.trim() === "")
   ) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "All fields are required!")
      );
   }
   const newProjectData = {
      title,
      description,
      stack,
      technologies,
      deployed,
      projectLink,
      gitRepoLink,
   };
   if (req.files && req.files.projectBanner) {
      const projectBanner = req.files.projectBanner;
      const project = await Project.findById(req.params.id);
      const projectImageId = project.projectBanner.public_id;
      await cloudinary.uploader.destroy(projectImageId);
      const newProjectImage = await uploadOnCloudinary(
         projectBanner.tempFilePath
      );
      newProjectData.projectBanner = {
         public_id: newProjectImage.public_id,
         url: newProjectImage.secure_url,
      };
   }
   const project = await Project.findByIdAndUpdate(
      req.params.id,
      newProjectData,
      {
         new: true,
         runValidators: true,
         useFindAndModify: false,
      }
   );
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, project, "Project updated!"));
});

//delete project
const deleteProject = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   const project = await Project.findById(id);
   if (!project) {
      return next(new ApiError(StatusCodes.NOT_FOUND, "Already deleted!"));
   }
   const projectImageId = project.projectBanner.public_id;
   await cloudinary.uploader.destroy(projectImageId);
   await project.deleteOne();
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, "Project deleted!"));
});

export {
   addProject,
   getSingleProject,
   getAllProjects,
   updateProject,
   deleteProject,
};
