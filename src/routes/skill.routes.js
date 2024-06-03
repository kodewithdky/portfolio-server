import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
   updateSkill,
   getAllSkills,
   deleteSkill,
   addSkill,
} from "../controllers/skill.controller.js";

const router = express.Router();

//add skills
router.post("/add", isAuthenticated, addSkill);
//get get skills
router.get("/get", getAllSkills);
//update skills
router.post("/update/:id", isAuthenticated, updateSkill);
//delete skills
router.delete("/delete/:id", isAuthenticated, deleteSkill);

export default router;
