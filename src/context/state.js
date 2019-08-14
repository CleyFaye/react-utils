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

/** Create a Context that is backed by a Component's state */
export default (name, initialValues) =>
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
    stateRef.state[contextStateName] = {
      ...Object.assign({}, initialValues),
      update: newValue => promiseUpdateState(
        stateRef,
        {
          [contextStateName]: newValue,
        }),
    };
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