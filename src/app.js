import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import fileUpload from "express-fileupload";

//express app
const app = express();
//middleware
app.use(
   cors({
      origin: [process.env.PORTFOLIO_URL, process.env.DASHBOARD_URL],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
   })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
   fileUpload({
      useTempFiles: true,
      tempFileDir: "../public/temp",
   })
);

//import routes
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import timelineRouter from "./routes/timeline.routes.js";
import skillRouter from "./routes/skill.routes.js";
import projectRouter from "./routes/project.routes.js";
import softappRouter from "./routes/softapp.routes.js";
//routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/skill", skillRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/soft-app", softappRouter);

export { app };
