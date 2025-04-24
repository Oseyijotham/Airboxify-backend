/*This helper function (ctrlWrapper) wraps around all the controller functions, it wraps each of them inside an async function (func) that has try and catch blocks. 
It makes it so that we only need to throw errors (for error handling) inside the controller functions, and then the catch block
in this wrapper catches those errors and allows the caught errors to be handled by the Global error handler (in the app.js file)*/

//The wrapping is done in the router files (appointmentsRouter.js and usersRouter.js) located in the folder called routes\api

const ctrlWrapper = (controllerFunction) => {
  const func = async (req, res, next) => {
    try {
      await controllerFunction(req, res, next);
    } catch (error) {
      next(error);
    }
  };
  return func;
};

export { ctrlWrapper };
