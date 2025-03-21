const messages = {
  400: "Bad request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not found",
  409: "Conflict",
};

const httpError = (status, message = messages[status]/*status is a variable that represents each key in the messages object above*/) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export { httpError };
