import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
   title: {
      type: String,
      required: true,
   },
   description: {
      type: String,
      required: true,
   },
   gitRepoLink: {
      type: String,
   },
   projectLink: {
      type: String,
   },
   technologies: {
      type: String,
   },
   stack: {
      type: String,
   },
   deployed: {
      type: String,
   },
   projectBanner: {
      public_id: {
         type: String,
         required: true,
      },
      url: {
         type: String,
         required: true,
      },
   },
});

export const Project = mongoose.model("Project", projectSchema);
