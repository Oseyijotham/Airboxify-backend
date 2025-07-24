import { Schema, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
      default: "Enter customer email",
    },
    dueDate: {
      type: String,
      required: [true, "Set phone for contact"],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    avatarURL: {
      type: String,
      default: "https://airboxify-backend.onrender.com/avatars/unknownCustomer.png",
    },
    /*avatarURL: {
      type: String,
      default: "http://localhost:8000/avatars/unknownCustomer.png"
    },*/
    groups: {
      type: Array,
      default: ["favourites"],
    },
  },
  { versionKey: false }
);

const Appointment = model("contact", appointmentSchema);

export { Appointment };
