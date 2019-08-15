/** Add a changeHandler() method to an instance.
 * 
 * @param {Component} instance
 * The object whose state must be updated
 * 
 * @return {function(stateName: string): function}
 * A function that can be used to create onChange event handler.
 * These functions will update the state value.
 * 
 * @sample How to use
 * @begincode
 * class MyComp extends React.Component {
 *   constructor(props) {
 *     super(props);
 *     changeHandler(this);
 *   }
 *   render() {
 *     return <SomeInput
 *       value={this.state.fieldName}
 *       onChange={this.changeHandler("fieldName")} />
 *   }
 * }
 * @endcode
 */
export default instance =>
  instance.changeHandler = fieldName => event => {
    instance.setState({[fieldName]: event.target.value});
  };