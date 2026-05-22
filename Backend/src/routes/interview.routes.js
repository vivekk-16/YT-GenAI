const express = require("express");
const interviewRouter = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const  upload  = require("../middlewares/file.middleware");



/**
 * @route POST /api/interview
 * @desc Generate interview report for a candidate based on their resume, self description and job description
 * @access Private
 */

interviewRouter.post("/", authMiddleware.authUser, 
    upload.single("resume"), 
    interviewController.generateInterviewReportController);

module.exports = interviewRouter;