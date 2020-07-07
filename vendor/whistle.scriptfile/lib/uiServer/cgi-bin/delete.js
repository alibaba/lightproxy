
module.exports = function () {
  const { name } = this.request.body;
  if (name && typeof name === 'string') {
    this.storage.removeFile(name);
    this.scripts.remove(name);
  }
  this.body = { ec: 0 };
};
