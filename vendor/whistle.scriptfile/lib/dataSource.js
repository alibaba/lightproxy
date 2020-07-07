const { EventEmitter } = require('events');

const dataSource = new EventEmitter();
dataSource.setMaxListeners(1000);

module.exports = dataSource;
