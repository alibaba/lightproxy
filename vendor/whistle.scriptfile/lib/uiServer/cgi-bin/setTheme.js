
module.exports = function () {
  const { theme } = this.request.body;
  if (theme && typeof theme === 'string') {
    this.storage.setProperty('theme', theme);
  }
  this.body = { ec: 0 };
};
