---
title: 'FAQ'
order: 5
---

## 如何和其他代理应用一起使用

部分同样使用系统代理的应用可能会抢占 LightProxy 的代理，你可以把 LightProxy 设置为系统代理后，通过 

```html
/xxx/ socks5://127.0.0.1:1080
```

这样的方式指定满足匹配条件的页面通过 `socks5://127.0.0.1:1080` 的代理进行转发。

或者通过

```html
/.*/ socks5://127.0.0.1:1080
```

的方式设置一个前置代理。


对于 HTTP 代理，使用 

```html
/.*/ proxy://127.0.0.1:1080
```

具体可以参考 [https://github.com/alibaba/lightproxy/issues/91](https://github.com/alibaba/lightproxy/issues/91)


## Cannot be opened because the developer cannot be verified

是因为没有苹果开发者证书签名导致的，参考 https://support.apple.com/en-us/HT202491

打开设置 => 安全

![img](../imgs/security-open-anyway.png)

点击 Open anyway，然后确定
