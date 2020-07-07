const init = require('./cgi-bin/init');
const log = require('./cgi-bin/log');
const create = require('./cgi-bin/create');
const rename = require('./cgi-bin/rename');
const del = require('./cgi-bin/delete');
const active = require('./cgi-bin/active');
const emitData = require('./cgi-bin/emitData');
const setTheme = require('./cgi-bin/setTheme');
const setFontSize = require('./cgi-bin/setFontSize');
const showLineNumbers = require('./cgi-bin/showLineNumbers');

module.exports = (router) => {
  router.get('/cgi-bin/init', init);
  router.get('/cgi-bin/log', log);
  router.post('/cgi-bin/create', create);
  router.post('/cgi-bin/rename', rename);
  router.post('/cgi-bin/delete', del);
  router.post('/cgi-bin/emitData', emitData);
  router.post('/cgi-bin/active', active);
  router.post('/cgi-bin/setTheme', setTheme);
  router.post('/cgi-bin/setFontSize', setFontSize);
  router.post('/cgi-bin/showLineNumbers', showLineNumbers);
};
