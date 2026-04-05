const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const tokenBlacklistModel = require("../models/blacklist.model");

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */

async function registerUserController(req,res){
    try{
        const {username, email, password} = await req.body;

        if(!username || !email || !password){
            return res.status(400).json({
                message:"Please provide username, email and password"
            });
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or:[{username},{email}],
        });
        //console.log("Existing user:", isUserAlreadyExists);

        if(isUserAlreadyExists){
            return res.status(400).json({
                message:"Account already exists with this username or email address"
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
            },
            process.env.JWT_SECRET,
            { expiresIn:"1d" }
        );

        res.cookie("token", token, { httpOnly: true });

        res.status(201).json({
            message:"User registered successfully",
            user:{
                id: user._id,
                username:user.username,
                email:user.email,
            }
        });

    }catch(error){
        res.status(500).json({
            message:"Something went wrong",
            error: error.message
        });
    }

}

/**
 * @name loginUserController
 * @description login a user, expects email and passowrd in the request body
 * @access Public
 */

async function loginUserController(req, res){
    try{
        const {email, password} = await req.body;

        const user = await userModel.findOne({email})

        if(!user){
            return res.status(400).json({
                message:"Invalid email or passowrd"
            })
        }

        const isPasswordValid = bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            return res.status(400).json({
                message:"Invalid password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1d"
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true in production
        });

        res.status(200).json({
            message:"User logged in successfully",
            user:{
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch(error){
        res.status(500).json({
            message:"Something went wrong",
            error: error.message
        });
    }
}
/**
 * @name logoutUserController
 * @description logout a user, expects email and passowrd in the request body
 * @access Public
 */

async function logoutUserController(req, res) {
    try {
        const token =
            req.cookies?.token ||
            req.headers.authorization?.split(" ")[1];
        

        if (token) {
            await tokenBlacklistModel.create({ token });
        }

        res.clearCookie("token");

        return res.status(200).json({
            message: "User logged out successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
}

/**
 * @name getUserController
 * @description get user details, expects a valid token in the request
 * @access Private
 */

async function getUserController(req, res){
    try{
        const user = await userModel.findById(req.user.id)

        res.status(200).json({
            message:"User details fetched successfully",
            user:{
                id: user._id,
                username: user.username,
                email:user.email,
            }
        })
    }
    catch(error){
        res.status(500).json({
            message:"Something went wrong",
            error: error.message
        });
    }
}

module.exports = {
    registerUserController, 
    loginUserController,
    logoutUserController,
    getUserController,
};