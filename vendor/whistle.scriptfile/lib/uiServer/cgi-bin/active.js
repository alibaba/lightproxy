
module.exports = function () {
  const { name } = this.request.body;
  if (name && typeof name === 'string') {
    this.storage.setProperty('activeName', name);
  }
  this.body = { ec: 0 };
};
