const Socket = require('ws');
const http = require('http');
const https = require('https');

const handleUnexpectedResponse = function (req, res) {
  const msg = `unexpected server response (${res.statusCode})`;
  const err = new Error(msg);
  err.statusCode = res.statusCode || 502;
  err.statusMessage = res.statusMessage || msg;
  err.headers = res.headers || {};
  this.emit('error', err);
  return true;
};

class WebSocket extends Socket {
  constructor(...args) {
    const httpGet = http.get;
    const httpsGet = https.get;
    let headers;
    const getHeaders = opts => opts && opts.headers;
    http.get = function (...opts) {
      headers = getHeaders(opts[0]);
      return httpGet.apply(this, opts);
    };
    https.get = function (...opts) {
      headers = getHeaders(opts[0]);
      return httpsGet.apply(this, opts);
    };
    super(...args);
    http.get = httpGet;
    https.get = httpsGet;
    this.reqHeaders = headers || {};
    this.on('unexpected-response', handleUnexpectedResponse);
  }
}

module.exports = WebSocket;
