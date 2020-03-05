/**
 * All the method acceptable for eventType must match a handler
 */
const handlerTypes = {
  "DOM": {
    getName: ev => ev.target.name,
    getValue: ev => {
      if (ev.target.type === "checkbox") {
        return ev.target.checked;
      }
      return ev.target.value;
    },
  },
};

/** Add a changeHandler() method to an instance.
 *
 * An alias named "handleChange" is also added for convenience.
 * 
 * The event source must have a name property, as it is used to know which field
 * to update.
 * 
 * @param {Component} instance
 * The object whose state must be updated
 * 
 * @param {string|object} eventType
 * Default to "DOM" (also, currently the only supported value).
 * Determine where we look for field names and values.
 * In DOM:
 * - name is taken from "event.target.name"
 * - value is taken from "event.target.value" (or event.target.checked for
 *   checkbox)
 * It is possible to pass an object with two function asproperties: getName()
 * and getValue(). In this case, these functions will be called with all the
 * arguments from onChange.
 * 
 * @sample How to use
 * @begincode
 * class MyComp extends React.Component {
 *   constructor(props) {
 *     super(props);
 *     changeHandler(this);
 *   }
 *   render() {
 *     return <>
 *       <SomeInput
 *         name="fieldName"
 *         value={this.state.fieldName}
 *         onChange={this.changeHandler} />
 *       <Checkbox
 *         name="checkField"
 *         checked={this.state.checkField}
 *         onChange={this.changeHandler} />
 *     </>;
 *   }
 * }
 * @endcode
 */
export default (instance, eventType = "DOM") => {
  const handler = typeof eventType === "string"
    ? handlerTypes[eventType]
    : eventType;
  if (!(handler.getName && handler.getValue)) {
    if (typeof eventType === "string") {
      throw new Error(`Unknown event type ${eventType}`);
    }
    throw new Error("Incorrect event type");
  }
  instance.changeHandler = (...args) => {
    const name = handler.getName(...args);
    const value = handler.getValue(...args);
    instance.setState({[name]: value});
  };
  instance.handleChange = instance.changeHandler;
};
