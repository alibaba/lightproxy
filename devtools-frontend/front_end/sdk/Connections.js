// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @implements {Protocol.Connection}
 */
export class MainConnection {
  constructor() {
    this._onMessage = null;
    this._onDisconnect = null;
    this._messageBuffer = '';
    this._messageSize = 0;
    this._eventListeners = [
      Host.InspectorFrontendHost.events.addEventListener(
          Host.InspectorFrontendHostAPI.Events.DispatchMessage, this._dispatchMessage, this),
      Host.InspectorFrontendHost.events.addEventListener(
          Host.InspectorFrontendHostAPI.Events.DispatchMessageChunk, this._dispatchMessageChunk, this),
    ];
  }

  /**
   * @override
   * @param {function((!Object|string))} onMessage
   */
  setOnMessage(onMessage) {
    this._onMessage = onMessage;
  }

  /**
   * @override
   * @param {function(string)} onDisconnect
   */
  setOnDisconnect(onDisconnect) {
    this._onDisconnect = onDisconnect;
  }

  /**
   * @override
   * @param {string} message
   */
  sendRawMessage(message) {
    if (this._onMessage) {
      Host.InspectorFrontendHost.sendMessageToBackend(message);
    }
  }

  /**
   * @param {!Common.Event} event
   */
  _dispatchMessage(event) {
    if (this._onMessage) {
      this._onMessage.call(null, /** @type {string} */ (event.data));
    }
  }

  /**
   * @param {!Common.Event} event
   */
  _dispatchMessageChunk(event) {
    const messageChunk = /** @type {string} */ (event.data['messageChunk']);
    const messageSize = /** @type {number} */ (event.data['messageSize']);
    if (messageSize) {
      this._messageBuffer = '';
      this._messageSize = messageSize;
    }
    this._messageBuffer += messageChunk;
    if (this._messageBuffer.length === this._messageSize) {
      this._onMessage.call(null, this._messageBuffer);
      this._messageBuffer = '';
      this._messageSize = 0;
    }
  }

  /**
   * @override
   * @return {!Promise}
   */
  disconnect() {
    const onDisconnect = this._onDisconnect;
    Common.EventTarget.removeEventListeners(this._eventListeners);
    this._onDisconnect = null;
    this._onMessage = null;

    if (onDisconnect) {
      onDisconnect.call(null, 'force disconnect');
    }
    return Promise.resolve();
  }
}

/**
 * @implements {Protocol.Connection}
 */
export class WebSocketConnection {
  /**
   * @param {string} url
   * @param {function()} onWebSocketDisconnect
   */
  constructor(url, onWebSocketDisconnect) {
    this._socket = new WebSocket(url);
    this._socket.onerror = this._onError.bind(this);
    this._socket.onopen = this._onOpen.bind(this);
    this._socket.onmessage = messageEvent => {
      if (this._onMessage) {
        this._onMessage.call(null, /** @type {string} */ (messageEvent.data));
      }
    };
    this._socket.onclose = this._onClose.bind(this);

    this._onMessage = null;
    this._onDisconnect = null;
    this._onWebSocketDisconnect = onWebSocketDisconnect;
    this._connected = false;
    this._messages = [];
  }

  /**
   * @override
   * @param {function((!Object|string))} onMessage
   */
  setOnMessage(onMessage) {
    this._onMessage = onMessage;
  }

  /**
   * @override
   * @param {function(string)} onDisconnect
   */
  setOnDisconnect(onDisconnect) {
    this._onDisconnect = onDisconnect;
  }

  _onError() {
    this._onWebSocketDisconnect.call(null);
    // This is called if error occurred while connecting.
    this._onDisconnect.call(null, 'connection failed');
    this._close();
  }

  _onOpen() {
    this._socket.onerror = console.error;
    this._connected = true;
    for (const message of this._messages) {
      this._socket.send(message);
    }
    this._messages = [];
  }

  _onClose() {
    this._onWebSocketDisconnect.call(null);
    this._onDisconnect.call(null, 'websocket closed');
    this._close();
  }

  /**
   * @param {function()=} callback
   */
  _close(callback) {
    this._socket.onerror = null;
    this._socket.onopen = null;
    this._socket.onclose = callback || null;
    this._socket.onmessage = null;
    this._socket.close();
    this._socket = null;
    this._onWebSocketDisconnect = null;
  }

