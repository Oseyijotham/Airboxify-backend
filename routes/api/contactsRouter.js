import express from "express";
import { ctrlWrapper } from "../../helpers/ctrlWrapper.js";
// prettier-ignore
import {
  addContact,
  deleteContactById,
  getAllContacts,
  getContactById,
  updateContactAvatar,
  updateContactNameById,
  updateContactEmailById,
  updateContactPhoneById,
  updateTaskStatusById,
} from "../../controllers/contactsController.js";
import { authenticateToken } from "../../middlewares/authenticateToken.js";
import { upload } from "../../middlewares/upload.js";

const router = express.Router();


router.get("/", authenticateToken, ctrlWrapper(getAllContacts));

router.get("/:contactId", authenticateToken, ctrlWrapper(getContactById));

router.post("/", authenticateToken, ctrlWrapper(addContact));

router.delete("/:contactId", authenticateToken, ctrlWrapper(deleteContactById));

router.patch("/avatars/:contactId", authenticateToken, upload.single("avatar"), ctrlWrapper(updateContactAvatar));


router.patch("/nameupdate/:contactId", authenticateToken, ctrlWrapper(updateContactNameById));


router.patch("/emailupdate/:contactId", authenticateToken, ctrlWrapper(updateContactEmailById));


router.patch("/phoneupdate/:contactId", authenticateToken, ctrlWrapper(updateContactPhoneById));

router.patch("/taskupdate/:contactId", authenticateToken, ctrlWrapper(updateTaskStatusById));



export { router };
