'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _draftJs = require('draft-js');

var _createCompositeDecorator = require('./createCompositeDecorator');

var _createCompositeDecorator2 = _interopRequireDefault(_createCompositeDecorator);

var _moveSelectionToEnd = require('./moveSelectionToEnd');

var _moveSelectionToEnd2 = _interopRequireDefault(_moveSelectionToEnd);

var _proxies = require('./proxies');

var _proxies2 = _interopRequireDefault(_proxies);

var _defaultKeyBindingPlugin = require('./defaultKeyBindingPlugin');

var defaultKeyBindingPlugin = _interopRequireWildcard(_defaultKeyBindingPlugin);

var _immutable = require('immutable');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The main editor component
 */

var PluginEditor = function (_Component) {
  _inherits(PluginEditor, _Component);

  function PluginEditor(props) {
    _classCallCheck(this, PluginEditor);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _initialiseProps.call(_this);

    var plugins = [_this.props].concat(_toConsumableArray(_this.resolvePlugins()));

    plugins.forEach(function (plugin) {
      if (typeof plugin.initialize === 'function') {
        plugin.initialize({
          getEditorState: _this.getEditorState,
          setEditorState: _this.onChange
        });
      }
    });

    // attach proxy methods like `focus` or `blur`
    _proxies2.default.forEach(function (method) {
      _this[method] = function () {
        var _this$refs$editor;

        return (_this$refs$editor = _this.refs.editor)[method].apply(_this$refs$editor, arguments);
      };
    });
    return _this;
  }

  PluginEditor.prototype.componentWillMount = function componentWillMount() {
    var compositeDecorator = (0, _createCompositeDecorator2.default)(this.resolveDecorators(), this.getEditorState, this.onChange);
    var _editorState = _draftJs.EditorState.set(this.props.editorState, { decorator: compositeDecorator });
    this.onChange((0, _moveSelectionToEnd2.default)(_editorState));
  };

  PluginEditor.prototype.componentWillUnmount = function componentWillUnmount() {
    var _this2 = this;

    this.resolvePlugins().forEach(function (plugin) {
      if (plugin.willUnmount) {
        plugin.willUnmount({
          getEditorState: _this2.getEditorState,
          setEditorState: _this2.onChange
        });
      }
    });
  };

  // Cycle through the plugins, changing the editor state with what the plugins
  // changed (or didn't)


  PluginEditor.prototype.render = function render() {
    var pluginHooks = this.createPluginHooks();
    var customStyleMap = this.resolveCustomStyleMap();
    var accessibilityProps = this.resolveAccessibilityProps();
    return _react2.default.createElement(_draftJs.Editor, _extends({}, this.props, accessibilityProps, pluginHooks, {
      customStyleMap: customStyleMap,
      onChange: this.onChange,
      editorState: this.props.editorState,
      ref: 'editor'
    }));
  };

  return PluginEditor;
}(_react.Component);

