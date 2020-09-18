---
nav:
  title: 远程调试
  order: 3
order: 3
---

# 远程调试

我们在无线开发的场景下常常要对无线设备的浏览器和 App 端进行调试，有些情况下我们可以借助 Chrome 或者 Safari 的 Remote Debugger 功能，借助 USB 连接线进行调试。
但是有些场景下我们不具备这样的条件，LightProxy 会借助代理的能力快速注入远程调试的能力。

图为在 iOS 的微信 Webview 进行 Debug。

![img](../imgs/remote-debug.png)

## 使用方式

打开 Debugger Tab，然后通过代理访问带有参数 `lightproxy=true` 的页面，就会在该 Tab 看到 inspect 的按钮。

如果要调试无线页面，请先保证手机已经正确设置代理。
