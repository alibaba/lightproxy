---
sidemenu: true
title: Use with umi/antd-pro
toc: menu
order: 4
---
Part of the static resources of umi and antd pro users need to be published separately, and then referenced to the back-end page through js.


If we need to link the js directly to the online page during local development, we need to proxy the online address to the local, but we will encounter some problems(such as HMR, common.js, etc.), so write a document dedicated to introduce How to use it.

## Forward file

For example, we have a backend page and js/css is sent to g.alicdn.com


Suppose the domain name of our page is www.test.com, which is quoted on the page

```html
https://g.alicdn.com/ife/project/umi.css
https://g.alicdn.com/ife/project/umi.js
```

Two css and js hosted on CDN.


But simply forwarding these two files is not enough, because during local development, umi will also provide HMR, asynchronous loading, vendor and other functions, we need to forward these things.


So the corresponding rule is:

```html
# Proxy two main files, modify according to specific URL
g.alicdn.com/ife/project/umi.css http://127.0.0.1:8000/umi.css
g.alicdn.com/ife/project/umi.js http://127.0.0.1:8000/umi.js

# Locally developed asynchronously loaded async js/css and vendor will be loaded from/, so do the corresponding forwarding
^www.test.com/***. js http://127.0.0.1:8000/$1.js
^www.test.com/***. map http://127.0.0.1:8000/$1.map
^www.test.com/***. css http://127.0.0.1:8000/$1.css

# /socksjs-node/is used by the HMR function, the following ws/xhr should be forwarded
^www.test.com/sockjs-node/*** http://127.0.0.1:8000/sockjs-node/$1

#: 3000/is the interface used by umi-ui, also forwarded in the past
www.test.com:3000 http://127.0.0.1:3000/

# Generally, this is not needed, because the online API is often directly on the online API, but if necessary, you can add
# Forward API to local
# ^www.test.com/api/*** http://127.0.0.1:8000/api/$1
```

<Alert>
Note: The above port number and domain name may need to be changed according to the actual situation.
</Alert>

## Preview

Modify the Welcome.jsx page to enable Hot reload

![img](../imgs/use-with-umi.png)