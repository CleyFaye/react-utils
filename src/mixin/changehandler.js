/** Add a changeHandler() method to an instance.
 * 
 * The following methods are added to an instance:
 * - changeHandler()
 * - changeCheckboxHandler()
 * 
 * The event source must have a name property, as it is used to know which field
 * to update.
 * 
 * @param {Component} instance
 * The object whose state must be updated
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
 *         onChange={this.changeCheckboxHandler} />
 *     </>;
 *   }
 * }
 * @endcode
 */
export default instance => {
  instance.changeHandler = event => {
    instance.setState({[event.target.name]: event.target.value});
  };
  instance.changeCheckboxHandler = event => {
    instance.setState({[event.target.name]: event.target.checked});
  };
};
