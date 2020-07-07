/* eslint-disable no-empty */
module.exports = function () {
  let { type, args } = this.request.body;
  if (args && type && typeof type === 'string') {
    try {
      args = JSON.parse(args);
      if (Array.isArray(args)) {
        const { dataSource } = this;
        dataSource.emit('data', type, args);
      }
    } catch (e) {}
  }
  this.body = { ec: 0 };
};
