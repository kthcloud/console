export const errorHandler = (error) => {
  let errors = [];

  if (Object.hasOwn(error, "validationErrors")) {
    let errorTypes = Object.keys(error.validationErrors);
    errorTypes.forEach((type) => {
      let errorTypeErrors = error.validationErrors[type];

      errorTypeErrors.forEach((msg) => {
        if (type !== "name") {
          errors.push(msg);
        }
      });
    });
  }

  if (Object.hasOwn(error, "errors")) {
    error.errors.forEach((element) => {
      errors.push(element.msg);
    });
  }

  if (errors.length === 0) {
    errors.push("Unknown error");
  }

  return errors;
};
