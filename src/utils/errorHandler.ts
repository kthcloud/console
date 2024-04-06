type ValidationError = {
  [key: string]: string[];
};

type ErrorElement = {
  msg: string;
};

type DeployApiError = {
  validationErrors?: ValidationError;
  errors?: ErrorElement[];
};

export const errorHandler = (error: DeployApiError) => {
  const errors = [];

  if (error.validationErrors) {
    const errorTypes = Object.keys(error.validationErrors);

    errorTypes.forEach((type) => {
      const errorTypeErrors = error.validationErrors![type];

      errorTypeErrors.forEach((msg) => {
        errors.push(msg + ": " + type);
      });
    });
  }

  if (error.errors) {
    error.errors.forEach((element) => {
      errors.push(element.msg);
    });
  }

  if (errors.length === 0) {
    errors.push("Unknown error");
  }

  return errors;
};
