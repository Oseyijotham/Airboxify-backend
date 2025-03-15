import { Contact } from "../models/contactsModel.js";
import {
  contactValidation,
  updateNameValidation
} from "../validations/validation.js";
import { httpError } from "../helpers/httpError.js";
import path from "path";
import fs from "fs/promises";
import { v4 as uuid4 } from "uuid";
import "dotenv/config";
import Jimp from "jimp";
import "dotenv/config";

const addAppointment = async (req, res) => {
  // Preventing lack of necessary data for contacts (check validations folder)
  const { _id } = req.user;
  const { error } = contactValidation.validate(req.body);

  if (error) {
    throw httpError(400, "missing required fields");
  }

  await Contact.create({ ...req.body, owner: _id });
  const result = await Contact.find({ owner: _id }).sort({ _id: -1 });
  console.log({ ...req.body, owner: _id });
  res.status(201).json(result);
};

const getAllAppointments = async (req, res) => {
  const { _id } = req.user;

  const result = await Contact.find({ owner: _id }).sort({ _id: -1 });

  res.json(result);
};

const updateAppointmentAvatar = async (req, res) => {
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

const getAppointmentById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findById(contactId);

  if (!result) {
    throw httpError(404, "Contact ID Not Found");
  }

  res.json(result);
};



const deleteAppointmentById = async (req, res) => {
  const { _id } = req.user;
  console.log(req.params);
  const { contactId } = req.params;
  const deleted = await Contact.findByIdAndDelete(contactId);

  if (!deleted) {
    throw httpError(404);
  }

  const result = await Contact.find({ owner: _id }).sort({ _id: -1 });
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
  res.json(result);
};

const updateAppointmentNameById = async (req, res) => {
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

const updateAppointmentEmailById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!result) {
    throw httpError(404);
  }

  res.json(result);
};

const updateAppointmentDueDateById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!result) {
    throw httpError(404);
  }

  res.json(result);
};

const updateAppointmentStatusById = async (req, res) => {
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
  addAppointment,
  getAllAppointments,
  updateAppointmentAvatar,
  getAppointmentById,
  deleteAppointmentById,
  updateAppointmentNameById,
  updateAppointmentEmailById,
  updateAppointmentDueDateById,
  updateAppointmentStatusById,
};
