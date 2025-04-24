/*This helper function (httpError) is used to generate the error object from the error class (Error). Now all you need to do is to call the
this function and pass it two arguments (the status code and the corresponding error message), this function will then return the 
error object (with the status and message properties already set), the returned error object can now be thrown.*/

/*When you call this function (httpError) you don't need to pass a corresponding error message as the second argument, this is automatically taken
care of by the logic in this file.
*/


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
