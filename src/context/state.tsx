/* eslint-disable @typescript-eslint/ban-types */
import React, {Component, createContext} from "react";
import PropTypes from "prop-types";

type UpdateFunc<Data> = (prevData: Readonly<Data>) => Partial<Data>;

export const contextNameToStateName = (contextName: string): string => `${contextName}Ctx`;

export interface ContextBuiltin<Data extends Record<string, unknown>> {
  /** Update the context content. Behave similarly to setState() */
  setContext: (data: UpdateFunc<Data>) => void;
}

export type Context<
  Data extends Record<string, unknown>,
  Functions extends Record<string, Function>
> = Data
& Functions
& ContextBuiltin<Data>;

/**
 * Populate the initial value (when no provider is available) with default values and empty
 * functions.
 */
const computeRealInitialValue = <
  Data extends Record<string, unknown>,
  Functions extends Record<string, Function>
>(
  initialValues: Partial<Data>,
  functionsToBind: Partial<Functions>,
): Context<Data, Functions> => ({
  ...initialValues,
  ...Object.keys(functionsToBind).reduce<Record<string, Function>>((acc, cur) => {
    acc[cur] = () => {};
    return acc;
  }, {}),
  setContext: () => {},
}) as unknown as Context<Data, Functions>;

const createSetContext = <
  Data extends Record<string, unknown>,
  Functions extends Record<string, Function>
>(
  stateRef: Component<unknown, Record<string, Context<Data, Functions>>>,
  contextStateName: string,
) => (newValueRaw: UpdateFunc<Data> | Data) => {
  stateRef.setState(oldState => {
    const oldValue = oldState[contextStateName];
    const newValue = typeof newValueRaw === "function"
      ? newValueRaw(oldValue)
      : newValueRaw;
    return {
      [contextStateName]: {
        ...oldValue,
        ...newValue,
      },
    };
  });
};

/**
 * Create the actual context value stored in an object's state.
 *
 * Must be called in the component's constructor.
 */
const createInitFunction = <
  Data extends Record<string, unknown>,
  Functions extends Record<string, Function>
>(
  contextStateName: string,
  initialValues: Data,
  functionsToBind?: Functions,
) => (
  stateRef: Component<
  unknown,
  Record<string, Context<Data, Functions>>>,
  initialValuesOverride?: Partial<Data>,
) => {
  const stateRefRec
    = stateRef as Partial<Component<unknown, Record<string, Context<Data, Functions>>>>
    & {state?: Record<string, Context<Data, Functions>>};
  if (stateRefRec.state === undefined) stateRefRec.state = {};
  stateRefRec.state[contextStateName] = {
    ...initialValues,
    ...initialValuesOverride,
    // Bind functions
    ...Object.keys(functionsToBind ?? {}).reduce<Record<string, Function>>((acc, functionName) => {
      if (!functionsToBind) throw new Error("Unexpected state");
      acc[functionName] = (
        ...args: Array<unknown>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      ) => functionsToBind[functionName](stateRef.state[contextStateName], ...args);
      return acc;
    }, {}),
    setContext: createSetContext(stateRef, contextStateName),
  } as unknown as Context<Data, Functions>;
};

/** Provider that pick the state from the provided state value */
const createStateProvider = <
  Data extends Record<string, unknown>,
  Functions extends Record<string, Function>
>(
  context: React.Context<Context<Data, Functions>>,
  contextStateName: string,
) => {
  const stateProvider: React.FunctionComponent<{
    stateRef: Component<unknown, Record<string, Context<Data, Functions>>>,
    children: React.ReactNode
  }> = props => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Provider = context.Provider;
    return <Provider value={props.stateRef.state[contextStateName]}>
      {props.children}
    </Provider>;
  };
  stateProvider.displayName = "StateProvider";
  stateProvider.propTypes = {
    stateRef: PropTypes.instanceOf(React.Component).isRequired,
    children: PropTypes.node.isRequired,
  };
  return stateProvider;
};

/**
 * Functional component to automatically provide a Context in another
 * Component's props.
 */
const createWithCtx = <
  Data extends Record<string, unknown>,
  Functions extends Record<string, Function>
>(
  context: React.Context<Context<Data, Functions>>,
  contextStateName: string,
) => (
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Compo: React.ComponentClass,
  passStatics = ["navigationOptions"],
) => {
  const consumerWrapper = React.forwardRef<Component>((props, ref) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Consumer = context.Consumer;
    return <Consumer>
      {ctx => <Compo
        ref={ref}
        {...props}
        {...{[contextStateName]: ctx}}
      />}
    </Consumer>;
  });
  consumerWrapper.displayName = "ConsumerWrapper";
  const compoRec = Compo as unknown as Record<string, unknown>;
  const consumerRec = consumerWrapper as unknown as Record<string, unknown>;
  for (const staticName of passStatics) {
    if (compoRec[staticName]) {
      consumerRec[staticName] = compoRec[staticName];
    }
  }
  return consumerWrapper;
};

export interface StateContext<
  Data extends Record<string, unknown>,
  Functions extends Record<string, Function>
> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Consumer: React.Consumer<Context<Data, Functions>>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Provider: React.FunctionComponent<{
    stateRef: Component<unknown, Record<string, Context<Data, Functions>>>,
    children: React.ReactNode
  }>;
  init: (
    stateRef: Component<
    unknown,
    Record<string, Context<Data, Functions>>
    >,
    initialValuesOverride?: Partial<Data>,
  ) => void;
  withCtx: (compo: React.ComponentClass, passStatics?: Array<string>) =>
  React.ForwardRefExoticComponent<React.RefAttributes<Component>>;
}

/**
 * Create a Context that is backed by a Component's state.
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
 * - To update a value on the component, you can call its `setContext()` method
 *   roughly the same way you'd call `setState()`.
 * - To make it easier, it is possible to bind custom functions to the state;
 *   these function can reference the current context using their first argument.
 *   To do so provide an object with name as keys and functions as values as the `functionsToBind`
 *   argument.
 */
const createContextState = <
  Data extends Record<string, unknown>,
  Functions extends Record<string, Function>
>(
  name: string,
  initialValues: Data,
  functionsToBindDef?: Functions,
): StateContext<Data, Functions> => {
  const functionsToBind = functionsToBindDef
    ? functionsToBindDef
    : {};
  const contextStateName = contextNameToStateName(name);
  const contextInitialValue = computeRealInitialValue<Data, Functions>(
    initialValues,
    functionsToBind,
  );
  const context = createContext<Context<Data, Functions>>(contextInitialValue);

  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Consumer: context.Consumer,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Provider: createStateProvider<Data, Functions>(
      context,
      contextStateName,
    ),
    init: createInitFunction<Data, Functions>(
      contextStateName,
      initialValues,
      functionsToBindDef,
    ),
    withCtx: createWithCtx<Data, Functions>(
      context,
      contextStateName,
    ),
  };
};

export default createContextState;
