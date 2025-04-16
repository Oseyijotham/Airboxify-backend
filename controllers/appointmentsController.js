import { Contact } from "../models/contactsModel.js";
import {
  contactValidation,
  updateNameValidation
} from "../validations/validation.js";
import { httpError } from "../helpers/httpError.js";
import path from "path";
import fs from "fs/promises";
//import { v4 as uuid4 } from "uuid";
import "dotenv/config";
import Jimp from "jimp";
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { UploadClient } from "@uploadcare/upload-client";
import { storeFile, UploadcareSimpleAuthSchema } from "@uploadcare/rest-client";
import { HttpsProxyAgent } from "https-proxy-agent";
import AWS from "aws-sdk";
import sharp from "sharp";

const {
 publicKey,
  secretKey,
  accessKeyId,
  secretAccessKey
} = process.env;



const client = new UploadClient({ publicKey: publicKey });

const uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({
  publicKey: publicKey,
  secretKey: secretKey
});

const s3 = new AWS.S3({
  endpoint: "https://s3.us-west-004.backblazeb2.com/Airboxify", // Your B2 endpoint
  accessKeyId: accessKeyId, // From B2 App Keys
  secretAccessKey: secretAccessKey, // From B2 App Keys
  region: "us-west-004", // Must match endpoint
  signatureVersion: "v4",
  s3ForcePathStyle: true,
});





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

  res.json(result);
};

const updateAppointmentAvatar = async (req, res) => {
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

  // Delete the local file after upload
  await fs.unlink(oldPath);

  const avatarURL = result.secure_url;
  //const avatarURL = `https://res.cloudinary.com/airboxify-cloud/image/upload/f_auto,q_auto/customerAvatars/${filename}.${result.format}`;
  console.log(avatarURL);

  await Contact.findByIdAndUpdate(contactId, { avatarURL });
  res.status(200).json({ avatarURL });
};


const updateClientAvatar = async (req, res) => {
  const { contactId } = req.params;
  const { path: oldPath } = req.file;

  const filename = `${contactId}`; //creating a new unique filename for the image

  /*
  const result = await cloudinary.uploader.upload(oldPath, {
    folder: "customerAvatars", // This creates a folder in Cloudinary
    public_id: filename,
    overwrite: true,
  });*/

  try {
    //Getting the image from the tmp folder, resizing it and overwriting the previous image with the resized one
    await Jimp.read(oldPath).then((image) =>
      // image.resize(250, 250).write(oldPath)
      image.cover(250, 250).write(oldPath)
    );

    /*// First upload the file
    const uploadResult = await uploadFile(
      oldPath, // Can be Buffer, Readable stream, or file path
      {
        authSchema: uploadcareSimpleAuthSchema,
      }
    );

    console.log("File uploaded, now storing:", uploadResult.uuid);*/

    //client.uploadFile(req.file.originalname).then((file) => console.log(file.uuid));

    // Get file binary data
    const binaryData = await fs.readFile(oldPath);

    // First upload the file
    const uploadedFile = await client.uploadFile(binaryData);

    // Then store uploaded the file
    const storeResult = await storeFile(
      { uuid: uploadedFile.uuid },
      { authSchema: uploadcareSimpleAuthSchema }
    );

    // Delete the local file after upload
    await fs.unlink(oldPath);

    // Construct the URL
    const avatarURL = `https://ucarecdn.com/${storeResult.uuid}/`;
    await Contact.findByIdAndUpdate(contactId, { avatarURL });
    res.status(200).json({ avatarURL });
  } catch (error) {
    console.error("Error uploading/storing file:", error);
    throw error;
  }
};

const updatemyClientAvatar = async (req, res) => {
  const { contactId } = req.params;
  const { path: oldPath, originalname } = req.file;

  //const extension = path.extname(originalname);
  const filename = `${contactId}`; //creating a new unique filename for the image

  //const newPath = path.join("public", "avatars", filename);

  try {
    

    // Get file binary data
    const binaryData = await fs.readFile(oldPath);

    console.log("File size (bytes):", binaryData.length);

    try {await s3
      .headObject({ Bucket: "Airboxify", Key: `uploads/${filename}` })
      .promise();
     await s3
       .deleteObject({
         Bucket: "Airboxify",
         Key: `uploads/${filename}`,
       })
        .promise();
      await s3
        .upload({
          Bucket: "Airboxify",
          Key: `uploads/${filename}`, // Optional folder structure
          Body: binaryData,
        })
        .promise();
      }
    catch (err) {
        const result = await s3
          .upload({
            Bucket: "Airboxify",
            Key: `uploads/${filename}`, // Optional folder structure
            Body: binaryData,
          })
        .promise();
      console.log("Public URL:", result.Location);
    }

   
    
    
     const signedUrl = s3.getSignedUrl("getObject", {
       Bucket: "Airboxify",
       Key: `uploads/${filename}`,
       Expires: 518400, // URL expires in 6 days
     });

    // Delete the local file after upload
    await fs.unlink(oldPath);
    console.log(signedUrl);
    // Construct the URL
    //const avatarURL = result.Location;
    const avatarURL = signedUrl;
    await Contact.findByIdAndUpdate(contactId, { avatarURL });
    res.status(200).json({ avatarURL });
  } catch (error) {
    console.error("Error uploading/storing file:", error);
    throw error;
  }
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
  await s3
    .deleteObject({
      Bucket: "Airboxify",
      Key: `uploads/${contactId}`,
    })
    .promise();
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
  updateClientAvatar,
  getAppointmentById,
  deleteAppointmentById,
  updateAppointmentNameById,
  updateAppointmentEmailById,
  updateAppointmentDueDateById,
  updateAppointmentStatusById,
  updatemyClientAvatar,
};
