import express from "express";
import logger from "morgan";
import cors from "cors";
import { router as contactsRouter } from "./routes/api/appointmentsRouter.js";
import { router as usersRouter } from "./routes/api/usersRouter.js";

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  console.log(" Keepalive ping received at", new Date().toISOString());
  res.sendStatus(200);
});

// tells Express to serve static files from the public directory and not the app.js file)
// open http://localhost:3000/avatars/665c98dca10f7f28dc9eb8b2.jpeg on browser
app.use(express.static("public"));

app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);

// Handles errors caused by requests to non-existent routes
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  const statusCode = err.status || 500; // Default to 500 if no status code is set
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error', // Default message if none is provided
    },
  });
});

export { app };
