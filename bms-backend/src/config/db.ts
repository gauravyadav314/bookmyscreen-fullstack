import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
    try {
        const uri = config.databaseReplicaSet || config.databaseUrl;
        try {
            await mongoose.connect(uri);
            console.log("Connected to database");
        } catch (replicaErr) {
            console.warn("⚠️ Replica set connection failed, trying standard MongoDB connection...");
            await mongoose.connect(config.databaseUrl);
            console.log("Connected to database (standalone mode)");
        }
    } catch (error) {
        console.log("Failed to connect to database", error);
        process.exit(1);
    }
};

export default connectDB;