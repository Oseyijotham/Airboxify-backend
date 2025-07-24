import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import { User } from "../models/usersModel.js";
import { signupValidation, loginValidation } from "../validations/validation.js";
import { httpError } from "../helpers/httpError.js";
//import { sendEmail } from "../helpers/sendEmail.js";
//import { v4 as uuid4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

/*GO TO THE FOLDER CALLED "helpers", CLICK ON THE FILE CALLED ctrlWrapper.js AND CHECK OUT THE FUNCTION CALLED "ctrlWrapper". 
IT IS BECAUSE OF THAT FUNCTION (ctrlWrapper) THAT WE DO NOT NEED TO ADD TRY AND CATCH BLOCKS IN THE CONTROLLER FUNCTIONS BELOW.
IT IS MORE EFFICIENT TO USE THE FUNCTION (ctrlWrapper) than to repeat try and catch blocks in every controller function.
*/

//OBSERVE how the function (ctrlWrapper) is used in the usersRouter.js file located in folder called routes\api

//Any error that is NOT specifically thrown will be handled by the Global error handler as error 500

/*Also, authentication and authorization errors are thrown using the function called "authenticateToken" which is in
the file called authenticateToken.js located in the folder called middlewares. So because of this we do not need to throw
such errors in the controller functions below*/

//OBSERVE how the function (authenticateToken) is used in the usersRouter.js file located in folder called routes\api


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
    throw httpError(400, `${error.details[0].message}`); //Bad request;
  }

  // Registration conflict error
  const user = await User.findOne({ email });
  if (user) {
    throw httpError(409, "Email already in use"); //Conflict
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

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  
    //  Login validation error
    const { error } = loginValidation.validate(req.body);
    if (error) {
      throw httpError(400, `${error.details[0].message}`); //Bad request;
    }

    // Login auth error (email)
    const user = await User.findOne({ email });
    if (!user) {
      throw httpError(401, "Incorrect Email or Password"); //Unauthorized;
    }

    // Login auth error (password)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw httpError(401, "Incorrect Email or Password"); //Unauthorized;
    }


    // Generate JWT token
    const payload = { id: user._id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "40m" });

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

  res.status(200).json({
    user: {
      firstname,
      lastname,
      email,
      phone,
      avatarURL,
      groups,
    },
  });
};


const updateUserAvatar = async (req, res) => {
  if (req.file.mimetype !== "image/png" && req.file.mimetype !== "image/jpeg") {
    throw httpError(400, 'Invalid image format, only PNG, JPG and JPEG are allowed'); // Only throws if neither PNG nor JPEG is chosen
  }
  const { _id } = req.user;
  const { path: oldPath, originalname } = req.file;

  const filename = `${_id}`; //creating a new unique filename for the image
  const extension = path.extname(originalname);
  const filenamePath = `${_id}${extension}`;

  const newPath = path.join("public", "avatars", filenamePath);

  //Getting the image from the tmp folder, resizing it and overwriting the previous image with the resized one
    await sharp(oldPath)
      .resize(250, 250, {
        fit: "cover", // Crop to fill 250×250
        position: "center", // Crop from center (default)
      })
      .toFile(newPath);
  
    const result = await cloudinary.uploader.upload(newPath, {
      folder: "userAvatars", // This creates a folder in Cloudinary
      public_id: filename,
      overwrite: true,
    });
  
    // Delete the local files after upload
    await fs.unlink(oldPath);
    await fs.unlink(newPath);
  
    const avatarURL = result.secure_url;
    


  await User.findByIdAndUpdate(_id, { avatarURL });

  res.status(200).json({ avatarURL });
};
 


// prettier-ignore
export { signupUser, loginUser, logoutUser, getCurrentUsers, updateUserAvatar };
