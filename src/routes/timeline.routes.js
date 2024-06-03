import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
   addtimeline,
   getAllTimeline,
   deleteTimeline,
} from "../controllers/timeline.controller.js";

const router = express.Router();

//add timeline
router.post("/add", isAuthenticated, addtimeline);
//get get timeline
router.get("/get", getAllTimeline);
//delete tileline
router.delete("/delete/:id", isAuthenticated, deleteTimeline);

export default router;
