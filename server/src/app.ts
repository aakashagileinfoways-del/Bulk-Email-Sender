import cors from "cors";
import express from "express";
import { allowedOrigins } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { apiRouter } from "./routes/api-router.js";

export const createApp = () => {
  const app = express();
  app.disable("x-powered-by");
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin is not allowed."));
      },
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
