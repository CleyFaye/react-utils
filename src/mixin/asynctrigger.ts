/* eslint-disable no-console */
import {Component} from "react";
import {hookLifeCycle} from "../utils/method.js";

interface AsyncTriggerComponentExt extends Component {
  _cfAsyncTrigger?: {
    mounted: boolean;
    triggers: Array<AsyncTrigger>;
  }
}

/** Allow multiple calls to trigger() to trigger a callback after a set delay. */
export class AsyncTrigger {
  private instance: AsyncTriggerComponentExt;
  private callback: () => void;
  private delayInMs: number;
  private timeout: number | null = null;

  public constructor(
    instance: AsyncTriggerComponentExt,
    callback: () => void,
    delayInMs: number,
  ) {
    this.instance = instance;
    this.callback = callback;
    this.delayInMs = delayInMs;
  }

  /** Trigger (or rearm) the delay, then call the callback */
  public trigger(): void {
    if (!this.instance._cfAsyncTrigger) throw new Error("Unexpected state");
    if (!this.instance._cfAsyncTrigger.mounted) {
      console.error("Calling `trigger()` on an unmounted component is ignored and might indicate a memory leak");
      return;
    }
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(this.realCallback, this.delayInMs);
  }

  /** Cancel the trigger. Can be called multiple time without consequences. */
  public cancel(): void {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  private realCallback = () => {
    if (!this.instance._cfAsyncTrigger) throw new Error("Unexpected state");
    this.timeout = null;
    if (!this.instance._cfAsyncTrigger.mounted) {
      console.warn("Callback trigger running on unmounted component; this might indicate a memory leak");
    }
    this.callback();
  };
}

/**
 * Must be called in the constructor of a class component.
 *
 * Returns a trigger instance linked to the component's lifecycle.
 */
const registerAsyncTrigger = (
  instance: Component,
  callback: () => void,
  delayInMs: number,
): AsyncTrigger => {
  const instanceRec = instance as AsyncTriggerComponentExt;
  if (!instanceRec._cfAsyncTrigger) {
    instanceRec._cfAsyncTrigger = {
      mounted: false,
      triggers: [],
    };
    hookLifeCycle(
      instance,
      "componentDidMount",
      () => {
        if (!instanceRec._cfAsyncTrigger) throw new Error("Unexpected state");
        instanceRec._cfAsyncTrigger.mounted = true;
      },
    );
    hookLifeCycle(
      instance,
      "componentWillUnmount",
      () => {
        if (!instanceRec._cfAsyncTrigger) throw new Error("Unexpected state");
        instanceRec._cfAsyncTrigger.mounted = false;
        instanceRec._cfAsyncTrigger.triggers.forEach(trigger => {
          trigger.cancel();
        });
        // Attempt at avoiding circular references for the GC
        instanceRec._cfAsyncTrigger.triggers.length = 0;
      },
    );
  }
  const newTrigger = new AsyncTrigger(instanceRec, callback, delayInMs);
  instanceRec._cfAsyncTrigger.triggers.push(newTrigger);
  return newTrigger;
};

export default registerAsyncTrigger;