  /**
   * @override
   * @param {string} message
   */
  sendRawMessage(message) {
    if (this._connected) {
      this._socket.send(message);
    } else {
      this._messages.push(message);
    }
  }

  /**
   * @override
   * @return {!Promise}
   */
  disconnect() {
    let fulfill;
    const promise = new Promise(f => fulfill = f);
    this._close(() => {
      if (this._onDisconnect) {
        this._onDisconnect.call(null, 'force disconnect');
      }
      fulfill();
    });
    return promise;
  }
}

let lastRowId;

const completeIds = {};
const reqeustIds = {};

function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) === variable) {
          return decodeURIComponent(pair[1]);
      }
  }
}


/**
 * @implements {Protocol.Connection}
 */
export class StubConnection {
  constructor() {
    this._onMessage = null;
    this._onDisconnect = null;

    const getData = async () => {
      const port = getQueryVariable('whistlePort');
      const api = `http://127.0.0.1:${port}/cgi-bin/get-data?clientId=lightproxy&startLogTime=-2&startSvrLogTime=-2&ids=&startTime=${lastRowId || ''}&dumpCount=0&lastRowId=${lastRowId ||
          ''}&logId=&count=20`;
      const res = await fetch(api);
      const data = await res.json();
      lastRowId = data.data.endId;

      for (const key of data.data.newIds) {

        const dataItem = data.data.data[key];

        if (completeIds[dataItem.id]) {
          continue;
        }

      if (!reqeustIds[dataItem.id]) {
        reqeustIds[dataItem.id] = true;
        this._onMessage({
            method: 'Network.requestWillBeSent',
            params: {
              requestId: dataItem.id,
              loaderId: '0',
              documentURL: dataItem.url,
              request: {
                url: dataItem.url,
                method: dataItem.req.method,
                headers: dataItem.req.headers || {},
                initialPriority: 'High',
                referrerPolicy: 'same-origin',
              },
              type: 'Document',
              timestamp: dataItem.startTime,
              wallTime: dataItem.startTime,
              initiator: {
                type: 'other',
              },
            }
        });
      }

      if (dataItem.res.headers && dataItem.res.statusCode) {
          completeIds[dataItem.id] = dataItem;
          const devtoolsHeaders = {};
          const res = dataItem.res;
          for (const key of Object.keys(res.headers)) {
            devtoolsHeaders[key] = res.headers[key];
            if (Array.isArray(devtoolsHeaders[key])) {
              devtoolsHeaders[key] = devtoolsHeaders[key].join('\n');
            }
          }

          this._onMessage({
            method: 'Network.responseReceived',
            params: {
              requestId: dataItem.id,
              loaderId: '0',
              response: {
                url: dataItem.url,
                status: dataItem.res.statusCode,
                statusText: dataItem.res.statusText || '',
                headers: devtoolsHeaders,
                remoteIPAddress: dataItem.res.ip + ':' + dataItem.res.port,
                encodedDataLength: dataItem.res.size,
                mimeType: res.headers['content-type'] || ''
              },
              type: 'Document',
              timestamp: new Date().getTime(),
              timing: {
                requestTime: Math.floor(dataItem.startTime / 1000),
                dnsEnd: dataItem.dnsTime,
              }
            }
          });

          this._onMessage({
            method: 'Network.loadingFinished',
            params: {
              requestId: dataItem.id,
              timestamp: dataItem.startTime,
              encodedDataLength: dataItem.res.size || 0,
              timing: {
                requestTime: Math.floor(dataItem.startTime / 1000),
                dnsEnd: dataItem.dnsTime,
              }
            }
          });
        }
      }
    };

    setInterval(() => {
      getData();
    }, 1000);
  }

  /**
   * @override
   * @param {function((!Object|string))} onMessage
   */
  setOnMessage(onMessage) {
    this._onMessage = onMessage;
  }

  /**
   * @override
   * @param {function(string)} onDisconnect
   */
  setOnDisconnect(onDisconnect) {
    this._onDisconnect = onDisconnect;
  }

