const chii = require('chii');

module.exports = function (server, options) {
  chii.start({
    server,
    domain: '127.0.0.1:' + options.config.port + '/whistle.chii-internal',
  });
};
