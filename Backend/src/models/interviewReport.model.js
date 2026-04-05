const mongoose = require("mongoose");

/**
 * - job description schema
 * - resume text
 * - self description
 * 
 * - matchScore : Number
 * 
 * -Technical questions : [{
*   question: "",
    answer:"",
    intention:""
    }]
 * - Behavioral questions: [{
*   question: "",
    answer:"",
    intention:""
    }]
 * - Skills gap :[{
    skill:"",
    severity:"",
    type:String,
    enum:["low","medium","high"]
    }]
 * preparation plan :[{
    day:Number,
    focus :String
    tasks :[String]
    }]
 */

const interviewReportSchema = new mongoose.Schema({

    

});

