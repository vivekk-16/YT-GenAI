const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware")

const authRouter = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */

authRouter.post("/register",authController.registerUserController);

/**
 * @route POST /api/auth/login
 * @description Login a user with email and password
 * @access Public
 */

authRouter.post("/login",authController.loginUserController);

/**
 * @route Get /api/auth/logout
 * @description clear token from user cookie and add the token in blcklist
 * @access Public
 */

authRouter.get("/logout", authController.logoutUserController);

/**
 * @route GET /api/auth/get-user
 * @description get user details from the token
 * @access Private
 */

authRouter.get("/get-user", authMiddleware.authUser,authController.getUserController);

module.exports = authRouter;