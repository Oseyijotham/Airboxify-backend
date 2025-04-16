import express from "express";
import { ctrlWrapper } from "../../helpers/ctrlWrapper.js";
// prettier-ignore
import {
  addAppointment,
  getAllAppointments,
  updateAppointmentAvatar,
  getAppointmentById,
  deleteAppointmentById,
  updateAppointmentNameById,
  updateAppointmentEmailById,
  updateAppointmentDueDateById,
  updateAppointmentStatusById,
  updateClientAvatar,
  updatemyClientAvatar,
} from "../../controllers/appointmentsController.js";
import { authenticateToken } from "../../middlewares/authenticateToken.js";
import { upload } from "../../middlewares/upload.js";

const router = express.Router();


router.get("/", authenticateToken, ctrlWrapper(getAllAppointments));

router.get("/:contactId", authenticateToken, ctrlWrapper(getAppointmentById));

router.post("/", authenticateToken, ctrlWrapper(addAppointment));

router.delete("/:contactId", authenticateToken, ctrlWrapper(deleteAppointmentById));

router.patch("/avatars/:contactId", authenticateToken, upload.single("avatar"), ctrlWrapper(updateAppointmentAvatar));


router.patch("/nameupdate/:contactId", authenticateToken, ctrlWrapper(updateAppointmentNameById));


router.patch("/emailupdate/:contactId", authenticateToken, ctrlWrapper(updateAppointmentEmailById));


router.patch("/phoneupdate/:contactId", authenticateToken, ctrlWrapper(updateAppointmentDueDateById));

router.patch("/taskupdate/:contactId", authenticateToken, ctrlWrapper(updateAppointmentStatusById));



export { router };
