import jwt from "jsonwebtoken";
import { User } from "../models/usersModel.js";
import { httpError } from "../helpers/httpError.js";
import "dotenv/config";
const { SECRET_KEY } = process.env;

const authenticateToken = async (req, _res, next) => {
  const { authorization = "" } = req.headers; //If the authorization header doesn't exist, it defaults to an empty string ("")
  const [bearer, token] = authorization.split(" ");

  try {
    if (bearer !== "Bearer") {
      throw httpError(401, "Unauthorized");
    }

    const { id } = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(id);

    if (!user || user.token !== token || !user.token) {
      throw httpError(401, "Unauthorized");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export { authenticateToken };
