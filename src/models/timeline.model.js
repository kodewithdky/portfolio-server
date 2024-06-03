import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema({
   title: {
      type: String,
      required: true,
   },
   description: {
      type: String,
      required: true,
   },
   timeline: {
      from: {
         type: String,
      },
      to: {
         type: String,
      },
   },
});

export const Timeline = mongoose.model("Timeline", timelineSchema);
