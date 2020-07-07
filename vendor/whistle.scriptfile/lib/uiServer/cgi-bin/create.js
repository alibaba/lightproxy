
module.exports = function () {
  const { name, value } = this.request.body;
  if (name && typeof name === 'string') {
    this.storage.writeFile(name, value);
    this.scripts.set(name, value);
  }
  this.body = { ec: 0 };
};
