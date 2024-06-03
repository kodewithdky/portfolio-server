import { app } from "./app.js";
import colors from "colors";
import dotenv from "dotenv";
import connectDb from "./config/db.config.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

//dotenv config
dotenv.config({ path: "./.env" });

//databse connection
connectDb()
   .then(() => {
      app.listen(process.env.PORT || 7072, () => {
         console.log(
            `\n🏃 SERVER IS RUNNING ON PORT: ${process.env.PORT}!!!`.bgBlue
               .white
         );
      });
   })
   .catch((error) => {
      console.log(`\n🔗 MONGODB CONNECTION FAILED!!! ${error}`.bgRed.white);
   });

//Error middlewre
app.use(errorMiddleware);
