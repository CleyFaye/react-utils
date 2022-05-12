/* eslint-disable @typescript-eslint/ban-types */
import {Component} from "react";

interface HookOverload {
  (instance: Component, methodName: "componentDidMount" | "componentWillUnmount", handler: () => void): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (instance: Component, methodName: "componentDidUpdate", handler: (prevProps: any, prevState: any) => void): void;
}

/**
 * Hook on an existing lifecycle method.
 *
 * This function add the execution of `handler` after the existing portion of the lifecycle method.
 *
 * This only works on lifecycle methods that don't return anything.
 */
export const hookLifeCycle: HookOverload = (
  instance: Component,
  methodName: string,
  handler: Function,
): void => {
  const boundHandler = handler.bind(instance) as Function;
  const instanceRec = instance as unknown as Record<string, Function>;
  if (methodName in instanceRec) {
    const oldMethod = instanceRec[methodName].bind(instance) as Function;
    instanceRec[methodName] = (...args: Array<unknown>) => {
      oldMethod(...args);
      boundHandler(...args);
    };
  } else {
    instanceRec[methodName] = boundHandler;
  }
};
