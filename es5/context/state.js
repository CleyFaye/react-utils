"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.contextNameToStateName = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _exstate = require("../mixin/exstate");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var contextNameToStateName = function contextNameToStateName(contextName) {
  return "".concat(contextName, "Ctx");
};
/** Create a Context that is backed by a Component's state */


exports.contextNameToStateName = contextNameToStateName;

var _default = function _default(name, initialValues) {
  var contextStateName = contextNameToStateName(name);
  var context = (0, _react.createContext)({
    value: initialValues,
    update: function update() {}
  });
  /** Create the actual context value stored in an object's state */

  var init = function init(stateRef) {
    return {
      value: Object.assign({}, initialValues),
      update: function update(newValue) {
        return (0, _exstate.promiseUpdateState)(stateRef, _defineProperty({}, contextStateName, newValue));
      }
    };
  };
  /** Provider that pick the state from the provided state value */


  var StateProvider = function StateProvider(props) {
    var Provider = context.Provider;
    return _react["default"].createElement(Provider, {
      value: props.stateRef
    }, props.children);
  };

  StateProvider.propTypes = {
    stateRef: _propTypes["default"].instanceOf(_react["default"].Component),
    children: _propTypes["default"].node
  };
  /** Construct a Provider built on a given instance state.
   * 
   * This is needed to actually update the rendered components when the state
   * update and to keep it easy to use by not having to explicitely reference
   * the state field used.
   */

  var provide = function provide(instance) {
    return _react["default"].createElement(StateProvider, {
      stateRef: instance.state[contextStateName]
    });
  };
  /** Functional component to automatically provide a Context in another
   * Component's props.
   */


  var withCtx = function withCtx(Compo) {
    var ConsumerWrapper = function ConsumerWrapper(props) {
      var Consumer = context.Consumer;
      return _react["default"].createElement(Consumer, null, function (ctx) {
        return _react["default"].createElement(Compo, _extends({}, props, _defineProperty({}, contextStateName, ctx)));
      });
    };

    return ConsumerWrapper;
  };

  return {
    Consumer: context.Consumer,
    Provider: StateProvider,
    init: init,
    withCtx: withCtx,
    provide: provide
  };
};

exports["default"] = _default;
//# sourceMappingURL=state.js.map
