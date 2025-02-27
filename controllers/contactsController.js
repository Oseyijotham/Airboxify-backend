import { Contact } from "../models/contactsModel.js";
// prettier-ignore
import {
  contactValidation,
  updateNameValidation,
  updateEmailValidation,
} from "../validations/validation.js";
import { httpError } from "../helpers/httpError.js";
import path from "path";
import fs from "fs/promises";
import { v4 as uuid4 } from "uuid";
import "dotenv/config";
import Jimp from "jimp";
import "dotenv/config";

const getAllContacts = async (req, res) => {
  const { _id } = req.user;

  const result = await Contact.find({ owner: _id });

  res.json(result);
};

const updateContactAvatar = async (req, res) => {
  const { contactId } = req.params;
  const { path: oldPath, originalname } = req.file;
  const verificationToken = uuid4();
  await Jimp.read(oldPath).then((image) =>
    // image.resize(250, 250).write(oldPath)
    image.cover(250, 250).write(oldPath)
  );

  //The above promise returns the image from the tmp folder and resizes it then it overwrites the previous image with the resized one

  const extension = path.extname(originalname);
  const filename = `${verificationToken}${contactId}${extension}`;

  const newPath = path.join("public", "avatars", filename);
  const avatarsDir = path.join("public", "avatars");
  const files = await fs.readdir(avatarsDir); // List all files in the avatars directory

  for (const file of files) {
    // Check if the file contains the same _id
    if (file.includes(contactId)) {
      const existingFilePath = path.join(avatarsDir, file);
      await fs.unlink(existingFilePath); // Delete the existing file
      console.log(`Deleted existing file: ${existingFilePath}`);
      break; // Exit the loop once the matching file is deleted
    }
  }
  await fs.rename(oldPath, newPath);

  let avatarURL = path.join("/avatars", filename);
  avatarURL = avatarURL.replace(/\\/g, "/");

  await Contact.findByIdAndUpdate(contactId, { avatarURL });
  res.status(200).json({ avatarURL });
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findById(contactId);

  if (!result) {
    throw httpError(404, "Contact ID Not Found");
  }

  res.json(result);
};

const addContact = async (req, res) => {
  // Preventing lack of necessary data for contacts (check validations folder)
  const { _id } = req.user;
  const { error } = contactValidation.validate(req.body);

  if (error) {
    throw httpError(400, "missing required fields");
  }

  
   const result = await Contact.create({ ...req.body, owner: _id });
   console.log({ ...req.body, owner: _id });
  res.status(201).json(result);
};

const deleteContactById = async (req, res) => {
  console.log(req.params);
  const { contactId } = req.params;
  const result = await Contact.findByIdAndDelete(contactId);

  if (!result) {
    throw httpError(404);
  }
const avatarsDir = path.join("public", "avatars");  
  const files = await fs.readdir(avatarsDir);
  for (const file of files) {
    // Check if the file contains the same _id
    if (file.includes(contactId)) {
      const existingFilePath = path.join(avatarsDir, file);
      await fs.unlink(existingFilePath); // Delete the existing file
      console.log(`Deleted existing file: ${existingFilePath}`);
      break; // Exit the loop once the matching file is deleted
    }
  }
  res.json({
    message: "Contact deleted",
  });
};

const updateContactNameById = async (req, res) => {
  // Preventing lack of necessary data for contacts (check validations folder)
  const { error } = updateNameValidation.validate(req.body);
  if (error) {
    throw httpError(400, "missing fields");
  }

  const { contactId } = req.params;
  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!result) {
    throw httpError(404);
  }

  res.json(result);
};

const updateContactEmailById = async (req, res) => {

  

  const { contactId } = req.params;
  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!result) {
    throw httpError(404);
  }

  res.json(result);
};

const updateContactPhoneById = async (req, res) => {

  const { contactId } = req.params;
  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!result) {
    throw httpError(404);
  }

  res.json(result);
};

const updateTaskStatusById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!result) {
    throw httpError(404);
  }

  res.json(result);
};



// prettier-ignore
export {
  getAllContacts,
  updateContactAvatar,
  getContactById,
  addContact,
  deleteContactById,
  updateContactNameById,
  updateContactEmailById,
  updateContactPhoneById,
  updateTaskStatusById,
};
