/** Add a changeHandler() method to an instance.
 * 
 * The following methods are added to an instance:
 * - changeHandler()
 * 
 * The event source must have a name property, as it is used to know which field
 * to update.
 * 
 * @param {Component} instance
 * The object whose state must be updated
 * 
 * @param {string} eventType
 * Default to "DOM" (also, currently the only supported value).
 * Determine where we look for field names and values.
 * In DOM:
 * - name is taken from "event.target.name"
 * - value is taken from "event.target.value" (or event.target.checked for
 *   checkbox)
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
  if (eventType === "DOM") {
    instance.changeHandler = event => {
      let value;
      if (event.target.type === "checkbox") {
        value = event.target.checked;
      } else {
        value = event.target.value;
      }
      instance.setState({[event.target.name]: value});
    };
  } else {
    throw new Error(`Unknown event type ${eventType}`);
  }
};
