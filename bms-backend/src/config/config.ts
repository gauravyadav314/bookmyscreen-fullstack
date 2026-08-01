import path from "path";
import { config as conf } from 'dotenv';
conf({ path: path.resolve(__dirname, "../../.env") });

const _config = {
    port: process.env.PORT || "9000",
    databaseUrl: process.env.MONGO_CONNECTION_STRING || "mongodb://localhost:27017/bookmyscreen",
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret_12345",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "default_refresh_token_secret_12345",
    hashingSecret: process.env.HASH_SECRET || "default_hashing_secret_12345",
    emailUsername: process.env.EMAIL_USERNAME || process.env.NODEMAILER_EMAIL || "",
    emailPassword: process.env.EMAIL_PASSWORD || process.env.NODEMAILER_PASSWORD || "",
    redisHost: process.env.REDIS_HOST as string,
    redisPort: parseInt(process.env.REDIS_PORT || "6379"),
    razorpayKey : process.env.RAZORPAY_API_KEY as string,
    razorpaySecret : process.env.RAZORPAY_SECRET_KEY as string,
    databaseReplicaSet: process.env.MONGO_REPLICA_STRING as string,
}

export const config = Object.freeze(_config);