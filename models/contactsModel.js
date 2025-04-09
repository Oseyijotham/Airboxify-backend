import { Schema, model } from "mongoose";

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
      default: "Enter task details",
    },
    phone: {
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
   /*avatarURL: {
      type: String,
      default: "https://oasis-tasks-backend.onrender.com/avatars/Unknown.png",
    },*/
    avatarURL: {
      type: String,
      default: "http://localhost:8000/avatars/unknownCustomer.png"
    },
    groups: {
      type: Array,
      default: ["favourites"],
    },
  },
  { versionKey: false }
);

const Contact = model("contact", contactSchema);

export { Contact };
