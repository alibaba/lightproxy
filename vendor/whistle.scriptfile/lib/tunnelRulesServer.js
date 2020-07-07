const Koa = require('koa');
const co = require('co');
const util = require('./util');
const scripts = require('./scripts');

module.exports = (server, options) => {
  const app = new Koa();
  app.use(function* () {
    util.setupContext(this, options);
    const { handleTunnelRules } = scripts.getHandler(this);
    if (util.isFunction(handleTunnelRules)) {
      yield co.wrap(handleTunnelRules)(this);
      util.responseRules(this);
    }
  });
  server.on('request', app.callback());
};
