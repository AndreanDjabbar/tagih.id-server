import express from "express";
import * as UserController from "../controller/user.controller.js";
import validateToken from "../middleware/jwt.middleware.js";
import authorizedRoles from "../middleware/role.middleware.js";
import validateSchema from "../middleware/schema.middleware.js";
import catchAsync from "../middleware/catchAsync.middleware.js";
import timeout from "connect-timeout";
import rateLimiter from "../middleware/limiter.middleware.js";

const router = express.Router();
const userLimiter = (minuteTime, requestAmount, prefix) => {
  return rateLimiter('user', { minuteTime, requestAmount, prefix });
}

router.get(
  "/me", 
  userLimiter(5, 50, "me"),
  timeout('3s'),
  validateToken, 
  catchAsync(UserController.getMyUserDataController)
);

export default router;