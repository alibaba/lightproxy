const Koa = require('koa');
const co = require('co');
const util = require('./util');
const scripts = require('./scripts');

module.exports = (server, options) => {
  const app = new Koa();
  app.use(function* () {
    util.setupContext(this, options);
    const {
      handleWebSocketRules,
      handleWebsocketRules,
      handleRequestRules,
    } = scripts.getHandler(this);
    let handleReqRules;
    if (/^ws/.test(this.fullUrl)) {
      if (util.isFunction(handleWebSocketRules)) {
        handleReqRules = handleWebSocketRules;
      } else if (util.isFunction(handleWebsocketRules)) {
        handleReqRules = handleWebsocketRules;
      }
    } else if (util.isFunction(handleRequestRules)) {
      handleReqRules = handleRequestRules;
    }
    if (handleReqRules) {
      yield co.wrap(handleReqRules)(this);
      util.responseRules(this);
    }
  });
  server.on('request', app.callback());
};
