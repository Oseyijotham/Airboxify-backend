import bcrypt from "bcryptjs";
import gravatar from "gravatar";
import jwt from "jsonwebtoken";
import "dotenv/config";
import Jimp from "jimp";
import path from "path";
import fs from "fs/promises";
import { User } from "../models/usersModel.js";
// prettier-ignore
import { signupValidation, loginValidation } from "../validations/validation.js";
import { httpError } from "../helpers/httpError.js";
import { sendEmail } from "../helpers/sendEmail.js";
import { v4 as uuid4 } from "uuid";

const { SECRET_KEY, PORT } = process.env;

const signupUser = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  //  Registration validation error
  const { error } = signupValidation.validate(req.body);
  if (error) {
    throw httpError(400, error.message);
  }

  // Registration conflict error
  const user = await User.findOne({ email });
  if (user) {
    throw httpError(409, "Email in Use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

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
      groups: newUser.group
      
    },
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  //  Login validation error
  const { error } = loginValidation.validate(req.body);
  if (error) {
    throw httpError(401, error.message);
  }

  // Login auth error (email)
  const user = await User.findOne({ email });
  if (!user) {
    throw httpError(401, "Email or password is wrong");
  }

  // Login auth error (password)
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw httpError(401, "Email or password is wrong");
  }

  const payload = { id: user._id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

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

  // Logout unauthorized error (setting token to empty string will remove token -> will logout)
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
  const { path: oldPath, originalname } = req.file;
const verificationToken = uuid4();
  await Jimp.read(oldPath).then((image) =>
    // image.resize(250, 250).write(oldPath)
    image.cover(250, 250).write(oldPath)
  );

  //The above promise returns the image from the tmp folder and resizes it then it overwrites the previous image with the resized one 

  const extension = path.extname(originalname);
  const filename = `${verificationToken}${_id}${extension}`;

  const newPath = path.join("public", "avatars", filename);
  const avatarsDir = path.join("public", "avatars");
  const files = await fs.readdir(avatarsDir); // List all files in the avatars directory

  for (const file of files) {
    // Check if the file contains the same _id
    if (file.includes(_id)) {
      const existingFilePath = path.join(avatarsDir, file);
      await fs.unlink(existingFilePath); // Delete the existing file
      console.log(`Deleted existing file: ${existingFilePath}`);
      break; // Exit the loop once the matching file is deleted
    }
  }
  await fs.rename(oldPath, newPath);

  let avatarURL = path.join("/avatars", filename);
  avatarURL = avatarURL.replace(/\\/g, "/");

  await User.findByIdAndUpdate(_id, { avatarURL });
  res.status(200).json({ avatarURL });
};


// prettier-ignore
export { signupUser, loginUser, logoutUser, getCurrentUsers, updateAvatar };
