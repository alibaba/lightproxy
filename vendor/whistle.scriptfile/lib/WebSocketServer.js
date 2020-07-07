const { Server } = require('ws');
const { resHeaders, resRawHeaders } = require('./util');

const getHeadersRaw = (headers) => {
  const result = [];
  if (headers) {
    delete headers['content-length'];
    delete headers['transfer-encoding'];
    delete headers['content-encoding'];
    Object.keys(headers).forEach((name) => {
      const value = headers[name];
      if (!Array.isArray(value)) {
        result.push(`${name}: ${value}`);
        return;
      }
      value.forEach((val) => {
        result.push(`${name}: ${val}`);
      });
    });
  }
  return result.join('\r\n') || 'Content-Type: text/plain';
};
const RESERVE_HEADERS = {
  upgrade: 1,
  connection: 1,
  'sec-websocket-accept': 1,
  'sec-websocket-protocol': 1,
  'sec-websocket-extensions': 1,
};

class WebSocketServer extends Server {
  completeUpgrade(protocol, version, req, socket, head, cb) {
    const { write } = socket;
    let cache = [];
    req.response = (err) => {
      if (!cache) {
        return;
      }
      if (err) {
        const status = err.statusCode || 502;
        const msg = err.statusMessage || 'Bad Gateway';
        const headers = getHeadersRaw(err.headers);
        const body = String(err.stack || '');
        const length = Buffer.byteLength(body);
        cache[0] = [`HTTP/1.1 ${status} ${msg}\r\n${headers}\r\nContent-length: ${length}\r\n\r\n${body}`];
      } else if (req[resHeaders] && typeof cache[0][0] === 'string') {
        const headers = cache[0][0].trim().split('\r\n');
        Object.keys(req[resHeaders]).forEach((name) => {
          if (!RESERVE_HEADERS[name]) {
            const value = req[resHeaders][name];
            name = req[resRawHeaders][name] || name;
            if (Array.isArray(value)) {
              value.forEach((val) => {
                headers.push(`${name}: ${val}`);
              });
            } else {
              headers.push(`${name}: ${value}`);
            }
          }
        });
        cache[0] = [headers.concat('', '').join('\r\n')];
      }
      cache.forEach(args => write.apply(socket, args));
      cache = null;
    };
    socket.write = (...args) => {
      if (cache) {
        cache.push(args);
        return;
      }
      write.apply(socket, args);
    };
    super.completeUpgrade(protocol, version, req, socket, head, cb);
  }
}

module.exports = WebSocketServer;
