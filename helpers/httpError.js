/*This helper function (httpError) is used to generate the error object from the error class (Error). Now all you need to do is to call
this function and pass it two arguments (the status code of the error and the error message), this function will then return the 
error object (with the status and message properties already set), the returned error object can now be thrown.*/





const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export { httpError };
