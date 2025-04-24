import { Contact } from "../models/contactsModel.js";
import {
  contactValidation,
  updateNameValidation
} from "../validations/validation.js";
import { httpError } from "../helpers/httpError.js";
import path from "path";
import fs from "fs/promises";
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";


const {
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

  res.status(200).json(result);
};

const updateClientAvatar = async (req, res) => {
  const { contactId } = req.params;
  const { path: oldPath, originalname } = req.file;

  const filename = `${contactId}`; //creating a new unique filename for the image
  const extension = path.extname(originalname);
  const filenamePath = `${contactId}${extension}`;

  const newPath = path.join("public", "avatars", filenamePath);

  //Getting the image from the tmp folder, resizing it and overwriting the previous image with the resized one
  await sharp(oldPath)
    .resize(250, 250, {
      fit: "cover", // Crop to fill 250×250
      position: "center", // Crop from center (default)
    })
    .toFile(newPath);

  const result = await cloudinary.uploader.upload(newPath, {
    folder: "customerAvatars", // This creates a folder in Cloudinary
    public_id: filename,
    overwrite: true,
  });

  // Delete the local files after upload
  await fs.unlink(oldPath);
  await fs.unlink(newPath);

  const avatarURL = result.secure_url;
  //const avatarURL = `https://res.cloudinary.com/airboxify-cloud/image/upload/f_auto,q_auto/customerAvatars/${filename}.${result.format}`;
  console.log(avatarURL);

  await Contact.findByIdAndUpdate(contactId, { avatarURL });
  res.status(200).json({ avatarURL });
};

const getAppointmentById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findById(contactId);

  if (!result) {
    throw httpError(404, "Contact ID Not Found");
  }

  res.status(200).json(result);
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
  
  const filename = `${contactId}`; //Getting the filename for the image
  const publicId = "customerAvatars/" + filename;
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image", // or "raw" if it's not an image
    invalidate: true, // optional: tells CDN to remove cached copies
  });
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
  updateClientAvatar,
  getAppointmentById,
  deleteAppointmentById,
  updateAppointmentNameById,
  updateAppointmentEmailById,
  updateAppointmentDueDateById,
  updateAppointmentStatusById
};
