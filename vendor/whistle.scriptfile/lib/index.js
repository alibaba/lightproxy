const logger = require('./logger');

const LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];

/* eslint-disable no-console */
console.log = (...args) => {
  logger.log(args, 'log');
};

LEVELS.forEach((level) => {
  console[level] = (...args) => {
    logger.log(args, level);
  };
});
/* eslint-enable no-console */
exports.uiServer = require('./uiServer');
exports.rulesServer = require('./rulesServer');
exports.resRulesServer = require('./resRulesServer');
exports.tunnelRulesServer = require('./tunnelRulesServer');
exports.server = require('./server');
exports.tunnelServer = require('./tunnelServer');
