/* eslint-disable @typescript-eslint/ban-types */
import {Component} from "react";

interface HookOverload {
  (instance: Component, methodName: "componentDidMount" | "componentWillUnmount", handler: () => void, before?: boolean): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (instance: Component, methodName: "componentDidUpdate", handler: (prevProps: any, prevState: any) => void, before?: boolean): void;
}

/**
 * Hook on an existing lifecycle method.
 *
 * This function add the execution of `handler` before or after the existing portion of the
 * lifecycle method.
 *
 * This only works on lifecycle methods that don't return anything.
 *
 * @param before
 * If true, the handler code is executed before the "real" function.
 * If false (the default) it is executed after.
 */
export const hookLifeCycle: HookOverload = (
  instance: Component,
  methodName: string,
  handler: Function,
  before = false,
): void => {
  const boundHandler = handler.bind(instance) as Function;
  const instanceRec = instance as unknown as Record<string, Function>;
  if (methodName in instanceRec) {
    const oldMethod = instanceRec[methodName].bind(instance) as Function;
    if (before) {
      instanceRec[methodName] = (...args: Array<unknown>) => {
        boundHandler(...args);
        oldMethod(...args);
      };
    } else {
      instanceRec[methodName] = (...args: Array<unknown>) => {
        oldMethod(...args);
        boundHandler(...args);
      };
    }
  } else {
    instanceRec[methodName] = boundHandler;
  }
};
