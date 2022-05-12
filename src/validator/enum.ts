import {FieldValidatorFunc} from "../mixin/form.js";

export const inEnum = <T = string>(
  values: Array<T>,
  message: string,
): FieldValidatorFunc => (value: T) => {
  if (!values.includes(value)) {
    return message
      || `Must be one of ${values.map(val => `"${val as unknown as string}"`).join(",")}`;
  }
};
