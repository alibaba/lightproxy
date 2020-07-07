require('./base-css.js');
require('../css/menu-item.css');
var React = require('react');
var util = require('./util');

var MenuItem = React.createClass({
	preventBlur: function(e) {
		e.preventDefault();
	},
	render: function() {
		var options = this.props.options;
		if (options && !options.length) {
			options = null;
		}
		var name = this.props.name;
		var onClick = this.props.onClick || util.noop;
		var onClickOption = this.props.onClickOption || util.noop;
		var onDoubleClickOption = this.props.onDoubleClickOption || util.noop;
		return (
			<div onBlur={this.props.onBlur} tabIndex="0" onMouseDown={this.preventBlur} style={{display: util.getBoolean(this.props.hide) ? 'none' : 'block'}} className={'w-menu-item ' + (this.props.className || '')}>
			{
					options ? <div className="w-menu-options" style={name ? '' : {border: 'none'}}>{options.map(function(option) {
						
						return (
								<a key={option.name} onClick={function() {
									onClickOption(option);
								}}  onDoubleClick={function() {
									onDoubleClickOption(option);
								}} href={option.url ? option.url : 'javascript:;'} target="_blank">
									<span className={'glyphicon glyphicon-' + (option.icon || 'asterisk')} style={{visibility: option.icon ? '' : 'hidden'}}></span>
									{option.name}
								</a>
						);
					})}</div> : ''
			}
			{
				name ? <a onClick={onClick} className="w-menu-open" href="javascript:;"><span className="glyphicon glyphicon-folder-open"></span>{name}</a> : ''
			}
			</div>
		);
	}
});

module.exports = MenuItem;
