const assert = require('assert');
const net = require('net');
const http = require('http');
const urlParse = require('url').parse;
const Agent = require('./agent');

const httpsAgents = {};
const httpAgents = {};
const idleTimeout = 60000;
const freeSocketErrorListener = () => {
  const socket = this;
  socket.destroy();
  socket.emit('agentRemove');
  socket.removeListener('error', freeSocketErrorListener);
};
const preventThrowOutError = (socket) => {
  socket.removeListener('error', freeSocketErrorListener);
  socket.on('error', freeSocketErrorListener);
};

const parseProxy = (options) => {
  if (!options) {
    assert(options, 'argument options is required.');
  }
  let proxyUrl = options;
  if (typeof options !== 'string') {
    assert(options.proxyUrl && typeof options.proxyUrl === 'string', 'String options.proxyUrl is required.');
    proxyUrl = options.proxyUrl;
  }
  options = urlParse(proxyUrl);
  return {
    host: options.hostname,
    port: options.port || 80,
    auth: options.auth,
  };
};

const getCacheKey = (options) => {
  const auth = options.auth || '';
  return [options.type, options.hostname, options.port, auth].join(':');
};
const getAgent = (options, cache, type) => {
  const proxy = parseProxy(options);
  proxy.type = type;
  proxy.headers = options.headers;
  const key = getCacheKey(options);
  let agent = cache[key];
  if (!agent) {
    proxy.proxyAuth = options.auth;
    options = {
      proxy,
      rejectUnauthorized: false,
    };
    agent = Agent[type](options);
    cache[key] = agent;
    agent.on('free', preventThrowOutError);
    const { createSocket } = agent;
    agent.createSocket = function (opts, cb) {
      createSocket.call(this, opts, (socket) => {
        socket.setTimeout(idleTimeout, () => socket.destroy());
        cb(socket);
      });
    };
  }

  return agent;
};

const toBase64 = (buf) => {
  if (buf == null || buf instanceof Buffer) {
    return buf;
  }
  return Buffer.from(`${buf}`).toString('base64');
};

const connect = (options) => {
  if (!options.proxyUrl) {
    return new Promise((resolve, reject) => {
      const socket = net.connect(options, () => resolve(socket));
      socket.on('error', reject);
    });
  }
  let proxyOptions = parseProxy(options);
  proxyOptions = {
    method: 'CONNECT',
    agent: false,
    path: `${options.host}:${options.port}`,
    host: proxyOptions.host,
    port: proxyOptions.port,
    headers: options.headers || {},
  };
  proxyOptions.headers.host = proxyOptions.path;
  if (proxyOptions.auth) {
    proxyOptions.headers['Proxy-Authorization'] = `Basic ${toBase64(options.auth)}`;
  }
  const req = http.request(proxyOptions);
  return new Promise((resolve, reject) => {
    req.on('error', reject);
    req.on('connect', (res, socket) => {
      if (res.statusCode === 200) {
        resolve(socket);
      } else {
        reject(new Error(`Tunneling socket could not be established, statusCode=${res.statusCode}`));
      }
    }).end();
  });
};
/**
 * options:
 *  - host
 *  - port
 *  - proxyUrl
 *  - headers
 */
exports.getHttpsAgent = (options) => {
  return getAgent(options, httpsAgents, 'httpsOverHttp');
};
exports.getHttpAgent = (options) => {
  return getAgent(options, httpAgents, 'httpOverHttp');
};
exports.connect = connect;
