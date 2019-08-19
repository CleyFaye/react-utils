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
import React from "react";
import PropTypes from "prop-types";
import {createContext} from "react";
import {promiseUpdateState} from "../mixin/exstate";

export const contextNameToStateName = contextName =>
  `${contextName}Ctx`;

/** Create a Context that is backed by a Component's state.
 * 
 * How to use this:
 * - Create a file somewhere (usually in `/context`) named after your context
 *   (for example `user.js`)
 * - In this file, export the return value from this function (`retval`)
 * - To create a state provider in a component you have to call the init()
 *   method in its constructor (`retval.init(this)`)
 * - During render, you have to render a component from `retval.Provider` with
 *   the appropriate prop set (`<retval.Provider stateRef={this} />`)
 * - For consumer, either use the `retval.Consumer` class as a regular context,
 *   or wrap your component with `retval.withCtx(CompClass)`. In the second case
 *   a prop named `<contextName>Ctx` will be provided.
 * - To update a value on the component, you can call its `update()` method
 *   roughly the same way you'd call `setState()`, except that it returns a
 *   promise.
 * - To make it easier, it is possible to bind custom functions to the state;
 *   these function can reference the current context using `this` (so they can
 *   update it using `this.update()`). To do so provide an object with name as
 *   keys and functions as values as the `functionsToBind` argument.
 */
export default (name, initialValues, functionsToBind) =>
{
  const contextStateName = contextNameToStateName(name);
  const context = createContext({
    ...initialValues,
    update: () => {},
  });

  /** Create the actual context value stored in an object's state.
   * 
   * Must be called in the component's constructor.
   */
  const init = stateRef => {
    // Object might not have a state defined
    if (stateRef.state === undefined) {
      stateRef.state = {};
    }
    stateRef.state[contextStateName] = {
      ...Object.assign({}, initialValues),
      update: newValue => promiseUpdateState(
        stateRef,
        {
          [contextStateName]: Object.assign(
            {},
            stateRef.state[contextStateName],
            newValue
          ),
        }),
    };
    const stateObj = stateRef.state[contextStateName];
    // Bind functions
    Object.keys(functionsToBind || {}).forEach(functionName =>
      stateObj[functionName].bind(stateObj));
  };

  /** Provider that pick the state from the provided state value */
  const StateProvider = props => {
    const Provider = context.Provider;
    return <Provider value={props.stateRef.state[contextStateName]}>
      {props.children}
    </Provider>;
  };
  StateProvider.propTypes = {
    stateRef: PropTypes.instanceOf(React.Component),
    children: PropTypes.node,
  };

  /** Functional component to automatically provide a Context in another
   * Component's props.
   */
  const withCtx = Compo => {
    const ConsumerWrapper = props => {
      const Consumer = context.Consumer;
      return <Consumer>
        {ctx => <Compo
          {...props}
          {...{[contextStateName]: ctx}} />}
      </Consumer>;
    };
    return ConsumerWrapper;
  };

  return {
    Consumer: context.Consumer,
    Provider: StateProvider,
    init,
    withCtx,
  };
};