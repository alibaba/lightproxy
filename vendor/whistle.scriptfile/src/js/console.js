require('../css/console.css');
var React = require('react');
var ReactDOM = require('react-dom');
var util = require('./util');
var FilterInput = require('./filter-input');
var dataCenter = require('./data-center');

var LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
var MAX_COUNT = 360;

module.exports = React.createClass({
  getInitialState: function() {
    this.autoScroll = true;
    return { list: [] };
  },
  addLogs: function(list) {
    if (!list || !list.length) {
      return;
    }
    var self = this;
    var atBottom = self.autoScroll;
    list = self.state.list.concat(list);
    var overCount = list.length - MAX_COUNT;
    if (overCount > 0) {
      if (!atBottom) {
        return;
      }
      list = list.slice(overCount);
    }
    if (self.props.hide) {
      self.state.list = list;
      var onUpdate = this.props.onUpdate;
      if (typeof onUpdate === 'function') {
        onUpdate();
      }
      return;
    }
    self.setState({ list: list }, function() {
      if (atBottom) {
        self.autoRefresh();
      }
    });
  },
  onScroll: function() {
    var con = this.console;
    this.autoScroll = con.scrollHeight < con.offsetHeight + con.scrollTop + 10;
  },
  componentDidMount: function() {
    var self = this;
    var con = ReactDOM.findDOMNode(this.refs.console);
    this.console = con;
    (function loadLogs() {
      if (self.state.list.length > MAX_COUNT) {
        return setTimeout(loadLogs, 1000);
      }
      dataCenter.getLogs({ id: self.lastId }, function(list) {
        self.addLogs(list);
        var log = self.state.list[self.state.list.length - 1];
        self.lastId = log && log.id;
        setTimeout(loadLogs, 1000);
      });
    })();
  },
  shouldComponentUpdate: function(nextProps) {
		var hide = util.getBoolean(this.props.hide);
		return hide != util.getBoolean(nextProps.hide) || !hide;
	},
  autoRefresh: function() {
    var con = this.console;
    con.scrollTop = con.scrollHeight;
    this.autoScroll = true;
  },
  componentDidUpdate: function() {
    if (this.autoScroll) {
      this.autoRefresh();
    }
  },
  clear: function() {
    this.setState({ list: [] });
  },
  onFilterChange: function(filterText) {
    this.setState({
      filterText: filterText.trim()
    });
  },
  render: function() {
    var hide =  this.props.hide ? ' hide' : '';
    var list = this.state.list;
    var filterText = this.state.filterText;
    if (list.length) {
      if (filterText) {
        list.forEach(function(log) {
          log.hide = log.msg.indexOf(filterText) === -1;
        });
      } else {
        list.forEach(function(log) {
          log.hide = false;
        });
      }
    }
    return (
      <div className={'fill orient-vertical-box' + hide}>
        <div ref="console" className="fill w-console-con" onScroll={this.onScroll}>
          <ul className="w-log-list">
            {list.map(function(log) {
              var hide = log.hide ? ' hide' : '';
              return <li key={log.id} className={'w-' + log.level + hide}><pre>{log.msg}</pre></li>;
            })}
          </ul>
        </div>
        <FilterInput onChange={this.onFilterChange} />
      </div>
    );
  }
});
