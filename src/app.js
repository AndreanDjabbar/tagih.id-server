import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import logger from "./config/logger.config.js";
import prisma from "./config/postgres.config.js";
import { getRedisClient } from "./config/redis.config.js";
import { NODE_ENV } from "./util/env.util.js";
import authRoutes from "./router/auth.router.js";
import userRoutes from "./router/user.router.js";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.middleware.js";
import timeout from "connect-timeout";
import haltTimeoutMiddleware from "./middleware/halt.middleware.js";
import rateLimiter from "./middleware/limiter.middleware.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(helmet())
app.use(timeout("7s"))
app.use(haltTimeoutMiddleware)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(rateLimiter('global'))

const morganFormat = (tokens, req, res) => {
  try {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      response_time: tokens["response-time"](req, res) + " ms",
      content_length: tokens.res(req, res, "content-length") || 0,
      user_agent: tokens["user-agent"](req, res),
      remote_addr: tokens["remote-addr"](req, res),
      date: tokens.date(req, res, "iso"),
    });
  } catch (e) {
    return `Morgan log error: ${e.message}`;
  }
};

NODE_ENV === "development"
  ? app.use(morgan("dev"))
  : app.use(
      morgan(morganFormat, {
        stream: {
          write: (message) => logger.info(message.trim()),
        },
      })
    );

app.use("/dinehub/api/auth", authRoutes);
app.use("/dinehub/api/user", userRoutes);

app.use(errorHandler)

export default app;
