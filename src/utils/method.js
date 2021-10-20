/**
 * Hook on an existing lifecycle method.
 *
 * This function add the execution of `handler` after the existing portion of the lifecycle method.
 */
export const hookLifeCycle = (instance, methodName, handler) => {
  const boundHandler = handler.bind(instance);
  if (instance[methodName]) {
    const oldMethod = instance[methodName].bind(instance);
    instance[methodName] = (...args) => {
      oldMethod(...args);
      boundHandler(...args);
    };
  } else {
    instance[methodName] = boundHandler;
  }
};
