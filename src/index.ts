import express from "express";
import mongoose from "mongoose";

import apiRoutes from "./routes/index.js";
import { ServerConfig, Logger } from "./config/index.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: "Spotify",
    });
    Logger.info("Connected to MongoDB");
  } catch (error) {
    Logger.error("MongoDB connection error");
    process.exit(1);
  }
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRoutes);

const PORT = ServerConfig.PORT ?? 3001;
app.listen(PORT, () => {
  Logger.info(`User service is running on port ${PORT}`);
  connectDB();
});
