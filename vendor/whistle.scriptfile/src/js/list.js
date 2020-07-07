require('./base-css.js');
require('../css/list.css');
var $ = require('jquery');
var util = require('./util');
var React = require('react');
var ReactDOM = require('react-dom');
var Divider = require('./divider');
var Editor = require('./editor');
var FilterInput = require('./filter-input');

var List = React.createClass({
	componentDidMount: function() {
		var self = this;
		var visible = !self.props.hide;
		$(window).keydown(function(e) {
			if (visible && (e.ctrlKey || e.metaKey) && e.keyCode == 83) {
				var modal = self.props.modal;
				modal.getChangedList().forEach(trigger);
				return false;
			}
		});
		
		function trigger(item) {
			self.onDoubleClick(item);
		}
		var modal = self.props.modal;
		var listCon = $(ReactDOM.findDOMNode(self.refs.list)).focus().on('keydown', function(e) {
			var item;
			if (e.keyCode == 38) { //up
				item = modal.prev();
			} else if (e.keyCode == 40) {//down
				item = modal.next();
			}
			
			if (item) {
				self.onClick(item);
				e.preventDefault();
			}
		});
		this.ensureVisible();
	},
	shouldComponentUpdate: function(nextProps) {
		var hide = util.getBoolean(this.props.hide);
		return hide != util.getBoolean(nextProps.hide) || !hide;
	},
	componentDidUpdate: function() {
		this.ensureVisible();
	},
	ensureVisible: function() {
		var activeItem = this.props.modal.getActive();
		if (activeItem) {
			util.ensureVisible(ReactDOM.findDOMNode(this.refs[activeItem.name]), ReactDOM.findDOMNode(this.refs.list));
		}
	},
	onClick: function(item) {
		var self = this;
		if (typeof self.props.onActive != 'function' ||
				self.props.onActive(item) !== false) {
			self.props.modal.setActive(item.name);
			self.setState({activeItem: item});
		}
	},
	onDoubleClick: function(item, okIcon) {
		item.selected && !item.changed || okIcon ? this.onUnselect(item) : this.onSelect(item);
	},
	onSelect: function(data) {
		var onSelect = this.props.onSelect;
		typeof  onSelect == 'function' && onSelect(data);
	},
	onUnselect: function(data) {
		var onUnselect = this.props.onUnselect;
		typeof onUnselect == 'function' && onUnselect(data);
	},
	onChange: function(e) {
		var item = this.props.modal.getActive();
		if (!item) {
			return;
		}
		var oldValue = item.value || '';
		var value = e.getValue() || '';
		if (value != oldValue) {
			item.changed = true;
			item.value = value;
			this.setState({
				selectedItem: item
			});
		}
	},
	onFilterChange: function(keyword) {
		this.props.modal.search(keyword, this.props.name != 'rules');
		this.setState({filterText: keyword});
	},
	getItemByKey: function(key) {
		return this.props.modal.getByKey(key);
	},
	render: function() {
		var self = this;
		var modal = self.props.modal;
		var list = modal.list;
		var data = modal.data;
		var activeItem = modal.getActive();
		//不设置height为0，滚动会有问题
		return (
				<Divider hide={this.props.hide} leftWidth="200">
				<div className="fill orient-vertical-box w-list-left">	
					<div ref="list" tabIndex="0" className={'fill orient-vertical-box w-list-data ' + (this.props.className || '')}>
							{
								list.map(function(name) {
									var item = data[name];
									
									return <a ref={name} style={{display: item.hide ? 'none' : null}} key={item.key} data-key={item.key} href="javascript:;"
												onClick={function() {
													self.onClick(item);
												}} 
												onDoubleClick={function() {
													self.onDoubleClick(item);
												}} 
												className={util.getClasses({
													'w-active': item.active,
													'w-changed': item.changed,
													'w-selected': item.selected
												})} 
												href="javascript:;">{name}</a>;
								})
							}
						</div>
						<FilterInput onChange={this.onFilterChange} />
					</div>
					<Editor {...self.props} onChange={self.onChange} readOnly={!activeItem} value={activeItem ? activeItem.value : ''} />
				</Divider>
		);
	}
});

module.exports = List;
