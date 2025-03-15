import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import Jimp from "jimp";
//import path from "path";
import fs from "fs/promises";
import { User } from "../models/usersModel.js";
import { signupValidation, loginValidation } from "../validations/validation.js";
import { httpError } from "../helpers/httpError.js";
//import { sendEmail } from "../helpers/sendEmail.js";
//import { v4 as uuid4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";


const {
  SECRET_KEY,
  PORT,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;


// Cloudinary configuration for storing the user image
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET, 
});

const signupUser = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  //  Registration validation error
  const { error } = signupValidation.validate(req.body);
  if (error) {
    throw httpError(400); //Bad request;
  }

  // Registration conflict error
  const user = await User.findOne({ email });
  if (user) {
    throw httpError(409); //Conflict
  }

  const hashPassword = await bcrypt.hash(password, 10); //Encrypting password

  const newUser = await User.create({
    firstname: firstName,
    lastname: lastName,
    email,
    phone,
    password: hashPassword
  });


  res.status(201).json({
    user: {
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
      phone: newUser.phone,
      avatarURL: newUser.avatarURL,
      groups: newUser.groups
      
    },
  });
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  
  try {
    //  Login validation error
    const { error } = loginValidation.validate(req.body);
    if (error) {
      throw httpError(400); //Bad request;
    }

    // Login auth error (email)
    const user = await User.findOne({ email });
    if (!user) {
      throw httpError(401); //Unauthorized;
    }

    // Login auth error (password)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw httpError(401); //Unauthorized;
    }

    // Any error below will be handled by the Global error handler as error 500

    // Generate JWT token
    const payload = { id: user._id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

    // Update user with the new token
    await User.findByIdAndUpdate(user._id, { token });

    //   Login success response
    res.status(200).json({
      token: token,
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        avatarURL: user.avatarURL,
        groups: user.groups,
      },
    });
  } catch (err) {

    //Allows the caught error to be handled by the Global error handler where it is logged.
    next(err);
  }
};

const logoutUser = async (req, res) => {
  const { _id } = req.user;

  // Setting token to empty string
  await User.findByIdAndUpdate(_id, { token: "" });

  //   Logout success response
  res.status(204).send();
};

const getCurrentUsers = async (req, res) => {
  const { firstname, lastname, email, phone, avatarURL, groups } = req.user;

  res.json({
    user: {
      firstname,
      lastname,
      email,
      phone,
      avatarURL,
      groups
    },
  });
};


const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: oldPath } = req.file;

  //Getting the image from the tmp folder, resizing it and overwriting the previous image with the resized one
  await Jimp.read(oldPath).then((image) =>
    image.cover(250, 250).write(oldPath)
  );

  const filename = `${_id}`; //creating a new unique filename for the image

  
    const result = await cloudinary.uploader.upload(oldPath, {
      folder: "userAvatars", // This creates a folder in Cloudinary
      public_id: filename,
      overwrite: true,
    });

    // Delete the local file after upload
    await fs.unlink(oldPath);

    const avatarURL = result.secure_url;

    await User.findByIdAndUpdate(_id, { avatarURL });

    res.status(200).json({ avatarURL });
};
 


// prettier-ignore
export { signupUser, loginUser, logoutUser, getCurrentUsers, updateAvatar };
