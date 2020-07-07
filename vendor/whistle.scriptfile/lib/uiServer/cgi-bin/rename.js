
module.exports = function () {
  const { name, newName } = this.request.body;
  if (name && newName) {
    this.storage.renameFile(name, newName);
    this.scripts.set(newName, this.scripts.get(name));
    this.scripts.remove(name);
  }
  this.body = { ec: 0 };
};
