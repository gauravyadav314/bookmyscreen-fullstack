import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
    try {
        const standaloneUri = (config.databaseUrl || "mongodb://127.0.0.1:27017/bookmyscreen").replace(/[\?&]replicaSet=[^&]*/, '');
        try {
            await mongoose.connect(standaloneUri, { serverSelectionTimeoutMS: 3000 });
            console.log("Connected to database");
        } catch (stdErr) {
            if (config.databaseReplicaSet) {
                await mongoose.connect(config.databaseReplicaSet, { serverSelectionTimeoutMS: 3000 });
                console.log("Connected to database (replica set mode)");
            } else {
                throw stdErr;
            }
        }
    } catch (error) {
        console.log("Failed to connect to database", error);
        process.exit(1);
    }
};

export default connectDB;