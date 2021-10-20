import changeHandler from "./changehandler.js";
import {promiseUpdateState} from "./exstate.js";

const errorName = fieldName => `${fieldName}Error`;

/** Add functions to handle form validation.
 *
 * This will automatically call changeHandler() on the same instance to handle
 * fields update.
 *
 * A resetValidation() method can be used to clear all error messages.
 *
 * @param {Component} instance
 * Instance of the component that handle the form fields.
 * The state will change like this:
 * - properties named after the field will hold the actual value
 * - properties named `${fieldName}Error` will either hold an error string to
 *   display to the user, or null if the field validated successfuly
 *
 * To perform form validation, call the validateForm() method on the instance.
 * It returns a Promise that resolve with either true (all fields are valid) or
 * false (some failed validation).
 *
 * @param {Object} formFields
 * A key-value mapping, where keys are field name and value are the validation
 * function for that field.
 * The validation function must return a string with an error message if the
 * validation fail, nothing otherwise.
 * Validation functions can be promises.
 */
// eslint-disable-next-line max-lines-per-function
const formMixin = (instance, formFields) => {
  if (!instance.changeHandler) {
    changeHandler(instance);
  }
  Object.keys(formFields).forEach(fieldName => {
    instance.state[errorName(fieldName)] = null;
  });
  instance.validateForm = listToValidateDef => {
    const listToValidate = listToValidateDef === undefined
      ? Object.keys(formFields)
      : listToValidateDef;
    if (instance._lockValidation) {
      instance._lockValidation = false;
      return Promise.resolve(false);
    }
    return Promise.all(listToValidate.map(
      // Done to be able to mix up direct return and promises
      key => Promise.all([formFields[key](instance.state[key])]).then(
        res => promiseUpdateState(instance, {[errorName(key)]: res[0] || null}),
      ),
    )).then(
      () => Object.keys(formFields).reduce(
        (acc, key) => {
          if (instance.state[errorName(key)]) {
            return false;
          }
          return acc;
        },
        true,
      ),
    );
  };
  instance.validateUpdate = prevState => {
    const listToValidate = Object.keys(formFields).reduce(
      (fieldsList, key) => {
        if (prevState[key] !== instance.state[key]) {
          fieldsList.push(key);
        }
        return fieldsList;
      },
      [],
    );
    return instance.validateForm(listToValidate);
  };
  if (instance.componentDidUpdate) {
    const originalUpdate = instance.componentDidUpdate.bind(instance);
    instance.componentDidUpdate = (prevProps, prevState, ...extraArgs) => {
      instance.validateUpdate(prevState);
      originalUpdate(prevProps, prevState, ...extraArgs);
    };
  } else {
    instance.componentDidUpdate = (prevProps, prevState) => {
      instance.validateUpdate(prevState);
    };
  }
  instance.resetValidation = () => {
    instance._lockValidation = true;
    return promiseUpdateState(instance, {
      ...Object.keys(formFields).reduce(
        (acc, fieldName) => {
          acc[errorName(fieldName)] = null;
          return acc;
        },
        {},
      ),
    });
  };
};

export default formMixin;
