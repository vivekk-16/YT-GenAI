//initiation of server
const cookieParser = require("cookie-parser");
const express = require('express');
const cors = require("cors");

const app = express();

//use or declaration of routes

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

//require all the routes here

const authRouter = require("./routes/auth.route");

//using all the routes here
app.use("/api/auth", authRouter);


module.exports = app;