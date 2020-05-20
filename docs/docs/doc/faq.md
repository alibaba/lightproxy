---
title: 'FAQ'
order: 5
---

## What to do if the proxy does not take effect

### Check proxy status

First make sure that the proxy and system proxy status of the lower right corner of LightProxy are OK, as shown in the figure:

! [check-status] (../ imgs / check-status.png)

### Confirm whether the proxy is effective in the browser

Just open a webpage, open the Chrome Devtools Network interface, and confirm that if there is lightproxy in the response header, the proxy is in effect.

! [devtools] (../ imgs / devtools.png)

<Alert> By default, 127.0.0.1 and localhost are not proxies. If you need to use, you can proxy other domain names to 127.0.0.1 and then use other domain names for development </ Alert>

### Certificate error

If you are prompted with a certificate error, you can use Help => Install Certificate & Helper in the LightProxy menu.

<Alert> For Windows users, you may need to right click => properties => run as administrator. Then try the above actions again. </ Alert>

### Windows users

-Chrome for Windows users If the proxy does not take effect, try restarting Chrome
-If a Windows user has a certificate error, you may need to right-click => Properties => Run as administrator, and then use Help => Install Certificate & Helper in the LightProxy menu.

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

## Cannot be opened because the developer cannot be verified

It is because there is no Apple developer certificate signature, please refer to https://support.apple.com/en-us/HT202491

Open Settings => Security

![img](../imgs/security-open-anyway.png)

Click Open anyway and confirm
