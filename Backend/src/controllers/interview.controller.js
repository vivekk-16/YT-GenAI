const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");
const { validateInterviewReport } = require("../utils/interviewValidator");

/**
 * Generate interview report controller
 * Handles: file upload, AI processing, validation, and database save
 */
async function generateInterviewReportController(req, res) {
    try {
        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required",
                error: "No file uploaded"
            });
        }

        // Parse resume PDF
        let resumeContent = "";
        try {
            const pdfData = await pdfParse(req.file.buffer);
            resumeContent = pdfData.text;
        } catch (pdfError) {
            console.error("PDF parsing error:", pdfError);
            resumeContent = "[Unable to parse PDF - please ensure valid PDF]";
        }

        const { selfDescription, jobDescription, title } = req.body;

        // Validate required fields
        if (!jobDescription || jobDescription.trim().length === 0) {
            return res.status(400).json({
                message: "Job description is required"
            });
        }

        if (!resumeContent && (!selfDescription || selfDescription.trim().length === 0)) {
            return res.status(400).json({
                message: "Either resume or self-description is required"
            });
        }

        console.log("Generating interview report for:", title || "No title provided");

        // Generate AI report
        const interviewReportByAi = await generateInterviewReport({
            title: title || "Interview Preparation",
            resume: resumeContent,
            selfDescription: selfDescription || "",
            jobDescription
        });

        // Prepare data for MongoDB
        const reportData = {
            user: req.user._id,
            resume: resumeContent,
            selfDescription: selfDescription || "",
            jobDescription,
            ...interviewReportByAi
        };

        // Validate the response before saving
        const validation = validateInterviewReport(reportData);
        if (!validation.isValid) {
            console.error("Validation errors:", validation.errors);
            return res.status(400).json({
                message: "Generated report failed validation",
                errors: validation.errors
            });
        }

        // Save to database
        const interviewReport = await interviewReportModel.create(reportData);

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        });

    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({
            message: "Failed to generate interview report",
            error: error.message
        });
    }
}

/**
 * Get single interview report by ID
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        // Validate ID format
        if (!interviewId) {
            return res.status(400).json({
                message: "Interview ID is required"
            });
        }

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user._id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            });
        }

        res.status(200).json({
            message: "Interview report fetched successfully",
            interviewReport
        });

    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({
            message: "Failed to fetch interview report",
            error: error.message
        });
    }
}

/**
 * Get all interview reports for logged-in user
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({
            user: req.user._id
        })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

        res.status(200).json({
            message: "Interview reports fetched successfully",
            interviewReports
        });

    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({
            message: "Failed to fetch interview reports",
            error: error.message
        });
    }
}

/**
 * Generate resume PDF based on interview report
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        if (!interviewReportId) {
            return res.status(400).json({
                message: "Interview report ID is required"
            });
        }

        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        // Generate resume content
        const resumeContent = await generateResumePdf({
            resume,
            jobDescription,
            selfDescription
        });

        // Return as downloadable file
        res.set({
            "Content-Type": "text/markdown",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.md`
        });

        res.send(resumeContent);

    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({
            message: "Failed to generate resume",
            error: error.message
        });
    }
}

module.exports = {
    generateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};
