'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _index = require('../../index');

var _index2 = _interopRequireDefault(_index);

var _chai = require('chai');

var _draftJs = require('draft-js');

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* For use in integration tests, as in where you need to test the
 * Editor component as well */

var TestEditor = function (_Component) {
  _inherits(TestEditor, _Component);

  function TestEditor() {
    var _temp, _this, _ret;

    _classCallCheck(this, TestEditor);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.state = {}, _this.onChange = function (editorState) {
      _this.setState({
        editorState: editorState
      });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  TestEditor.prototype.componentWillMount = function componentWillMount() {
    this.state.editorState = (0, _index.createEditorStateWithText)(this.props.text);
  };

  TestEditor.prototype.render = function render() {
    return _react2.default.createElement(_index2.default, _extends({}, this.props, {
      editorState: this.state.editorState,
      onChange: this.onChange
    }));
  };

  return TestEditor;
}(_react.Component);

describe('Editor', function () {
  describe('renders the Editor', function () {
    var onChange = _sinon2.default.spy();
    var editorState = void 0;

    beforeEach(function () {
      editorState = _draftJs.EditorState.createEmpty();
    });

    it('with an empty plugins list provided', function () {
      var result = (0, _enzyme.mount)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        plugins: []
      }));
      (0, _chai.expect)(result).to.have.ref('editor');
    });

    it('without the plugins property provided', function () {
      var result = (0, _enzyme.mount)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange
      }));
      (0, _chai.expect)(result).to.have.ref('editor');
    });

    it('with a plugin provided', function () {
      var createCustomPlugin = function createCustomPlugin() {
        return {};
      };
      var customPlugin = createCustomPlugin();
      var plugins = [customPlugin];
      var result = (0, _enzyme.mount)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        plugins: plugins
      }));
      (0, _chai.expect)(result).to.have.ref('editor');
    });

    it('and by default adds the defaultKeyBindings plugin', function () {
      var result = (0, _enzyme.mount)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange
      }));
      var pluginEditor = result.instance();
      (0, _chai.expect)(pluginEditor.resolvePlugins()[0]).to.include.keys('keyBindingFn');
    });

    it('without the defaultKeyBindings plugin if deactivated', function () {
      var result = (0, _enzyme.mount)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        defaultKeyBindings: false
      }));
      var pluginEditor = result.instance();
      (0, _chai.expect)(pluginEditor.resolvePlugins()).to.have.lengthOf(0);
    });
  });

  describe('with plugins', function () {
    var onChange = void 0;
    var editorState = void 0;

    beforeEach(function () {
      editorState = _draftJs.EditorState.createEmpty();
      onChange = _sinon2.default.spy();
    });

    it('calls the on-hooks of the plugin', function () {
      var plugins = [{
        onUpArrow: _sinon2.default.spy(),
        onDragEnter: _sinon2.default.spy(),
        onEscape: _sinon2.default.spy(),
        onTab: _sinon2.default.spy(),
        onChange: _sinon2.default.spy()
      }];
      var result = (0, _enzyme.shallow)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        plugins: plugins
      }));

      var draftEditor = result.node;
      var plugin = plugins[0];
      draftEditor.props.onUpArrow();
      (0, _chai.expect)(plugin.onUpArrow).has.been.calledOnce();
      draftEditor.props.onDragEnter();
      (0, _chai.expect)(plugin.onDragEnter).has.been.calledOnce();
      draftEditor.props.onEscape();
      (0, _chai.expect)(plugin.onEscape).has.been.calledOnce();
      draftEditor.props.onTab();
      (0, _chai.expect)(plugin.onTab).has.been.calledOnce();
      draftEditor.props.onChange(editorState);

      // is called twice since componentWillMount injects the decorators and calls onChange again
      (0, _chai.expect)(plugin.onChange).has.been.calledTwice();
    });

    it('calls the handle-hooks of the plugin', function () {
      var plugins = [{
        handleKeyCommand: _sinon2.default.spy(),
        handlePastedText: _sinon2.default.spy(),
        handleReturn: _sinon2.default.spy(),
        handleDrop: _sinon2.default.spy()
      }];
      var result = (0, _enzyme.shallow)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        plugins: plugins
      }));

      var pluginEditor = result.instance();
      var draftEditor = result.node;
      var plugin = plugins[0];
      var expectedSecondArgument = {
        getEditorState: pluginEditor.getEditorState,
        setEditorState: pluginEditor.onChange
      };
      draftEditor.props.handleKeyCommand('command');
      (0, _chai.expect)(plugin.handleKeyCommand).has.been.calledOnce();
      (0, _chai.expect)(plugin.handleKeyCommand).has.been.calledWith('command', expectedSecondArgument);
      draftEditor.props.handlePastedText('command');
      (0, _chai.expect)(plugin.handlePastedText).has.been.calledOnce();
      (0, _chai.expect)(plugin.handlePastedText).has.been.calledWith('command', expectedSecondArgument);
      draftEditor.props.handleReturn('command');
      (0, _chai.expect)(plugin.handleReturn).has.been.calledOnce();
      (0, _chai.expect)(plugin.handleReturn).has.been.calledWith('command', expectedSecondArgument);
      draftEditor.props.handleDrop('command');
      (0, _chai.expect)(plugin.handleDrop).has.been.calledOnce();
      (0, _chai.expect)(plugin.handleDrop).has.been.calledWith('command', expectedSecondArgument);
    });

    it('calls willUnmount', function () {
      var plugins = [{
        willUnmount: _sinon2.default.spy()
      }];
      var result = (0, _enzyme.mount)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        plugins: plugins
      }));

      var pluginEditor = result.node;
      var plugin = plugins[0];
      var expectedArgument = {
        getEditorState: pluginEditor.getEditorState,
        setEditorState: pluginEditor.onChange
      };
      result.unmount();

      (0, _chai.expect)(plugin.willUnmount).has.been.calledOnce();
      (0, _chai.expect)(plugin.willUnmount).has.been.calledWith(expectedArgument);
    });

    it('calls the handle- and on-hooks of the first plugin and not the second in case it was handeled', function () {
      var plugins = [{
        handleKeyCommand: _sinon2.default.stub().returns(true),
        onUpArrow: _sinon2.default.stub().returns(true)
      }, {
        handleKeyCommand: _sinon2.default.spy(),
        onUpArrow: _sinon2.default.spy()
      }];
      var result = (0, _enzyme.shallow)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        plugins: plugins
      }));

      var draftEditor = result.node;
      draftEditor.props.handleKeyCommand('command');
      (0, _chai.expect)(plugins[0].handleKeyCommand).has.been.calledOnce();
      (0, _chai.expect)(plugins[1].handleKeyCommand).has.not.been.called();

      draftEditor.props.onUpArrow();
      (0, _chai.expect)(plugins[0].onUpArrow).has.been.calledOnce();
      (0, _chai.expect)(plugins[1].onUpArrow).has.not.been.called();
    });

    it('calls the handle- and on-hooks of all plugins in case none handeles the command', function () {
      var plugins = [{
        handleKeyCommand: _sinon2.default.spy(),
        onUpArrow: _sinon2.default.spy()
      }, {
        handleKeyCommand: _sinon2.default.spy(),
        onUpArrow: _sinon2.default.spy()
      }, {
        handleKeyCommand: _sinon2.default.spy(),
        onUpArrow: _sinon2.default.spy()
      }];
      var result = (0, _enzyme.shallow)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        plugins: plugins
      }));

      var draftEditor = result.node;
      draftEditor.props.handleKeyCommand('command');
      (0, _chai.expect)(plugins[0].handleKeyCommand).has.been.calledOnce();
      (0, _chai.expect)(plugins[1].handleKeyCommand).has.been.calledOnce();
      (0, _chai.expect)(plugins[2].handleKeyCommand).has.been.calledOnce();

      draftEditor.props.onUpArrow();
      (0, _chai.expect)(plugins[0].onUpArrow).has.been.calledOnce();
      (0, _chai.expect)(plugins[1].onUpArrow).has.been.calledOnce();
      (0, _chai.expect)(plugins[2].onUpArrow).has.been.calledOnce();
    });

    it('calls the fn-hooks of the plugin', function () {
      var plugins = [{
        blockRendererFn: _sinon2.default.spy(),
        keyBindingFn: _sinon2.default.spy()
      }];
      var result = (0, _enzyme.shallow)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        plugins: plugins
      }));

      var pluginEditor = result.instance();
      var draftEditor = result.node;
      var plugin = plugins[0];
      var expectedSecondArgument = {
        getEditorState: pluginEditor.getEditorState,
        setEditorState: pluginEditor.onChange
      };
      draftEditor.props.blockRendererFn('command');
      (0, _chai.expect)(plugin.blockRendererFn).has.been.calledOnce();
      (0, _chai.expect)(plugin.blockRendererFn).has.been.calledWith('command', expectedSecondArgument);
      draftEditor.props.keyBindingFn('command');
      (0, _chai.expect)(plugin.keyBindingFn).has.been.calledOnce();
      (0, _chai.expect)(plugin.keyBindingFn).has.been.calledWith('command', expectedSecondArgument);
    });

    it('combines the customStyleMaps from all plugins', function () {
      var plugins = [{
        customStyleMap: {
          orange: {
            color: 'rgba(255, 127, 0, 1.0)'
          }
        }
      }, {
        customStyleMap: {
          yellow: {
            color: 'rgba(180, 180, 0, 1.0)'
          }
        }
      }];
      var result = (0, _enzyme.mount)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        plugins: plugins
      }));
      var expected = {
        orange: {
          color: 'rgba(255, 127, 0, 1.0)'
        },
        yellow: {
          color: 'rgba(180, 180, 0, 1.0)'
        }
      };
      var pluginEditor = result.instance();
      (0, _chai.expect)(pluginEditor.resolveCustomStyleMap()).to.deep.equal(expected);
    });

    it('combines customStyleMap props from plugins and the editor', function () {
      var plugins = [{
        customStyleMap: {
          orange: {
            color: 'rgba(255, 127, 0, 1.0)'
          }
        }
      }, {
        customStyleMap: {
          yellow: {
            color: 'rgba(180, 180, 0, 1.0)'
          }
        }
      }];

      var customStyleMap = {
        blue: {
          color: 'blue'
        }
      };

      var result = (0, _enzyme.mount)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        customStyleMap: customStyleMap,
        onChange: onChange,
        plugins: plugins
      }));

      var expected = {
        orange: {
          color: 'rgba(255, 127, 0, 1.0)'
        },
        yellow: {
          color: 'rgba(180, 180, 0, 1.0)'
        },
        blue: {
          color: 'blue'
        }
      };
      var pluginEditor = result.instance();
      (0, _chai.expect)(pluginEditor.resolveCustomStyleMap()).to.deep.equal(expected);
    });
  });

  describe('passed proxy to DraftEditor', function () {
    var draftEditor = void 0;
    var pluginEditor = void 0;

    beforeEach(function () {
      var onChange = _sinon2.default.spy();
      var editorState = _draftJs.EditorState.createEmpty();
      var result = (0, _enzyme.mount)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        plugins: []
      }));
      draftEditor = result.node;
      pluginEditor = result.instance();
    });

    it('focus', function () {
      draftEditor.focus = _sinon2.default.spy();
      pluginEditor.focus();
      (0, _chai.expect)(draftEditor.focus).has.been.calledOnce();
    });

    it('blur', function () {
      draftEditor.blur = _sinon2.default.spy();
      pluginEditor.blur();
      (0, _chai.expect)(draftEditor.blur).has.been.calledOnce();
    });
  });

  describe('custom prop comes before plugin hook', function () {
    var onChange = _sinon2.default.spy();
    var editorState = void 0;
    var customHook = void 0;

    beforeEach(function () {
      editorState = _draftJs.EditorState.createEmpty();
      customHook = _sinon2.default.spy();
    });

    it('onUpArrow', function () {
      var plugin = {
        onUpArrow: _sinon2.default.spy()
      };
      var result = (0, _enzyme.mount)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        plugins: [plugin],
        onUpArrow: customHook
      }));
      var draftEditor = result.node;
      draftEditor.props.onUpArrow();
      (0, _chai.expect)(plugin.onUpArrow).has.not.been.called();
      (0, _chai.expect)(customHook).has.been.calledOnce();
    });

    it('renders block component using blockRenderFn prop', function () {
      var plugin = {
        blockRendererFn: _sinon2.default.spy()
      };
      var result = (0, _enzyme.mount)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        plugins: [plugin],
        blockRendererFn: customHook
      }));
      var draftEditor = result.node;
      draftEditor.props.blockRendererFn();
      (0, _chai.expect)(plugin.blockRendererFn).has.been.called();
      (0, _chai.expect)(customHook).has.been.called();
    });

    it('renders block component using blockRenderFn prop and decorators', function () {
      var decorator = function decorator(Comp) {
        return function (props) {
          return _react2.default.createElement(
            'div',
            { className: 'decorator' },
            _react2.default.createElement(Comp, props)
          );
        };
      };
      var component = function component() {
        return null;
      };

      var plugin = {
        blockRendererFn: function blockRendererFn() {
          return {
            decorators: [decorator],
            props: { pluginProp: true }
          };
        }
      };

      customHook = function customHook() {
        return {
          component: component,
          props: { editorProp: true }
        };
      };

      var wrapper = (0, _enzyme.mount)(_react2.default.createElement(_index2.default, {
        editorState: editorState,
        onChange: onChange,
        plugins: [plugin],
        blockRendererFn: customHook
      }));

      var decorators = wrapper.findWhere(function (n) {
        return n.hasClass('decorator');
      });
      (0, _chai.expect)(decorators.length).to.equal(1);
      (0, _chai.expect)(wrapper.find(component).length).to.equal(1);
    });
  });

  describe('decorators prop', function () {
    var text = void 0;
    var decorator = void 0;
    var plugin = void 0;
    var plugins = void 0;
    var decorators = void 0;

    before(function () {
      text = "Hello there how's it going fella";

      decorator = {
        strategy: function strategy(block, cb) {
          return cb(1, 3);
        },
        component: function component() {
          return _react2.default.createElement('span', { className: 'decorator' });
        }
      };

      plugin = {
        decorators: [{
          strategy: function strategy(block, cb) {
            return cb(4, 7);
          },
          component: function component() {
            return _react2.default.createElement('span', { className: 'plugin' });
          }
        }]
      };

      plugins = [plugin];
      decorators = [decorator];
    });

    it('uses strategies from both decorators and plugins together', function () {
      var pluginStrategy = _sinon2.default.spy(plugin.decorators[0], 'strategy');
      var decoratorStrategy = _sinon2.default.spy(decorator, 'strategy');

      (0, _enzyme.mount)(_react2.default.createElement(TestEditor, { plugins: plugins, decorators: decorators, text: text }));

      (0, _chai.expect)(decoratorStrategy).has.been.called();
      (0, _chai.expect)(pluginStrategy).has.been.called();
    });

    it('uses components from both decorators and plugins together', function () {
      var pluginComponent = _sinon2.default.spy(plugin.decorators[0], 'component');
      var decoratorComponent = _sinon2.default.spy(decorator, 'component');

      var wrapper = (0, _enzyme.mount)(_react2.default.createElement(TestEditor, { plugins: plugins, decorators: decorators, text: text }));
      var decoratorComponents = wrapper.findWhere(function (n) {
        return n.hasClass('decorator');
      });
      var pluginComponents = wrapper.findWhere(function (n) {
        return n.hasClass('plugin');
      });

      (0, _chai.expect)(decoratorComponent).has.been.called();
      (0, _chai.expect)(pluginComponent).has.been.called();
      (0, _chai.expect)(decoratorComponents.length).to.equal(1);
      (0, _chai.expect)(pluginComponents.length).to.equal(1);
    });
  });
});