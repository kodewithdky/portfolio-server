import express from "express";
import {
   addProject,
   deleteProject,
   getAllProjects,
   getSingleProject,
   updateProject,
} from "../controllers/project.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();
//add project
router.post("/add", isAuthenticated, addProject);
//get all project
router.get("/get/:id", getSingleProject);
//get all projects
router.get("/get", getAllProjects);
//get project
router.put("/update/:id", isAuthenticated, updateProject);
//delete project
router.delete("/delete/:id", isAuthenticated, deleteProject);

export default router;
