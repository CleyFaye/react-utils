import {FieldValidatorFunc} from "../mixin/form.js";

export const optional = (
  otherValidator: FieldValidatorFunc,
): FieldValidatorFunc => (value: unknown) => {
  if (
    value === undefined
    || ((typeof value === "string") && value === "")
  ) {
    return;
  }
  return otherValidator(value);
};
