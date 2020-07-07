require('./base-css.js');
require('../css/menu.css');
require('../css/index.css');
var $ = window.jQuery = require('jquery'); //for bootstrap
require('bootstrap/dist/js/bootstrap.js');
var React = require('react');
var ReactDOM = require('react-dom');
var List = require('./list');
var Console = require('./console');
var ListModal = require('./list-modal');
var MenuItem = require('./menu-item');
var EditorSettings = require('./editor-settings');
var util = require('./util');
var dataCenter = require('./data-center');

var slice = [].slice;
var dataSource = {};
var emit = function() {
  var args = slice.apply(arguments);
  var type = args.shift();
  if (!type || typeof type !== 'string' || !args.length) {
    return;
  }
  dataCenter.emitData({
    type: type,
    args: JSON.stringify(args)
  }, function(data) {
    if (!data || data.ec !== 0) {
      return console.error('Error: Please try again.');
    }
  });
};
var setupDataSource = function() {
  dataSource.emit = emit;
  window.dataSource = dataSource;
};
setupDataSource();
setInterval(setupDataSource, 3000);

var Index = React.createClass({
  getInitialState: function() {
    var data = this.props.data;
    var modal = {
      list: [],
      data: {},
    };
    var hasActive;
    data.list.forEach(function(item) {
      modal.list.push(item.name);
      var active = item.name == data.activeName;
      if (active) {
        hasActive = true;
      }
      modal.data[item.name] = {
          name: item.name,
          value: item.value,
          active: active
      };
    });

    if (!hasActive && (item = data.list[0])) {
      modal.data[item.name].active = true;
    }

    return {
      modal: new ListModal(modal.list, modal.data),
      theme: data.theme,
      fontSize: data.fontSize,
      showLineNumbers: data.showLineNumbers
    };
  },
  active: function(options) {
    dataCenter.setActive({name: options.name});
    this.setState({});
  },
  checkName: function(name) {
    if (!name) {
      alert('The name can not be empty.');
      return false;
    }
    if (!/^[\w\-.]+$/.test(name)) {
      alert('The name may only contain characters: A-Za-z0-9.-');
      return false;
    }
    var modal = this.state.modal;
    if (modal.exists(name)) {
      alert('`' + name + '` is already exist.');
      return false;
    }
    return true;
  },
  create: function(e) {
    var self = this;
    if (!self.isSubmit(e)) {
      return;
    }
    var input = ReactDOM.findDOMNode(self.refs.createInput);
    var name = input.value.trim();
    if (!self.checkName(name)) {
      return;
    }
    var modal = self.state.modal;
    input.blur();
    var params = { name: name };
    dataCenter.create(params, function(data) {
      if (!data || data.ec !== 0) {
        return util.showSystemError();
      }
      modal.add(name);
      modal.setActive(name, true);
      self.active(params);
      input.value = '';
      self.setState({});
    });
  },
  setValue: function(item) {
    var self = this;
    if (!item.changed) {
      self.showEditDialog();
      return;
    }
    var modal = self.state.modal;
    dataCenter.setValue(item, function(data) {
      if (!data || data.ec !== 0) {
        util.showSystemError();
        return;
      }

      modal.setChanged(item.name, false);
      self.setState({});
    });
  },
  save: function() {
    this.state.modal
        .getChangedList()
          .forEach(this.setValue);
  },
  showEditDialog: function() {
    var activeItem = this.state.modal.getActive();
  },
  rename: function(e) {
    if (!this.isSubmit(e)) {
      return;
    }
    var input = ReactDOM.findDOMNode(this.refs.renameInput);
    var name = input.value.trim();
    if (!this.checkName(name)) {
      return;
    }
    var modal = this.state.modal;
    var activeItem = modal.getActive();
    input.blur();
    var self = this;
    dataCenter.rename({
      name: activeItem.name,
      newName: name,
    }, function(data) {
      if (!data || data.ec !== 0) {
        util.showSystemError();
        return;
      }
      input.value = '';
      modal.rename(activeItem.name, name);
      self.active(activeItem);
      self.setState({});
    });
  },
  isSubmit: function(e) {
    return e.type != 'keydown' || e.keyCode == 13;
  },
  convertName: function(name) {
    if (!name) {
      return '';
    }

    return name.trim().replace(/[^\w.\-]+/g, '').substring(0, 64);
  },
  showScriptSettings: function() {
    $(ReactDOM.findDOMNode(this.refs.scriptSettingsDialog)).modal('show');
  },
  clearConsole: function() {
    var console = this.refs.console;
    if (console) {
      console.clear();
    }
  },
  autoRefreshConsole: function() {
    var console = this.refs.console;
    if (console) {
      console.autoRefresh();
    }
  },
  remove: function() {
    var self = this;
    var modal = self.state.modal;
    var activeItem = modal.getActive();
    if (!activeItem || !confirm('Confirm delete `' + activeItem.name + '`?')) {
      return;
    }

    var next = modal.getSibling(activeItem.name);
    dataCenter.remove({ name: activeItem.name }, function(data) {
      if (!data || data.ec !== 0) {
        util.showSystemError();
        return;
      }
      modal.remove(activeItem.name);
      if (next) {
        modal.setActive(next.name, true);
        self.active(next);
      }
      self.setState({});
    });
  },
  onThemeChange: function(e) {
    var theme = e.target.value;
    dataCenter.setTheme({theme: theme});
    this.setState({
      theme: theme
    });
  },
  onFontSizeChange: function(e) {
    var fontSize = e.target.value;
    dataCenter.setFontSize({fontSize: fontSize});
    this.setState({
      fontSize: fontSize
    });
  },
  onLineNumberChange: function(e) {
    var showLineNumbers = e.target.checked;
    dataCenter.showLineNumbers({showLineNumbers: showLineNumbers ? 1 : 0});
    this.setState({
      showLineNumbers: showLineNumbers
    });
  },
  showCreateInput: function() {
    var input = ReactDOM.findDOMNode(this.refs.createInput);
    this.setState({ showCreateInput: true, showRenameInput: false },
    function() {
      input.select();
      input.focus();
    });
  },
  hideCreateInput: function() {
    this.setState({ showCreateInput: false });
  },
  showRenameInput: function() {
    var activeItem = this.state.modal.getActive();
    if (!activeItem) {
      return;
    }
    var input = ReactDOM.findDOMNode(this.refs.renameInput);
    input.value = activeItem.name;
    this.setState({ showCreateInput: false, showRenameInput: true },
    function() {
      input.select();
      input.focus();
    });
  },
  hideRenameInput: function() {
    this.setState({ showRenameInput: false });
  },
  preventBlur: function(e) {
    e.target.nodeName != 'INPUT' && e.preventDefault();
  },
  changeTab: function(e) {
    var name = $(e.target).closest('a').attr('data-tab-name');
    var state = { activeTabName: name };
    if (name === 'console') {
      state.hasNewLogs = false;
    }
    this.setState(state);
  },
  showHasNewLogs: function() {
    this.setState({ hasNewLogs: true });
  },
  render: function() {
    var state = this.state;
    var theme = state.theme || 'cobalt';
    var fontSize = state.fontSize || '14px';
    var showLineNumbers = state.showLineNumbers || false;
    var activeItem = this.state.modal.getActive();
    var isConsole = state.activeTabName === 'console';

    return (<div className="container orient-vertical-box">
          <div className="w-menu">
            <a onClick={this.changeTab} className={ 'w-script-menu' + (isConsole ? '' : ' active') } data-tab-name="script" href="javascript:;"><span className="glyphicon glyphicon-file"></span>Script</a>
            <a onClick={this.changeTab} onDoubleClick={this.clearConsole} className={ 'w-console-menu' + (isConsole ?' active' : '') } data-tab-name="console" href="javascript:;">
              <span className="glyphicon glyphicon-console"></span>Console
              <i className={'w-has-new-logs' + (state.hasNewLogs ? '' : ' hide')}></i>
            </a>
            <a onClick={this.showCreateInput} style={{display: isConsole ? 'none' : ''}} className="w-create-menu" href="javascript:;"><span className="glyphicon glyphicon-plus"></span>Create</a>
            <a onClick={this.showRenameInput} style={{display: isConsole ? 'none' : ''}} className="w-edit-menu" href="javascript:;"><span className="glyphicon glyphicon-edit"></span>Rename</a>
            <a onClick={this.remove} style={{display: isConsole ? 'none' : ''}} className="w-remove-menu" href="javascript:;"><span className="glyphicon glyphicon-trash"></span>Delete</a>
            <a onClick={this.save} style={{display: isConsole ? 'none' : ''}} className="w-save-menu" href="javascript:;"><span className="glyphicon glyphicon-save-file"></span>Save</a>
            <a onClick={this.showScriptSettings} style={{display: isConsole ? 'none' : ''}} className="w-settings-menu" href="javascript:;"><span className="glyphicon glyphicon-cog"></span>Settings</a>
            <a onClick={this.autoRefreshConsole} style={{display: isConsole ? '' : 'none'}} className="w-clear-console-menu" href="javascript:;"><span className="glyphicon glyphicon-play"></span>AutoRefresh</a>
            <a onClick={this.clearConsole} style={{display: isConsole ? '' : 'none'}} className="w-auto-refresh-menu" href="javascript:;"><span className="glyphicon glyphicon-remove"></span>Clear</a>
            <a className="w-help-menu" href="https://github.com/whistle-plugins/whistle.script" target="_blank"><span className="glyphicon glyphicon-question-sign"></span>Help</a>
            <div onMouseDown={this.preventBlur} style={{display: state.showCreateInput ? 'block' : 'none'}} className="shadow w-input-menu-item w-create-input">
              <input ref="createInput" onKeyDown={this.create} onBlur={this.hideCreateInput} type="text" maxLength="64" placeholder="Input the name" /><button type="button"
              onClick={this.create} className="btn btn-primary">Create</button>
            </div>
            <div onMouseDown={this.preventBlur} style={{display: state.showRenameInput ? 'block' : 'none'}} className="shadow w-input-menu-item w-rename-input">
              <input ref="renameInput" onKeyDown={this.rename} onBlur={this.hideRenameInput} type="text" maxLength="64" placeholder="Input the new name" /><button type="button"
              onClick={this.rename} className="btn btn-primary">Rename</button>
            </div>
          </div>
          <List hide={isConsole} onActive={this.active} theme={theme} fontSize={fontSize} lineNumbers={showLineNumbers} onSelect={this.setValue}  modal={this.state.modal} className="w-data-list" />
          <Console onUpdate={this.showHasNewLogs} ref="console" hide={!isConsole} />
          <div ref="scriptSettingsDialog" className="modal fade w-tpl-settings-dialog">
            <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-body">
                    <EditorSettings theme={theme} fontSize={fontSize} lineNumbers={showLineNumbers}
                      onThemeChange={this.onThemeChange}
                      onFontSizeChange={this.onFontSizeChange}
                      onLineNumberChange={this.onLineNumberChange} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                  </div>
                </div>
            </div>
          </div>
        </div>);
  }
});

(function init() {
  dataCenter.init(function(data) {
    if (!data || !data.list) {
      return setTimeout(init, 1000);
    }
    ReactDOM.render(<Index data={data} />, $('#main')[0]);
  });
})();
