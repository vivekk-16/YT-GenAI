const pdfParse = require("pdf-parse");
console.log("PDF PARSE:", pdfParse);
const generateInterviewReport = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterviewReportController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume file is required" });
        }

        const resumeContent = await pdfParse(req.file.buffer);
        const { selfDescription, jobDescription } = req.body;

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user._id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
}

module.exports = {
   generateInterviewReportController
};