/** Update the state of an object using a Promise-based interface.
 *
 * @param {Component} instance
 * The object to update the state on
 *
 * @param {(function(oldValue): Object|Object)} newValue
 * Either the new value to put into the state, or a function that take as
 * parameter the old value and return the new value.
 *
 * @return {Promise<void>}
 * A promise that resolve after the state is updated.
 */
export const promiseUpdateState = (
  instance,
  newValue,
) => new Promise(resolve => instance.setState(newValue, resolve));

/** Extend an instance of Component with Promise-based state handling.
 *
 * It will add two methods to the instance:
 * - updateState(newValue): return a promise that resolve when the state updated
 * - resetState(): reset state values to initialValue (only if one is provided)
 *
 * @param {Component} instance
 * The instance of Component to extend
 *
 * @param {Object} [initialValue]
 * Initial value of the state. Used both in initialisation and for reset.
 * If not provided, no change is done to the state of the object, and the
 * resetState() method will not work.
 */
const exStateMixin = (instance, initialValue) => {
  if (initialValue !== undefined) {
    instance._initialState = {...initialValue};
    instance.state = Object.assign(instance.state || {}, instance._initialState);
    instance.resetState = () => instance.updateState(instance._initialState);
  }
  instance.updateState = newValue => promiseUpdateState(instance, newValue);
};

export default exStateMixin;
