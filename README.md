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
import changeHandlerMixin from "@cley_faye/react-utils/lib/mixin/changehandler.js";

class SomeComp extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = changeHandlerMixin(this);
  }
}
```

Mixins
------
The mixins provided are used by calling them in a component's constructor.
They return a function or an object and are usually set as properties of the component.

### Change handler
Provides a generic function to handle `onChange` events.

#### Change handler example

```JavaScript
import changeHandlerMixin from "@cley_faye/react-utils/lib/mixin/changehandler.js";

class SomeComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {someVal: ""};
    this.handleChange = changeHandlerMixin(this);
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
this.handleDOMChange = changeHandlerMixin(
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
    this.validateForm = formMixin(
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
Some validators are provided by the library, but custom validators can be provided as simple
functions that takes the value as input and return/resolve with an error message if something's
wrong.

Using the form mixin will hook into `componentDidUpdate()` to update field errors when they are
updated.

### Asynchronous triggers
Provides a unified way to trigger a callback after a given delay.

Some usages is refreshing user data with polling, or pooling keystrokes for auto completion.

Async triggers are automatically canceled when a component is unmounted, and their trigger function
can be called multiple time, resulting in only one call after the final delay is expired.

#### Full asynchronous triggers example

```JavaScript
import asyncTriggerMixin from "@cley_faye/react-utils/lib/mixin/asynctrigger.js";

class SomeComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      searchString: "",
    };
    this.updateListTrigger = asyncTriggerMixin(
      this,
      this.asyncTriggerUpdateList.bind(this),
      500,
    );
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidUpdate(oldProps, oldState) {
    if (oldState.searchString !== this.state.searchString) {
      this.updateListTrigger.trigger();
    }
  }

  handleChange(ev) {
    this.setState({searchString: ev.target.value});
  }

  asyncTriggerUpdateList() {
    // Do some network requests or something
    getUpdatedList(this.state.searchString)
      .then(list => {
        this.setState({list});
      });
  }

  render() {
    return <>
      <input onChange={this.handleChange} />
      <List values={this.state.list} />
    </>;
  }
}
```

Context management
------------------
A single helper to manage context values through a "main" component state is provided.
It provides a convenient way to plug into the React state update propagation with contexts.

Here's a basic full example:

```JavaScript
// File "usercontext.js"
import stateContext from "@cley_faye/react-utils/lib/context/state.js";

const doLogin = (ctx, login) => {
  return ctx.setContext({login});
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
If a second argument is provided to `withCtx()`, it must be a list of strings representing the
static properties from the base component to replicate on the returned proxy.

Updating the content of a context is done with either the `setContext()` method.
It takes as input the new values, in a similar way to `setState()`.

When defining functions to put in a context (as described above) care must be taken to not overwrite
the context with outdated value, by providing a function that receive the old value, as you'd do
with `setState()`.
