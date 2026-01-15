import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: [true, "firstname is required"],
    },
    lastname: {
      type: String,
      required: [true, "lastname is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, "Set phone for User"],
    },
    avatarURL: {
      type: String,
      default: "https://airboxify-backend.onrender.com/avatars/unknownUser.png",
    },
    /*avatarURL: {
      type: String,
      default: "http://localhost:8000/avatars/unknownUser.png",
    },*/
    token: {
      type: String,
      default: null,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    groups: {
      type: Array,
      default: ["favourites"],
    },
    /*verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },*/
  },
  { versionKey: false }
);

const User = model("user", userSchema);

export { User };
