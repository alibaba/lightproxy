---
title: 'FAQ'
order: 5
---

## How to use with other proxy applications

Some applications that also use system proxies may preempt the LightProxy proxy. You can set LightProxy as the system proxy and pass

```html
/xxx/ socks5://127.0.0.1:1080
```

In this way, pages that meet the matching conditions are specified to be forwarded through the proxy of `socks5://127.0.0.1:1080`.

Or by

```html
/.*/ socks5://127.0.0.1:1080
```

Way to set up a front proxy.


For HTTP proxy, use

```html
/.*/ proxy://127.0.0.1:1080
```

For details, please refer to [https://github.com/alibaba/lightproxy/issues/91](https://github.com/alibaba/lightproxy/issues/91)