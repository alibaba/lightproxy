const WebSocket = require('./WebSocket');
const WebSocketServer = require('./WebSocketServer');
const co = require('co');
const urlParse = require('url').parse;
const util = require('./util');
const agent = require('./agent');
const scripts = require('./scripts');
const pkg = require('../package');

const {
  resHeaders,
  resRawHeaders,
  getDataSource,
} = util;
/* eslint-disable no-empty */
const wrap = (ws) => {
  const { send } = ws;
  ws.send = function (...args) {
    try {
      return send.apply(this, args);
    } catch (err) {}
  };
  ws.pipe = (dest) => {
    ws.on('message', data => dest.send(data));
    return dest;
  };
  return ws;
};
const setHost = (fullUrl, opts) => {
  let { host } = opts;
  if (host || opts.port > 0) {
    const urlOpts = urlParse(fullUrl);
    host = host || urlOpts.hostname;
    const port = opts.port || urlOpts.port;
    if (port) {
      host = `${host}:${port}`;
    }
    fullUrl = fullUrl.replace(/\/\/[^/]+/, `//${host}`);
  }
  return fullUrl.replace(/^ws/, 'http');
};

const autoClose = (req, res) => {
  if (req.autoClose === false) {
    return;
  }
  const closeAll = () => {
    setTimeout(() => {
      req.close();
      res.close();
    }, 1000);
  };
  req.on('error', closeAll);
  req.on('close', closeAll);
  res.on('error', closeAll);
  res.on('close', closeAll);
};

module.exports = (server, options) => {
  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws, req) => {
    const origReq = req;
    const { url, headers, response } = req;
    const { send } = req;
    const { dataSource, clearup } = getDataSource();
    req.send = (...args) => {
      response();
      send.apply(req, args);
    };
    ws = wrap(ws);
    ws.req = req;
    ws.dataSource = dataSource;
    ws.url = url;
    ws.headers = headers;
    ws.fullUrl = decodeURIComponent(headers[options.FULL_URL_HEADER]);
    ws.options = options;
    let handleRequest;
    const { handleWebsocket, handleWebSocket } = scripts.getHandler(ws);
    if (util.isFunction(handleWebSocket)) {
      handleRequest = handleWebSocket;
    } else if (util.isFunction(handleWebsocket)) {
      handleRequest = handleWebsocket;
    }
    let res;
    ws.on('error', clearup);
    ws.on('close', clearup);
    ws.on('error', response);
    let reqPromise;
    const connect = (opts) => {
      if (!reqPromise) {
        opts = util.parseOptions(opts);
        reqPromise = new Promise((resolve, reject) => {
          delete headers['sec-websocket-key'];
          let wsAgent;
          if (opts.proxyUrl) {
            const isHttps = /^wss:/.test(ws.fullUrl);
            opts.headers = {
              'proxy-connection': 'keep-alive',
              'user-agent': headers['user-agent'] || `whistle.script/${pkg.version}`,
            };
            wsAgent = isHttps ? agent.getHttpsAgent(opts) : agent.getHttpAgent(opts);
          }
          const protocols = [headers['sec-websocket-protocol'] || ''];
          res = new WebSocket(setHost(ws.fullUrl, opts), protocols, {
            headers: util.clearWhistleHeaders(headers, options),
            rejectUnauthorized: false,
            agent: wsAgent,
          });
          res.headers = {};
          res.on('headers', (h, r) => {
            res.headers = h;
            origReq[resHeaders] = h;
            const { rawHeaders } = r || {};
            origReq[resRawHeaders] = {};
            if (Array.isArray(rawHeaders)) {
              for (let i = 0; i < rawHeaders.length; i += 2) {
                const name = rawHeaders[i];
                if (typeof name === 'string') {
                  origReq[resRawHeaders][name.toLowerCase()] = name;
                }
              }
            }
          });
          wrap(res);
          res.on('error', reject);
          res.on('error', response);
          res.on('open', () => {
            response();
            autoClose(ws, res);
            resolve(res);
          });
        });
      }
      return reqPromise;
    };
    co(function* () {
      if (handleRequest) {
        try {
          yield handleRequest(ws, connect);
          response();
        } catch (err) {
          ws.emit('error', err);
        }
      } else {
        try {
          yield connect();
          response();
          ws.pipe(res).pipe(ws);
        } catch (err) {
          ws.emit('error', err);
        }
      }
    });
  });
};
