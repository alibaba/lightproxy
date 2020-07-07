
module.exports = function () {
  this.body = this.getLogs(this.request.query.id);
};
