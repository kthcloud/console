import { sentenceCase } from "change-case";

export const errorHandler = (error) => {
  let errors = [];

  if (Object.hasOwn(error, "validationErrors")) {
    if (Object.hasOwn(error.validationErrors, "name")) {
      errors.validationErrors.name.forEach((element) => {
        errors.push(sentenceCase("Name " + element.message));
      });
    }
  }

  if (Object.hasOwn(error, "errors")) {
    error.errors.forEach((element) => {
      errors.push(sentenceCase(element.msg));
    });
  }

  if (errors.length === 0) {
    errors.push("Unknown error");
  }

  return errors;
};
