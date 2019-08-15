import changeHandler from "./changehandler";
import {promiseUpdateState} from "./exstate";

const errorName = fieldName => `${fieldName}Error`;

/** Add functions to handle form validation.
 * 
 * This will automatically call changeHandler() on the same instance to handle
 * fields update.
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
 * To perform live validation, call validateUpdate() from componentDidUpdate()
 * and pass prevState as the first argument.
 * 
 * @param {Object} formFields
 * A key-value mapping, where keys are field name and value are the validation
 * function for that field.
 * The validation function must return a string with an error message if the
 * validation fail, nothing otherwise.
 * Validation functions can be promises.
 */
export default (instance, formFields) => {
  changeHandler(instance);
  Object.keys(formFields).forEach(fieldName => {
    instance.state[errorName(fieldName)] = null;
  });
  instance.validateForm = listToValidate => {
    if (listToValidate === undefined) {
      listToValidate = Object.keys(formFields);
    }
    return Promise.all(listToValidate.map(key =>
      // Done to be able to mix up direct return and promises
      Promise.all([formFields[key](instance.state[key])]).then(
        res => promiseUpdateState(instance, {[errorName(key)]: res[0] || null}))
    )).then(
      () => Object.keys(formFields).reduce(
        (acc, key) => {
          if (instance.state[errorName(key)]) {
            return false;
          }
          return acc;
        },
        true
      )
    );
  };
  instance.validateUpdate = prevState => {
    const listToValidate = Object.keys(formFields).reduce(
      (fieldsList, key) => {
        if (prevState[key] != instance.state[key]) {
          fieldsList.push(key);
        }
        return fieldsList;
      },
      []
    );
    return instance.validateForm(listToValidate);
  };
};