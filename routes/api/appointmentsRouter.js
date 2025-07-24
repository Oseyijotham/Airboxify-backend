import express from "express";
import { ctrlWrapper } from "../../helpers/ctrlWrapper.js";
// prettier-ignore
import {
  addAppointment,
  getAllAppointments,
  getAppointmentById,
  deleteAppointmentById,
  updateAppointmentNameById,
  updateAppointmentEmailById,
  updateAppointmentDueDateById,
  updateAppointmentStatusById,
  updateClientAvatar,
} from "../../controllers/appointmentsController.js";
import { authenticateToken } from "../../middlewares/authenticateToken.js";
import { upload } from "../../middlewares/upload.js";

const router = express.Router();


router.get("/", authenticateToken, ctrlWrapper(getAllAppointments));

router.get("/:appointmentId", authenticateToken, ctrlWrapper(getAppointmentById));

router.post("/", authenticateToken, ctrlWrapper(addAppointment));

router.delete("/:appointmentId", authenticateToken, ctrlWrapper(deleteAppointmentById));

router.patch("/avatars/:appointmentId", authenticateToken, upload.single("avatar"), ctrlWrapper(updateClientAvatar));


router.patch("/nameupdate/:appointmentId", authenticateToken, ctrlWrapper(updateAppointmentNameById));


router.patch("/emailupdate/:appointmentId", authenticateToken, ctrlWrapper(updateAppointmentEmailById));


router.patch("/phoneupdate/:appointmentId", authenticateToken, ctrlWrapper(updateAppointmentDueDateById));

router.patch("/taskupdate/:appointmentId", authenticateToken, ctrlWrapper(updateAppointmentStatusById));



export { router };
