const tls = require('tls');
const http = require('http');
const events = require('events');
const util = require('util');

function TunnelingAgent(options) {
  const self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on('free', (socket, host, port) => {
    for (let i = 0, len = self.requests.length; i < len; ++i) {
      const pending = self.requests[i];
      if (pending.host === host && pending.port === port) {
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}

util.inherits(TunnelingAgent, events.EventEmitter);

TunnelingAgent.prototype.addRequest = function addRequest(req, options, port, path) {
  const self = this;
  if (typeof options === 'string') {
    options = {
      port,
      path,
      host: options,
    };
  }

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push({
      host: options.host,
      port: options.port,
      request: req,
    });
    return;
  }

  // If we are under maxSockets create a new one.
  self.createConnection({
    host: options.host,
    port: options.port,
    request: req,
  });
};

TunnelingAgent.prototype.createConnection = function createConnection(pending) {
  const self = this;

  self.createSocket(pending, (socket) => {
    const onFree = () => {
      self.emit('free', socket, pending.host, pending.port);
    };
    const onCloseOrRemove = () => {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    };
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    pending.request.onSocket(socket);
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  const self = this;
  const placeholder = {};
  self.sockets.push(placeholder);

  const connectOptions = Object.assign({}, self.proxyOptions,
    {
      method: 'CONNECT',
      path: `${options.host}:${options.port}`,
      agent: false,
    });
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] = `Basic ${Buffer.from(connectOptions.proxyAuth).toString('base64')}`;
  }

  const connectReq = self.request(connectOptions);
  const onConnect = (res, socket) => {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode === 200) {
      self.sockets[self.sockets.indexOf(placeholder)] = socket;
      cb(socket);
    } else {
      const error = new Error(`tunneling socket could not be established, statusCode=${res.statusCode}`);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
    }
  };

  const onError = (cause) => {
    connectReq.removeAllListeners();
    const error = new Error(`tunneling socket could not be established, cause=${cause.message}`);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  };
  connectReq.once('connect', onConnect);
  connectReq.once('error', onError);
  connectReq.end();
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  const pos = this.sockets.indexOf(socket);
  if (pos === -1) {
    return;
  }

  this.sockets.splice(pos, 1);

  const pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createConnection(pending);
  }
};

function createSecureSocket(options, cb) {
  const self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, (socket) => {
    // 0 is dummy port for v0.6
    const secureSocket = tls.connect(0, Object.assign({}, self.options,
      {
        socket,
        servername: options.host,
      }));
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}

exports.httpOverHttp = (options) => {
  const agent = new TunnelingAgent(options);
  agent.request = http.request;
  return agent;
};

exports.httpsOverHttp = (options) => {
  const agent = new TunnelingAgent(options);
  agent.request = http.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
};
