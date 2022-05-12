import {FieldValidatorFunc} from "../mixin/form.js";

export const notEmpty = (message: string): FieldValidatorFunc => (value: string) => {
  if (value.length === 0) {
    return message || "Can't be empty";
  }
};
