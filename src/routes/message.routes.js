import express from "express";
import {
   deleteMessage,
   getMessages,
   sendMessage,
} from "../controllers/message.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

//send message
router.post("/send", sendMessage);
//get messages
router.get("/get", getMessages);
//delete
router.delete("/delete/:id", isAuthenticated, deleteMessage);

export default router;
