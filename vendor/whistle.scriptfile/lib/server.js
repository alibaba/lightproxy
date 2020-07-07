const Koa = require('koa');
const co = require('co');
const onerror = require('koa-onerror');
const qs = require('querystring');
const iconv = require('iconv-lite');
const scripts = require('./scripts');
const setupWsServer = require('./wsServer');
const util = require('./util');

const body = Symbol('body');
const text = Symbol('text');
const getBody = (stream) => {
  let result = stream[body];
  if (!result) {
    result = util.getStreamBuffer(stream);
    stream[body] = result;
  }
  return result;
};
const getText = (stream) => {
  if (!util.isText(stream.headers)) {
    return Promise.resolve(null);
  }
  let result = stream[text];
  if (!result) {
    result = getBody(stream).then((buf) => {
      return buf ? iconv.decode(buf, util.getCharset(stream.headers)) : '';
    });
    stream[text] = result;
  }
  return result;
};

module.exports = (server, options) => {
  const app = new Koa();
  onerror(app);
  app.use(function* () {
    const ctx = this;
    util.setupContext(ctx, options);
    const { dataSource, clearup } = util.getDataSource();
    ctx.dataSource = dataSource;
    let resPromise;
    const next = (opts) => {
      if (!resPromise) {
        opts = util.parseOptions(opts);
        const { req } = ctx;
        const getReqBody = () => {
          if (!req[body]) {
            return Promise.resolve();
          }
          return ctx.getReqBody();
        };
        resPromise = getReqBody().then((reqBody) => {
          if (reqBody && req.body === undefined) {
            req.body = reqBody;
          }
          return util.request(ctx, opts).then((svrRes) => {
            ctx.status = svrRes.statusCode;
            Object.keys(svrRes.headers).forEach((name) => {
              if (!ctx.res.getHeader(name)) {
                ctx.set(name, svrRes.headers[name]);
              }
            });
            const getResBody = () => {
              return getBody(svrRes);
            };
            const getResText = () => {
              return getText(svrRes);
            };
            ctx.getResBody = getResBody;
            ctx.getResText = getResText;
            return svrRes;
          });
        });
      }
      return resPromise;
    };
    try {
      const { handleRequest } = scripts.getHandler(ctx);
      if (util.isFunction(handleRequest)) {
        const { search } = ctx.reqOptions;
        ctx.query = search ? qs.parse(search.slice(1)) : {};
        const getReqBody = () => {
          return getBody(ctx.req);
        };
        const getReqText = () => {
          return getText(ctx.req);
        };
        ctx.getReqBody = getReqBody;
        ctx.getReqText = getReqText;
        ctx.getReqForm = () => {
          if (!/application\/x-www-form-urlencoded/i.test(ctx.get('content-type'))) {
            return Promise.resolve({});
          }
          return getReqText().then(qs.parse);
        };
        yield co.wrap(handleRequest)(ctx, next);
        if (resPromise && ctx.body === undefined) {
          const res = yield next();
          if (res[body]) {
            ctx.body = yield ctx.getResBody();
            ctx.remove('content-encoding');
          } else {
            ctx.body = res;
          }
        } else {
          ctx.remove('content-encoding');
        }
        ctx.remove('content-length');
      } else {
        ctx.body = yield next();
      }
    } catch (e) {
      ctx.status = 500;
      ctx.body = e.toString() + '\n' + e.stack;
    } finally {
      clearup();
    }
  });
  server.on('request', app.callback());
  setupWsServer(server, options);
};
