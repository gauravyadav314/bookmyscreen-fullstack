import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import router from "./routes";
import { globalErrorHandler } from "./middlewares/error.middleware";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
  })
);
app.use(cookieParser());
app.use(express.json());


// ALL ROUTES
app.use("/api/v1/", router);


// Global error handler (MUST be after all routes)
app.use(globalErrorHandler);

app.get("/", (_, res) => {
  res.json({
    message: "Welcome to BookMyScreen API",
  });
});

export default app;