PluginEditor.propTypes = {
  editorState: _react2.default.PropTypes.object.isRequired,
  onChange: _react2.default.PropTypes.func.isRequired,
  plugins: _react2.default.PropTypes.array,
  defaultKeyBindings: _react2.default.PropTypes.bool,
  customStyleMap: _react2.default.PropTypes.object,
  decorators: _react2.default.PropTypes.array
};
PluginEditor.defaultProps = {
  defaultKeyBindings: true,
  customStyleMap: {},
  plugins: [],
  decorators: []
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.onChange = function (editorState) {
    var newEditorState = editorState;
    _this3.resolvePlugins().forEach(function (plugin) {
      if (plugin.onChange) {
        newEditorState = plugin.onChange(newEditorState);
      }
    });

    if (_this3.props.onChange) {
      _this3.props.onChange(newEditorState);
    }
  };

  this.getEditorState = function () {
    return _this3.props.editorState;
  };

  this.createEventHooks = function (methodName, plugins) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var newArgs = [].slice.apply(args);
      newArgs.push({
        getEditorState: _this3.getEditorState,
        setEditorState: _this3.onChange
      });

      var result = false;

      plugins.find(function (plugin) {
        if (typeof plugin[methodName] === 'function') {
          result = plugin[methodName].apply(plugin, _toConsumableArray(newArgs)) === true;
          return true;
        }
        return false;
      });

      return result;
    };
  };

  this.createFnHooks = function (methodName, plugins) {
    return function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var newArgs = [].slice.apply(args);

      newArgs.push({
        getEditorState: _this3.getEditorState,
        setEditorState: _this3.onChange
      });

      if (methodName === 'blockRendererFn') {
        var _ret = function () {
          var block = { props: {} };
          var decorators = [];

          plugins.forEach(function (plugin) {
            if (typeof plugin[methodName] === 'function') {
              var _result = plugin[methodName].apply(plugin, _toConsumableArray(newArgs));
              if (_result !== undefined && _result !== null) {
                var pluginDecorators = _result.decorators;
                var pluginProps = _result.props;

                var pluginRest = _objectWithoutProperties(_result, ['decorators', 'props']); // eslint-disable-line no-use-before-define


                var _block = block;
                var props = _block.props;

                var rest = _objectWithoutProperties(_block, ['props']); // eslint-disable-line no-use-before-define


                if (pluginDecorators) decorators = [].concat(_toConsumableArray(decorators), _toConsumableArray(pluginDecorators));
                block = _extends({}, rest, pluginRest, { props: _extends({}, props, pluginProps) });
              }
            }
          });

          if (block.component) {
            decorators.forEach(function (decorator) {
              block.component = decorator(block.component);
            });
            return {
              v: block
            };
          }

          return {
            v: false
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      } else if (methodName === 'blockStyleFn') {
        var _ret2 = function () {
          var styles = void 0;

          plugins.forEach(function (plugin) {
            if (typeof plugin[methodName] === 'function') {
              var _result2 = plugin[methodName].apply(plugin, _toConsumableArray(newArgs));
              if (_result2 !== undefined) {
                styles = (styles ? styles + ' ' : '') + _result2;
              }
            }
          });

          return {
            v: styles || false
          };
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
      }

      var result = false;

      plugins.find(function (plugin) {
        if (typeof plugin[methodName] === 'function') {
          var res = plugin[methodName].apply(plugin, _toConsumableArray(newArgs));
          if (res !== undefined) {
            result = res;
            return true;
          }
          return false;
        }
        return false;
      });

      return result;
    };
  };

  this.createPluginHooks = function () {
    var pluginHooks = {};
    var eventHookKeys = [];
    var fnHookKeys = [];
    var plugins = [_this3.props].concat(_toConsumableArray(_this3.resolvePlugins()));

    plugins.forEach(function (plugin) {
      Object.keys(plugin).forEach(function (attrName) {
        if (attrName === 'onChange') return;

        // if `attrName` has been added as a hook key already, ignore this one
        if (eventHookKeys.indexOf(attrName) !== -1 || fnHookKeys.indexOf(attrName) !== -1) return;

        var isEventHookKey = attrName.indexOf('on') === 0 || attrName.indexOf('handle') === 0;
        if (isEventHookKey) {
          eventHookKeys.push(attrName);
          return;
        }

        // checks if `attrName` ends with 'Fn'
        var isFnHookKey = attrName.length - 2 === attrName.indexOf('Fn');
        if (isFnHookKey) {
          fnHookKeys.push(attrName);
        }
      });
    });

    eventHookKeys.forEach(function (attrName) {
      pluginHooks[attrName] = _this3.createEventHooks(attrName, plugins);
    });

    fnHookKeys.forEach(function (attrName) {
      pluginHooks[attrName] = _this3.createFnHooks(attrName, plugins);
    });

    return pluginHooks;
  };

  this.resolvePlugins = function () {
    var plugins = _this3.props.plugins.slice(0);
    if (_this3.props.defaultKeyBindings) {
      plugins.push(defaultKeyBindingPlugin);
    }

    return plugins;
  };

  this.resolveDecorators = function () {
    var _props = _this3.props;
    var decorators = _props.decorators;
    var plugins = _props.plugins;

    return (0, _immutable.List)([{ decorators: decorators }].concat(_toConsumableArray(plugins))).filter(function (plugin) {
      return plugin.decorators !== undefined;
    }).flatMap(function (plugin) {
      return plugin.decorators;
    });
  };

  this.resolveCustomStyleMap = function () {
    return _this3.props.plugins.filter(function (plug) {
      return plug.customStyleMap !== undefined;
    }).map(function (plug) {
      return plug.customStyleMap;
    }).concat([_this3.props.customStyleMap]).reduce(function (styles, style) {
      return _extends({}, styles, style);
    }, {});
  };

  this.resolveAccessibilityProps = function () {
    var accessibilityProps = {};
    var plugins = [_this3.props].concat(_toConsumableArray(_this3.resolvePlugins()));
    plugins.forEach(function (plugin) {
      if (typeof plugin.getAccessibilityProps === 'function') {
        var props = plugin.getAccessibilityProps();
        var popupProps = {};

        if (accessibilityProps.ariaHasPopup === undefined) {
          popupProps.ariaHasPopup = props.ariaHasPopup;
        } else if (props.ariaHasPopup === 'true') {
          popupProps.ariaHasPopup = 'true';
        }

        if (accessibilityProps.ariaExpanded === undefined) {
          popupProps.ariaExpanded = props.ariaExpanded;
        } else if (props.ariaExpanded === 'true') {
          popupProps.ariaExpanded = 'true';
        }

        accessibilityProps = _extends({}, accessibilityProps, props, popupProps);
      }
    });

    return accessibilityProps;
  };
};

exports.default = PluginEditor;