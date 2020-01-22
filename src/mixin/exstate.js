/******************************************************************************
 * @preserve
 * @cley_faye/react-utils - small set of React utilities
 * Copyright (C) 2019 Gabriel Paul "Cley Faye" Risterucci
 * <cleyfaye@cleyfaye.net>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
export const promiseUpdateState = (instance, newValue) => new Promise(resolve =>
  instance.setState(newValue, resolve));

/** Extend an instance of Component with Promise-based state handling.
 * 
 * It will add two methods to the instance:
 * - updateState(newValue): return a promise that resolve when the state updated
 * - resetState(): reset state values to initialValue
 * 
 * @param {Component} instance
 * The instance of Component to extend
 * 
 * @param {Object} initialValue
 * Initial value of the state. Used both in initialisation and for reset.
 */
export default (instance, initialValue) => {
  if (initialValue !== undefined) {
    instance._initialState = Object.assign({}, initialValue);
    instance.state = Object.assign(instance.state || {}, instance._initialState);
  }
  instance.updateState = newValue => promiseUpdateState(instance, newValue);
  instance.resetState = () => instance.updateState(instance._initialState);
};
