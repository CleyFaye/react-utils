import {Component} from "react";

export interface HandlerType {
  getName: (...args: Array<unknown>) => string;
  getValue: (...args: Array<unknown>) => unknown;
}

export type HandlerTypes = Record<string, HandlerType>;

/**
 * All the method acceptable for eventType must match a handler
 */
const handlerTypes: HandlerTypes = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "DOM": {
    getName: ev => {
      if (!("target" in (ev as Record<string, unknown>))) throw new Error("Not target in event");
      const target = (ev as {target?: HTMLInputElement}).target;
      if (!target) throw new Error("No target in event");
      if (!target.name) throw new Error("Missing name");
      return target.name;
    },
    getValue: ev => {
      if (!("target" in (ev as Record<string, unknown>))) throw new Error("Not target in event");
      const target = (ev as {target?: HTMLInputElement}).target;
      if (!target) throw new Error("No target in event");
      if (target.type === "checkbox") {
        return target.checked;
      }
      return target.value;
    },
  },
};

/**
 * Return a method suitable to be used as a general "onChange" handler.
 *
 * The event source must have a name property, as it is used to know which field
 * to update.
 *
 * @param instance
 * The object whose state must be updated
 *
 * @param eventType
 * Default to "DOM" (also, currently the only supported value).
 * Determine where we look for field names and values.
 * In DOM:
 * - name is taken from "event.target.name"
 * - value is taken from "event.target.value" (or event.target.checked for
 *   checkbox)
 * It is possible to pass an object with a custom handler.
 *
 * @sample How to use
 * @begincode
 * class MyComp extends React.Component {
 *   constructor(props) {
 *     super(props);
 *     this.handleChange = changeHandler(this);
 *   }
 *   render() {
 *     return <>
 *       <SomeInput
 *         name="fieldName"
 *         value={this.state.fieldName}
 *         onChange={this.handleChange} />
 *       <Checkbox
 *         name="checkField"
 *         checked={this.state.checkField}
 *         onChange={this.handleChange} />
 *     </>;
 *   }
 * }
 * @endcode
 */
const changeHandlerMixin = (
  instance: Component,
  eventType: "DOM" | HandlerType = "DOM",
// eslint-disable-next-line @typescript-eslint/ban-types
): Function => {
  const handler = typeof eventType === "string"
    ? handlerTypes[eventType]
    : eventType;
  return (...args: Array<unknown>) => {
    const name = handler.getName(...args);
    const value = handler.getValue(...args);
    instance.setState({[name]: value});
  };
};

export default changeHandlerMixin;
