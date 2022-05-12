import {Component} from "react";
import {hookLifeCycle} from "../utils/method.js";

const errorName = (fieldName: string) => `${fieldName}Error`;

export type FieldValidatorFunc = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
) => string | undefined | Promise<string | undefined>;

export type Fields = Record<string, FieldValidatorFunc>;

export type ValidatorFunc = () => Promise<boolean>;

/**
 * Returns a function to handle form validation.
 *
 * The resetValidation() method can be used to clear all error messages.
 *
 * @param instance
 * Instance of the component that handle the form fields.
 * The state will change like this:
 * - properties named after each fields will hold the actual value
 * - properties named `${fieldName}Error` will either hold an error string to display to the user,
 *   or null if the field validated successfuly
 *
 * To perform form validation, call the returned function.
 * It returns a Promise that resolve with either true (all fields are valid) or
 * false (some failed validation).
 *
 * @param formFields
 * A key-value mapping, where keys are field name and value are the validation function for that
 * field.
 * The validation function must return a string with an error message if the validation fail,
 * nothing otherwise.
 * Validation functions can be promises.
 */
// eslint-disable-next-line max-lines-per-function
const formMixin = (
  instance: Component,
  formFields: Fields,
): ValidatorFunc => {
  const instanceRec = instance as Component<unknown, Record<string, unknown>> & {
    state: Record<string, unknown>,
    _cfForm?: {
      locked: boolean;
      fields: Fields;
    };
  };
  if (!instanceRec._cfForm) {
    instanceRec._cfForm = {
      locked: false,
      fields: formFields,
    };
  }
  Object.keys(formFields).forEach(fieldName => {
    instanceRec.state[errorName(fieldName)] = null;
  });
  const validateForm = async (listToValidateDef?: Array<string>) => {
    const listToValidate = listToValidateDef === undefined
      ? Object.keys(formFields)
      : listToValidateDef;
    if (!instanceRec._cfForm) throw new Error("Unexpected state");
    if (instanceRec._cfForm.locked) {
      instanceRec._cfForm.locked = false;
      return false;
    }
    let anyFail = false;
    await Promise.all(listToValidate.map(
      // Done to be able to mix up direct return and promises
      async key => {
        const res = await formFields[key](instanceRec.state[key]);
        if (res) anyFail = true;
        instanceRec.setState({[errorName(key)]: res ?? null});
      },
    ));
    return !anyFail;
  };
  const validateUpdate = (prevProps: unknown, prevState: Record<string, unknown>) => {
    const listToValidate = Object.keys(formFields).reduce<Array<string>>(
      (fieldsList, key) => {
        if (prevState[key] !== instanceRec.state[key]) {
          fieldsList.push(key);
        }
        return fieldsList;
      },
      [],
    );
    // eslint-disable-next-line no-console
    validateForm(listToValidate).catch(console.error);
  };
  hookLifeCycle(
    instance,
    "componentDidUpdate",
    validateUpdate,
  );
  return validateForm;
};

export const resetValidation = (instance: Component): void => {
  const instanceRec = instance as Component<unknown, Record<string, unknown>> & {
    state: Record<string, unknown>,
    _cfForm?: {
      locked: boolean;
      fields: Fields;
    };
  };
  if (!instanceRec._cfForm) throw new Error("Unexpected state");
  instanceRec._cfForm.locked = true;
  return instanceRec.setState({
    ...Object.keys(instanceRec._cfForm.fields).reduce<Record<string, null>>(
      (acc, fieldName) => {
        acc[errorName(fieldName)] = null;
        return acc;
      },
      {},
    ),
  });
};

export default formMixin;
