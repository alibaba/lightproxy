---
sidemenu: true
title: Used in the command line
toc: menu
order: 3
---

By default, the proxy settings of LightProxy only take effect on browsers and Webview. If you need to take effect on the command line (such as curl, etc.), you can use the copy shell script function provided on the menubar.

![copy-shell](../imgs/menubar-copy-shell.png)

After clicking, the proxy commands will be automatically copied to the clipboard. **After pasting and executing in the shell**, commands such as `curl` will go through the proxy of `LightProxy`.

For example, we execute

```shell
export https_proxy=http://127.0.0.1:12888 http_proxy=http://127.0.0.1:12888 all_proxy=socks5://127.0.0.1:12889
curl https://baidu.com -I
```

The result is

```
HTTP/1.1 200 Connection Established
Proxy-Agent: whistle

HTTP/2 302
server: bfe/1.0.8.18
date: Fri, 19 Jun 2020 03:36:36 GMT
content-type: text/html
content-length: 161
location: http://www.baidu.com/
__lightproxy-host-ip__: 127.0.0.1
__lightproxy-rules__: none
__lightproxy-real-url__: https://baidu.com/
__lightproxy-help__: See https://github.com/alibaba/lightproxy
```

It should be noted that in this way, only applications that read environment variables will pass through the proxy, and will not take effect for all applications.