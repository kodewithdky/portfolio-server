import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
         trim: true,
      },
      email: {
         type: String,
         required: true,
         unique: true,
      },
      phone: {
         type: String,
         required: true,
         unique: true,
      },
      about: {
         type: String,
         required: true,
      },
      avatar: {
         public_id: {
            type: String,
            required: true,
         },
         url: {
            type: String,
            required: true,
         },
      },
      resume: {
         public_id: {
            type: String,
            required: true,
         },
         url: {
            type: String,
            required: true,
         },
      },
      portfolio_url: {
         type: String,
      },
      password: {
         type: String,
         required: true,
      },
      youtube: {
         type: String,
      },
      github: {
         type: String,
      },
      instagram: {
         type: String,
      },
      twitter: {
         type: String,
      },
      linkedIn: {
         type: String,
      },
      facebook: {
         type: String,
      },
      resetPasswordToken: {
         type: String,
      },
   },
   { timestamps: true }
);

//hashed password
userSchema.pre("save", function (next) {
   if (!this.isModified("password")) return;
   this.password = bcryptjs.hashSync(this.password, 10);
   next();
});

//compare password
userSchema.methods.isPasswordCorrect = function (password) {
   return bcryptjs.compareSync(password, this.password);
};

//genrate access token
userSchema.methods.generateAccessToken = function () {
   return jwt.sign(
      {
         _id: this._id,
         name: this.name,
         email: this.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
   );
};

export const User = mongoose.model("User", userSchema);
