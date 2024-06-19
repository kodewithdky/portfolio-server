import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { cloudinary, uploadOnCloudinary } from "../services/cloudinary.js";
import { sendEmail } from "../services/send.email.js";
import crypto from "crypto";
import ApiError from "../middleware/error.middleware.js";

//register
const register = asyncHandler(async (req, res, next) => {
   const {
      name,
      email,
      phone,
      about,
      portfolio_url,
      password,
      youtube,
      github,
      instagram,
      twitter,
      linkedIn,
      facebook,
   } = req.body;
   if (
      [name, email, phone, about, password].some(
         (field) => field?.trim() === ""
      )
   ) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "All fields are required!")
      );
   }
   const user = await User.findOne({
      $or: [{ email }, { phone }],
   });
   if (user) {
      return next(new ApiError(StatusCodes.CONFLICT, "User already exist!"));
   }
   const { avatar, resume } = req.files;
   if (!req.files || Object.keys(req.files).length == 0) {
      return next(
         new ApiError(
            StatusCodes.BAD_REQUEST,
            "Avatar and Resume are required!"
         )
      );
   }
   const cloudinaryResAvatar = await uploadOnCloudinary(avatar.tempFilePath);
   const cloudinaryResResume = await uploadOnCloudinary(resume.tempFilePath);
   if (!cloudinaryResAvatar || cloudinaryResAvatar.error) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Avatar didn't upload!"
         )
      );
   }
   if (!cloudinaryResResume || cloudinaryResResume.error) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Resume didn't upload!"
         )
      );
   }
   const newUser = await User.create({
      name,
      email,
      phone,
      about,
      portfolio_url,
      avatar: {
         public_id: cloudinaryResAvatar.public_id,
         url: cloudinaryResAvatar.secure_url,
      },
      resume: {
         public_id: cloudinaryResResume.public_id,
         url: cloudinaryResResume.secure_url,
      },
      password,
      youtube,
      github,
      instagram,
      twitter,
      linkedIn,
      facebook,
   });
   const createdUser = await User.findById(newUser._id);
   if (!createdUser) {
      return next(
         new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Error while sign up!")
      );
   }
   return res
      .status(StatusCodes.CREATED)
      .json(
         new ApiResponse(
            StatusCodes.CREATED,
            createdUser,
            "User register successfully!"
         )
      );
});

//login
const login = asyncHandler(async (req, res, next) => {
   const { email, phone, password } = req.body;
   if (!(email || phone)) {
      return next(
         new ApiError(
            StatusCodes.BAD_REQUEST,
            "Email or Phone number is required!"
         )
      );
   }
   if (!password) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Password is required!")
      );
   }
   const user = await User.findOne({
      $or: [{ email }, { phone }],
   });
   if (!user) {
      return next(
         new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials!")
      );
   }
   const isPasswordCorrect = await user.isPasswordCorrect(password);
   if (!isPasswordCorrect) {
      return next(
         new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials!")
      );
   }
   const accessToken = await user.generateAccessToken(user._id);
   const loggedInUser = await User.findById(user._id).select("-password");
   return res
      .status(StatusCodes.OK)
      .cookie("accessToken", accessToken, {
         httpOnly: true,
         secure: true,
      })
      .json(
         new ApiResponse(
            StatusCodes.OK,
            { user: loggedInUser, accessToken },
            "User logged in successfully!"
         )
      );
});

//logout
const logout = asyncHandler(async (req, res, next) => {
   return res
      .status(StatusCodes.OK)
      .clearCookie("accessToken", {
         httpOnly: true,
         secure: true,
      })
      .json(new ApiResponse(StatusCodes.OK, {}, "User logged out!"));
});

//get user
const getUser = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.user?._id).select("-password");
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, user, "Feched successfully!"));
});

