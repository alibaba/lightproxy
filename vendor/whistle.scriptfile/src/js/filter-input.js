require('./base-css.js');
require('../css/filter-input.css');
var $ = require('jquery');
var util = require('./util');
var React = require('react');

var FilterInput = React.createClass({
	getInitialState: function() {
		return {};
	},
	onFilterChange: function(e) {
		var value = e.target.value;
		this.props.onChange && this.props.onChange(value);
		this.setState({filterText: value});
	},
	onFilterKeyDown: function(e) {
		if ((e.ctrlKey || e.metaKey) && e.keyCode == 68) {
			this.clearFilterText();
			e.preventDefault();
			e.stopPropagation();
		}
	},
	clearFilterText: function() {
		this.props.onChange && this.props.onChange('');
		this.setState({filterText: ''});
	},
	render: function() {
		
		return (
				<div className="w-filter-con">
					<input type="text" value={this.state.filterText} 
					onChange={this.onFilterChange} 
					onKeyDown={this.onFilterKeyDown}
					className="w-filter-input" maxLength="128" placeholder="type filter text" />
					<button onMouseDown={util.preventBlur}
					onClick={this.clearFilterText}
					style={{display: this.state.filterText ? 'block' :  'none'}} type="button" className="close" title="Ctrl[Command]+D"><span aria-hidden="true">&times;</span></button>
				</div>
		);
	}
});

module.exports = FilterInput;