import Joi from "joi";

// validation for signup
const signupValidation = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "uk"] } })
    .required()
    .messages({
      "any.required": "Missing required email field",
      "string.email": "Invalid email format",
    }),
  phone: Joi.string().required(),
  password: Joi.string().min(6).max(16).required().messages({
    "any.required": "Missing required password field",
    "string.min": "Password must be at least {#limit} characters long",
    "string.max": "Password cannot be longer than {#limit} characters",
  }),
});

// validation for login
const loginValidation = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "uk"] } })
    .required()
    .messages({
      "any.required": "Missing required email field",
      "string.email": "Invalid email format",
    }),
  password: Joi.string().min(6).max(16).required().messages({
    "any.required": "Missing required password field",
    "string.min": "Password must be at least {#limit} characters long",
    "string.max": "Password cannot be longer than {#limit} characters",
  }),
});

// validation for adding Customer Appointment
const appointmentValidation = Joi.object({
  name: Joi.string().max(30).required().messages({
    "string.max": "Customer name cannot be longer than {#limit} characters",
  }),
  dueDate: Joi.date()
    .iso() // Ensures ISO 8601 format (e.g., "2023-12-31T12:00:00Z")
    .min("now") // Rejects past dates
    .required()
    .messages({
      "date.base": "Due date must be a valid date",
      "date.format":
        "Due date must be in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SSZ)",
      "date.min": "Due date cannot be in the past",
      "any.required": "Due date is required",
    }),
});

// validation for updating favorite field
const favoriteValidation = Joi.object({
  favorite: Joi.bool().required(),
});

// validation for updating Customer name
const updateAppointmentNameValidation = Joi.object({
  name: Joi.string().max(30).required().messages({
    "string.max": "Customer name cannot be longer than {#limit} characters",
  }),
});

// validation for updating a Customer email
const updateAppointmentEmailValidation = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "uk"] } })
    .required()
    .messages({
      "any.required": "Missing required email field",
      "string.email": "Invalid email format",
    }),
});

// prettier-ignore
export {
  updateAppointmentNameValidation,
  updateAppointmentEmailValidation,
  appointmentValidation,
  favoriteValidation,
  signupValidation,
  loginValidation,
};
