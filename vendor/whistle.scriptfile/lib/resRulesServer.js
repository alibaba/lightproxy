const Koa = require('koa');
const co = require('co');
const util = require('./util');
const scripts = require('./scripts');

module.exports = (server, options) => {
  const app = new Koa();
  app.use(function* () {
    util.setupContext(this, options);
    const { handleResponseRules } = scripts.getHandler(this);
    if (util.isFunction(handleResponseRules)) {
      yield co.wrap(handleResponseRules)(this);
      util.responseRules(this);
    }
  });
  server.on('request', app.callback());
};
