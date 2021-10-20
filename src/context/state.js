import React, {createContext} from "react";
import PropTypes from "prop-types";
import {promiseUpdateState} from "../mixin/exstate.js";

export const contextNameToStateName = contextName => `${contextName}Ctx`;

/** Populate the initial value (when no provider is available) with default
 * values and empty functions.
 */
const computeRealInitialValue = (initialValues, functionsToBind) => ({
  ...initialValues,
  ...Object.keys(functionsToBind).reduce((acc, cur) => {
    acc[cur] = () => {};
    return acc;
  }, {}),
  update: () => {},
});

/** Create the actual context value stored in an object's state.
 *
 * Must be called in the component's constructor.
 */
const createInitFunction = (
  contextStateName,
  initialValues,
  functionsToBind,
) => (stateRef, initialValuesOverride) => {
  // Object might not have a state defined
  if (stateRef.state === undefined) {
    stateRef.state = {};
  }
  stateRef.state[contextStateName] = {
    ...initialValues,
    ...initialValuesOverride,
    // Bind functions
    ...Object.keys(functionsToBind || {}).reduce((acc, functionName) => {
      acc[functionName] = (...args) => functionsToBind[functionName](
        stateRef.state[contextStateName],
        ...args,
      );
      return acc;
    }, {}),
    update: async newValue => {
      const newCtxValue = {

        ...stateRef.state[contextStateName],
        ...newValue,
      };
      await promiseUpdateState(
        stateRef,
        {[contextStateName]: newCtxValue},
      );
      return newCtxValue;
    },
  };
};

/** Provider that pick the state from the provided state value */
const createStateProvider = (context, contextStateName) => {
  const StateProvider = props => {
    const Provider = context.Provider;
    return <Provider value={props.stateRef.state[contextStateName]}>
      {props.children}
    </Provider>;
  };
  StateProvider.displayName = "StateProvider";
  StateProvider.propTypes = {
    stateRef: PropTypes.instanceOf(React.Component).isRequired,
    children: PropTypes.node.isRequired,
  };
  return StateProvider;
};

/** Functional component to automatically provide a Context in another
 * Component's props.
 */
const createWithCtx = (context, contextStateName) => Compo => {
  const ConsumerWrapper = React.forwardRef((props, ref) => {
    const Consumer = context.Consumer;
    return <Consumer>
      {ctx => <Compo
        ref={ref}
        {...props}
        {...{[contextStateName]: ctx}}
      />}
    </Consumer>;
  });
  ConsumerWrapper.displayName = "ConsumerWrapper";
  // TODO this should be more generic
  if (Compo.navigationOptions) {
    ConsumerWrapper.navigationOptions = Compo.navigationOptions;
  }
  return ConsumerWrapper;
};

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
 *   promise. The promise resolve with the new context value.
 *   In case you want to to multiple calls to the same context object, you must
 *   use the updated value each time.
 * - To make it easier, it is possible to bind custom functions to the state;
 *   these function can reference the current context using their first argument
 *   (so they can update it using `arg.update()`). To do so provide an object
 *   with name as keys and functions as values as the `functionsToBind`
 *   argument.
 */
const createContextState = (name, initialValues, functionsToBindDef) => {
  const functionsToBind = functionsToBindDef
    ? functionsToBindDef
    : {};
  const contextStateName = contextNameToStateName(name);
  const contextInitialValue = computeRealInitialValue(
    initialValues,
    functionsToBind,
  );
  const context = createContext(contextInitialValue);

  return {
    Consumer: context.Consumer,
    Provider: createStateProvider(
      context,
      contextStateName,
    ),
    init: createInitFunction(
      contextStateName,
      initialValues,
      functionsToBind,
    ),
    withCtx: createWithCtx(
      context,
      contextStateName,
    ),
  };
};

export default createContextState;
