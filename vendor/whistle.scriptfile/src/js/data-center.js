var $ = require('jquery');
var createCgi = require('./cgi');
var TIMEOUT = 10000;
var DEFAULT_CONF = { timeout: TIMEOUT };
var POST_CONF = $.extend({ type: 'post' }, DEFAULT_CONF);
var GET_CONF = $.extend({ cache: false }, DEFAULT_CONF);

module.exports = $.extend(createCgi({
  init: 'cgi-bin/init',
  getLogs: 'cgi-bin/log',
}, GET_CONF), createCgi({
  setActive: 'cgi-bin/active',
  remove: 'cgi-bin/delete',
  create: 'cgi-bin/create',
  rename: 'cgi-bin/rename',
  emitData: 'cgi-bin/emitData',
  setTheme: 'cgi-bin/setTheme',
  setFontSize: 'cgi-bin/setFontSize',
  showLineNumbers: 'cgi-bin/showLineNumbers',
  setValue: 'cgi-bin/create',
}, POST_CONF));