//update profile
const updateProfile = asyncHandler(async (req, res, next) => {
   const {
      name,
      email,
      phone,
      about,
      portfolio_url,
      password,
      youtube,
      github,
      instagram,
      twitter,
      linkedIn,
      facebook,
   } = req.body;

   const newUserData = {
      name,
      email,
      phone,
      about,
      portfolio_url,
      password,
      github,
      youtube,
      instagram,
      twitter,
      linkedIn,
      facebook,
   };
   if (req.files && req.files.avatar) {
      const avatar = req.files.avatar;
      const user = await User.findById(req.user?._id);
      const profileImageId = user.avatar?.public_id;
      await cloudinary.uploader.destroy(profileImageId);
      const cloudinaryResAvatar = await uploadOnCloudinary(avatar.tempFilePath);
      if (!cloudinaryResAvatar || cloudinaryResAvatar.error) {
         return next(
            new ApiError(
               StatusCodes.INTERNAL_SERVER_ERROR,
               "Avatar didn't upload!"
            )
         );
      }
      newUserData.avatar = {
         public_id: cloudinaryResAvatar.public_id,
         url: cloudinaryResAvatar.secure_url,
      };
   }
   if (req.files && req.files.resume) {
      const resume = req.files.resume;
      const user = await User.findById(req.user?._id);
      const resumeImageId = user.resume?.public_id;
      await cloudinary.uploader.destroy(resumeImageId);
      const cloudinaryResResume = await uploadOnCloudinary(resume.tempFilePath);
      if (!cloudinaryResResume || cloudinaryResResume.error) {
         return next(
            new ApiError(
               StatusCodes.INTERNAL_SERVER_ERROR,
               "Resume didn't upload!"
            )
         );
      }
      newUserData.resume = {
         public_id: cloudinaryResResume.public_id,
         url: cloudinaryResResume.secure_url,
      };
   }
   const user = await User.findByIdAndUpdate(req.user?._id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
   });
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(StatusCodes.OK, user, "Profile updated succefully!")
      );
});

//change password
const changePasword = asyncHandler(async (req, res, next) => {
   const { currentPassword, newPassword, confirmPassword } = req.body;
   if (
      [currentPassword, newPassword, confirmPassword].some(
         (field) => field?.trim() === ""
      )
   ) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "All fields are required!")
      );
   }
   const user = await User.findById(req.user?._id).select("+password");
   const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
   if (!isPasswordCorrect) {
      return next(
         new ApiError(StatusCodes.UNAUTHORIZED, "Invalid current password!")
      );
   }
   if (newPassword !== confirmPassword) {
      return next(
         new ApiError(
            StatusCodes.BAD_REQUEST,
            "New and confirm password did't match!"
         )
      );
   }
   user.password = newPassword;
   await user.save();
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(StatusCodes.OK, {}, "Password changed successfully!")
      );
});

//get user portfolio
const getUserForPortfolio = asyncHandler(async (req, res, next) => {
   const id = "665dc7e25554e79866a76c9f";
   const user = await User.findById({ _id: id });
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, user, "Fetched successfully!"));
});

//forgot password
const forgotPassword = asyncHandler(async (req, res, next) => {
   const { email } = req.body;
   if (!email) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, "Email is required!"));
   }
   const user = await User.findOne({ email: email });
   if (!user) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, "Invalid user!"));
   }
   const resetToken = crypto.randomBytes(10).toString("hex");
   const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
   await User.findOneAndUpdate(
      { email: email },
      {
         $set: {
            resetPasswordToken: resetPasswordToken,
         },
      },
      {
         new: true,
      }
   );
   const resetPasswordUrl = `${process.env.DASHBOARD_URL}/reset-password/${resetPasswordToken}`;
   const message = `Your reset password token is:- \n\n ${resetPasswordUrl} \n\n`;
   try {
      sendEmail({
         email: user.email,
         subject: "Recovery password!",
         message,
      });

      return res
         .status(StatusCodes.OK)
         .json(
            new ApiResponse(
               StatusCodes.OK,
               {},
               `Email send to ${user.email} successfully!`
            )
         );
   } catch (error) {
      await User.findOneAndUpdate(
         { email: email },
         {
            $set: {
               resetPasswordToken: undefined,
            },
         },
         {
            new: true,
         }
      );
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message || "Internal server error!"
         )
      );
   }
});

//reset password
const resetPassword = asyncHandler(async (req, res, next) => {
   const { token } = req.params;
   const { newPassword, confirmPassword } = req.body;
   if (!(newPassword && confirmPassword)) {
      return next(
         new ApiError(
            StatusCodes.BAD_REQUEST,
            "Password and confirm password required!"
         )
      );
   }
   if (newPassword !== confirmPassword) {
      return next(
         new ApiError(
            StatusCodes.BAD_REQUEST,
            "New and confirmed password didn't match!"
         )
      );
   }
   const user = await User.findOne({
      resetPasswordToken: token,
   });
   if (!user) {
      return next(
         new ApiError(StatusCodes.UNAUTHORIZED, "Token is invalid or expired!")
      );
   }
   user.password = newPassword;
   user.resetPasswordToken = undefined;
   user.resetPasswordExpire = undefined;
   await user.save();
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(StatusCodes.OK, {}, "Reset password successfully!")
      );
});

export {
   register,
   login,
   logout,
   getUser,
   updateProfile,
   changePasword,
   getUserForPortfolio,
   forgotPassword,
   resetPassword,
};
