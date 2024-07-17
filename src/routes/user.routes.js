import express from "express";
import {
   getUser,
   login,
   logout,
   register,
   changePasword,
   updateProfile,
   getUserForPortfolio,
   forgotPassword,
   resetPassword,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

//express router
const router = express.Router();
//routes
//register
router.post("/register", register);
//login
router.post("/login", login);
//logout
router.get("/logout", isAuthenticated, logout);
//get user
router.get("/get-user", isAuthenticated, getUser);
//update profile
router.put("/update-profile", isAuthenticated, updateProfile);
//change password
router.put("/change-password", isAuthenticated, changePasword);
//get user for portfolio
router.get("/get-user-portfolio", getUserForPortfolio);
//forgot password
router.post("/forgot-password", forgotPassword);
//reset password
router.put("/reset-password/:token", resetPassword);

export default router;
