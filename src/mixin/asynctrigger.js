/* eslint-disable no-console */
import {hookLifeCycle} from "../utils/method.js";

const createRegisterAsyncTrigger = instance => (name, callback, delayInMs) => {
  instance._cfAsyncTriggers[name] = {
    callback: () => {
      instance._cfAsyncTriggers[name].timeout = null;
      if (!instance._cfAsyncMounted) {
        // eslint-disable-next-line max-len
        console.warn(`Callback for trigger "${name}" running on unmounted component; this might lead to memory leaks`);
      }
      callback();
    },
    delayInMs,
    timeout: null,
  };
};

const createAsyncTrigger = instance => name => {
  if (!instance._cfAsyncMounted) {
    console.error("Calling `trigger()` on an unmounted component could lead to memory leaks and is ignored");
    return;
  }
  const cursor = instance._cfAsyncTriggers[name];
  if (!cursor) throw new Error(`Unknown async trigger ${name}`);
  if (cursor.timeout !== null) {
    clearTimeout(cursor.timeout);
  }
  cursor.timeout = setTimeout(cursor.callback, cursor.delayInMs);
};

const createAsyncCancel = instance => name => {
  const cursor = instance._cfAsyncTriggers[name];
  if (cursor.timeout !== null) {
    clearTimeout(cursor.timeout);
    cursor.timeout = null;
  }
};

const createComponentDidMount = instance => () => {
  instance._cfAsyncMounted = true;
};

const createComponentWillUnmount = instance => () => {
  instance._cfAsyncMounted = false;
  for (const triggerName of Object.keys(instance._cfAsyncTriggers)) {
    instance.cancel(triggerName);
  }
};

/**
 * Register a delayed trigger linked to a component's instance.
 *
 * Set the following methods on the instance:
 *
 * - `registerAsyncTrigger(name, callback, delayInMs)`
 * - `asyncTrigger(name)`: trigger the associated callback after delay
 * - `asyncTriggerCancel(name)`: cancel a scheduled call to the trigger
 *
 * Multiple call to `trigger()` with the same name will rearm the delay each time.
 * `cancel()` can be called at anytime without error, it will cancel any scheduled call.
 *
 * When the component is dismounted, the triggers are all canceled. Triggering on an unmounted
 * component is considered an error and will not work.
 */
const asyncTriggerMixin = instance => {
  instance._cfAsyncTriggers = {};
  instance._cfAsyncMounted = false;
  instance.registerAsyncTrigger = createRegisterAsyncTrigger(instance);
  instance.asyncTrigger = createAsyncTrigger(instance);
  instance.asyncTriggerCancel = createAsyncCancel(instance);
  hookLifeCycle(instance, "componentDidMount", createComponentDidMount(instance));
  hookLifeCycle(instance, "componentWillUnmount", createComponentWillUnmount(instance));
};

export default asyncTriggerMixin;
