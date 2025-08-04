import Express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import userRouter from "./routes/userRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import jobRouter from "./routes/jobRouter.js";
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";

const app = Express();
dotenv.config({ path: "./config/config.env" });

// Updated CORS configuration to include Netlify URL
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL, // Your .env variable
      "https://jobportal9162.netlify.app", // Your Netlify URL
      "http://localhost:3000", // For local development
      "http://localhost:5173", // Vite default port
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// API Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/job", jobRouter);

// Root route for testing
app.get("/", (req, res) => {
  res.json({
    message: "Job Portal Backend API is running!",
    status: "success",
  });
});

// Health check route
app.get("/api/v1/health", (req, res) => {
  res.json({
    message: "Backend is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Database connection
dbConnection();

// Error handling middleware (should be last)
app.use(errorMiddleware);

export default app;
