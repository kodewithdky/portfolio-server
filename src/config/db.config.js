import mongoose from "mongoose";
import { DB_NAME } from "../helpers/constants.js";

const connectDb = async () => {
   try {
      const connectionInstance = await mongoose.connect(
         `${process.env.MONGODB_CONNECTION_URI}/${DB_NAME}`
      );
      console.log(
         `\n🔛 DATABASE CONNECTED !! DB HOST: ${connectionInstance.connection.host}!!!`
            .bgGreen.white
      );
   } catch (error) {
      console.log(`\n🔗 DATABASE CONNECTION ERROR ${error} !!!`.bgRed.white);
      process.exit(1);
   }
};

export default connectDb;
