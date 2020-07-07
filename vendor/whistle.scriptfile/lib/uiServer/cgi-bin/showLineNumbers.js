
module.exports = function () {
  const { showLineNumbers } = this.request.body;
  this.storage.setProperty('showLineNumbers', showLineNumbers === '1');
  this.body = { ec: 0 };
};