  /**
   * @override
   * @param {string} message
   */
  sendRawMessage(message) {
    // setTimeout(this._respondWithError.bind(this, message), 0);

    // write response logic here
    message = JSON.parse(message);
    console.log(message);

    if (message.method === 'Network.getResponseBody') {
      const timer = setInterval(() => {
        const res = completeIds[message.params.requestId].res;
        if (res) {
          this._onMessage({
            id: message.id,
            result: {
              body: res.body || res.base64,
              base64Encoded: res.base64 ? true : false,
            }
          });
          clearInterval(timer);
        }
      }, 300);
     
    }
  }

  /**
   * @param {string} message
   */
  _respondWithError(message) {
    const messageObject = JSON.parse(message);
    const error = {
      message: 'This is a stub connection, can\'t dispatch message.',
      code: Protocol.DevToolsStubErrorCode,
      data: messageObject
    };
    if (this._onMessage) {
      this._onMessage.call(null, {id: messageObject.id, error: error});
    }
  }

  /**
   * @override
   * @return {!Promise}
   */
  disconnect() {
    if (this._onDisconnect) {
      this._onDisconnect.call(null, 'force disconnect');
    }
    this._onDisconnect = null;
    this._onMessage = null;
    return Promise.resolve();
  }
}

/**
 * @implements {Protocol.Connection}
 */
export class ParallelConnection {
  /**
   * @param {!Protocol.Connection} connection
   * @param {string} sessionId
   */
  constructor(connection, sessionId) {
    this._connection = connection;
    this._sessionId = sessionId;
    this._onMessage = null;
    this._onDisconnect = null;
  }

  /**
   * @override
   * @param {function(!Object)} onMessage
   */
  setOnMessage(onMessage) {
    this._onMessage = onMessage;
  }

  /**
   * @override
   * @param {function(string)} onDisconnect
   */
  setOnDisconnect(onDisconnect) {
    this._onDisconnect = onDisconnect;
  }

  /**
   * @override
   * @param {string} message
   */
  sendRawMessage(message) {
    const messageObject = JSON.parse(message);
    // If the message isn't for a specific session, it must be for the root session.
    if (!messageObject.sessionId) {
      messageObject.sessionId = this._sessionId;
    }
    this._connection.sendRawMessage(JSON.stringify(messageObject));
  }

  /**
   * @override
   * @return {!Promise}
   */
  disconnect() {
    if (this._onDisconnect) {
      this._onDisconnect.call(null, 'force disconnect');
    }
    this._onDisconnect = null;
    this._onMessage = null;
    return Promise.resolve();
  }
}

/**
 * @param {function():!Promise<undefined>} createMainTarget
 * @param {function()} websocketConnectionLost
 * @return {!Promise}
 */
export async function initMainConnection(createMainTarget, websocketConnectionLost) {
  Protocol.Connection.setFactory(_createMainConnection.bind(null, websocketConnectionLost));
  await createMainTarget();
  Host.InspectorFrontendHost.connectionReady();
  Host.InspectorFrontendHost.events.addEventListener(Host.InspectorFrontendHostAPI.Events.ReattachMainTarget, () => {
    SDK.targetManager.mainTarget().router().connection().disconnect();
    createMainTarget();
  });
  return Promise.resolve();
}

/**
 * @param {function()} websocketConnectionLost
 * @return {!Protocol.Connection}
 */
export function _createMainConnection(websocketConnectionLost) {
  const wsParam = Root.Runtime.queryParam('ws');
  const wssParam = Root.Runtime.queryParam('wss');
  if (wsParam || wssParam) {
    const ws = wsParam ? `ws://${wsParam}` : `wss://${wssParam}`;
    return new WebSocketConnection(ws, websocketConnectionLost);
  } else if (Host.InspectorFrontendHost.isHostedMode()) {
    return new StubConnection();
  }

  return new MainConnection();
}

/* Legacy exported object */
self.SDK = self.SDK || {};

/* Legacy exported object */
SDK = SDK || {};

/** @constructor */
SDK.MainConnection = MainConnection;

/** @constructor */
SDK.WebSocketConnection = WebSocketConnection;

/** @constructor */
SDK.StubConnection = StubConnection;

/** @constructor */
SDK.ParallelConnection = ParallelConnection;

SDK.initMainConnection = initMainConnection;
SDK._createMainConnection = _createMainConnection;
