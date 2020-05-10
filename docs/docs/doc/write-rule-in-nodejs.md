---
sidemenu: true
title: Use Node.js to write rules
toc: menu
order: 3
---

Starting from LightProxy 1.0.9 version, we support writing rules directly using NodeJS to solve some flexible and complex requirements.

## Use

You can also enter/to get an automatic template

![img](../imgs/quick-rule-nodejs.png)

![img](../imgs/quick-rule-nodejs-result.png)


## writing

Support inline writing

```
github.com/alibaba/lightproxy scriptfile://`

exports.handleRequest = async (ctx, next) => {
  // do sth
  // ctx.fullUrl request url
  // ctx.headers request header
  // ctx.options some meta infomation
  // ctx.method request method
  // const reqBody = await ctx.getReqBody(); req body buffer
  // const reqText = await ctx.getReqText();  req body text, or ''
  // const formData = await ctx.getReqForm(); req form data, or {}
  // ctx.req.body = String| Buffer | Stream | null
  // next can use with next({ host, port });
  // use next to send request
  const { statusCode, headers } = await next(); 
  // do sth
  // const resBody = yield ctx.getResBody();
  // const resText = yield ctx.getResText();
  // ctx.status = 404;
  // ctx.set(headers);
  // ctx.set('x-test', 'abc');
  // ctx.body = String| Buffer | Stream | null;
  ctx.body = 'test';
};`
```

Can also point directly to a file


```
github.com/alibaba/lightproxy scriptfile:/path/to/file.js
```