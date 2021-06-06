@cley_faye/react-utils
======================
Some utilities I was bored of rewriting all the time when using React.

This library provides some mixins and some utility classes to manage contexts and usual behavior for
some components.

Installation and usage
----------------------

Install using npm:

```shell
npm install @cley_faye/react-utils
```

Use using direct imports:

```JavaScript
import exStateMixin from "@cley_faye/react-utils/lib/mixin/exstate.js";

class SomeComp extends React.Component {
  constructor(props) {
    super(props);
    exStateMixin(this, {some: "value"});
  }
}
```

Mixins
------
The mixins provided are used by calling them in a component's constructor. They will add some
functions and properties to the instance.

### Extended state
Provide some extra way to manipulate the state and gives a promise-based way to wait for a state
to apply.

#### Full extended state example

```JavaScript
import exStateMixin from "@cley_faye/react-utils/lib/mixin/exstate.js";

class SomeComp extends React.Component {
  constructor(props) {
    super(props);
    exStateMixin(this, {some: "value"});
  }

  handleChange(newValue) {
    this.setState({some: newValue});
  }

  handleResetState() {
    this.resetState().then(() => console.log("State reset"));
  }

  handleAsyncChange(newValue) {
    this.updateState({some: newValue}).then(() => console.log("state change applied"));
  }
}
```

#### Extended state details
The `updateState()` and `resetState()` are promise-based.
In particular, only use `updateState()` when you want to wait for the new state to be applied.
Otherwise use the regular `setState()`, as it will allow state change merge as usual.

### Callback helpers
Provide some methods to call a props-provided callback for some usual cases.

#### Full callback example

```JavaScript
import cbMixin from "@cley_faye/react-utils/lib/mixin/cb.js";

class SomeComp extends React.Component {
  constructor(props) {
    super(props);
    cbMixin(this);
  }

  handleSimpleCallback() {
    this.cb(this.props.directFunc, "someparam");
  }

  handlePromiseCB() {
    this.cbProm(this.props.promiseFunc, "someparam").then(() => console.log("done"));
  }

  handleValueCB() {
    this.cbValue(this.props.value).then(value => console.log(value));
  }
}
```

#### Callback details
All three functions handles the case of an undefined value (by silently returning undefined).
`cbProm()` can use either a function that returns a `Promise` or not, in both case it will resolve
to a `Promise`.

The `cbValue()` methods allows providing either a value or a function in the prop.
In the case of a function, it can either directly return the value or return a promise that resolve
with the expected value.
In all cases, `cbValue()` will return the value.

### Change handler
Provides a generic `handleChange()` function to pass to component's `onChange` prop.

#### Change handler example

```JavaScript
import changeHandlerMixin from "@cley_faye/react-utils/lib/mixin/changehandler.js";

class SomeComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {someVal: ""};
    changeHandlerMixin(this);
  }

  render() {
    return <input
      type="text"
      value={this.state.someVal}
      name="someVal"
      onChange={this.handleChange}
    />;
  }
}
```

#### Custom change handlers
The default change handler (named `DOM`) is made to handle changes on DOM elements, where a DOM
event is handled to the `onChange` callback.
It will use the name of the component as a key, and handles most elements that have a `value`
property, as well as checkboxes.

It is possible to provide a different way to handle changes (for example, when using a custom
framework) by providing an object as the second argument of `changeHandlerMixin()`.
Such object must have two properties that are functions named `getName` and `getValue`.
These functions will receive the parameters from `onChange` and must respectively return the key to
update the state, and the value to use.

Here's an exemple that mimic the DOM handler:

```JavaScript
changeHandlerMixin(
  this,
  {
    getName: ev => ev.target.name,
    getValue: ev => ev.target.value;
  }
);
```

### Form fields mixin
Manage mandatory field and field validation with error reporting.

The basic of it is, you have to provide a list of properties and how they validate.
Such validation is done at multiple point, and error for different fields are set in the state.

#### Full form fields example

```JavaScript
import formMixin from "@cley_faye/react-utils/lib/mixin/form.js";
import {notEmpty} from "@cley_faye/react-utils/lib/validator/string.js";

class SomeComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {textField: ""};
    formMixin(
      this,
      {
        textField: notEmpty("Can not be empty"),
      },
    );
  }

  handleSubmit() {
    this.validateForm().then(formOk => {
      console.log("Form ok:", formOk);
    });
  }

  render() {
    return <>
      <input
        type="text"
        name="textField"
        value={this.state.textField}
        onChange={this.handleChange}
      />
      <span>{this.state.textFieldError}</span>
    </>;
  }
}
```

#### Form fields details
Note that calling `formMixin()` will call `changeHandlerMixin()` if it was not called beforehand.

Some validators are provided, but custom validators can be provided as simple functions that takes
the value as input and return/resolve with an error message if something's wrong.

Context management
------------------

A single helper to manage context values through a "main" component state is provided.
It provides a convenient way to plug into the React state update propagation with contexts.

Here's a basic full example:

```JavaScript
// File "usercontext.js"
import stateContext from "@cley_faye/react-utils/lib/context/state.js";

const doLogin = (ctx, login) => {
  return ctx.update({login});
}

export default stateContext(
  "User",
  {
    login: undefined,
  },
  {
    doLogin,
  },
);

// File "compo.js"
import React from "react";
import UserCtx from "./usercontext.js";

class Compo extends React.Component {
  render() {
    return <span>{this.props.UserCtx.login}</span>;
  }
}

export default UserCtx.withCtx(Compo);

// File "app.js"
import React from "react";
import UserCtx from "./usercontext.js";
import Compo from "./compo.js";

class App extends React.Component {
  constructor(props) {
    super(props);
    UserCtx.init(this);
  }

  render() {
    return <UserCtx.Provider stateRef={this}>
      <Compo />
    </UserCtx.Provider>;
  }
}
```

### State context details
It is possible to add custom initial values for a context as the second argument of `init()`.
The actual content is stored in the component's state.

A special case has been made to pass static properties when using `withCtx()`.
For now it only passes a static property named `navigationOptions` if it exists.
