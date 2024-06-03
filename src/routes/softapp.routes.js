import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
   addApp,
   getAllApps,
   deleteApp,
} from "../controllers/softapp.controller.js";

const router = express.Router();

//add skills
router.post("/add", isAuthenticated, addApp);
//get get skills
router.get("/get", getAllApps);
//delete skills
router.delete("/delete/:id", isAuthenticated, deleteApp);

export default router;
