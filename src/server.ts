import mongoose from "mongoose";
import config from "./app/config";
import app from "./app";

async function main() {
  try {
    await mongoose.connect(config.db_url as string, {
      // connectTimeoutMS: 1000,
    });
    app.listen(config.port, () => {
      console.log(`Server is running on url http://localhost:${config.port}`);
      console.log("Database connection successfull !!!");
    });
  } catch (error) {
    console.log(error);
  }
}

main();
