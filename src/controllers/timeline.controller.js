import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Timeline } from "../models/timeline.model.js";
import ApiError from "../middleware/error.middleware.js";
import { StatusCodes } from "http-status-codes";

//add timeline
const addtimeline = asyncHandler(async (req, res, next) => {
   const { title, description, from, to } = req.body;
   if ([title, description, from, to].some((field) => field?.trim() === "")) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "All fields are required!")
      );
   }
   const timeline = await Timeline.create({
      title,
      description,
      timeline: {
         from,
         to,
      },
   });
   return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, timeline, "Timeline Added!"));
});

//get all timeline
const getAllTimeline = asyncHandler(async (req, res, next) => {
   const timelines = await Timeline.find({ __v: 0 });
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, timelines, "Feched timline!"));
});

//delete timeline
const deleteTimeline = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   let timeline = await Timeline.findById({ _id: id });
   console.log("timeline: ", timeline);
   if (!timeline) {
      return next(new ApiError(StatusCodes.NOT_FOUND, "Timeline not found!"));
   }
   await timeline.deleteOne();
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, "Timeline Deleted!"));
});

export { addtimeline, getAllTimeline, deleteTimeline };
