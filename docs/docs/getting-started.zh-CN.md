---
nav:
  title: 快速开始
  order: 1
---

# 快速开始

<img height="150px" src="https://cdn.jsdelivr.net/gh/alibaba/lightproxy@master/vendor/files/icon.png">

<a name="D6AxO"></a>
## 下载

<br />[**macOS 版**](https://gw.alipayobjects.com/os/LightProxy/LightProxy.dmg)<br />
<br />[**Windows 版**](https://gw.alipayobjects.com/os/LightProxy/LightProxy-Setup.exe)

<a name="DktIa"></a>
## 介绍

<br />LightProxy 是一款基于 `whistle` 的本地代理抓包软件<br />
<br />![image.png](https://cdn.nlark.com/yuque/0/2019/png/236311/1577377523103-fa6b7bf3-9cce-45ff-bcd2-5e75ff898cf5.png#align=left&display=inline&height=442&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1624&originWidth=2424&size=729502&status=done&style=none&width=660)
<a name="5aH7y"></a>
## LightProxy 能帮你做什么


- 抓包，包括无线场景抓包
- 实时 `hosts` 绑定
- 按规则转发资源
- `mock` 接口，页面等
- 修改请求和响应内容，例如在页面中插入 `script` ，修改返回头等




<a name="iBVGx"></a>
## 安装
![image.png](https://cdn.nlark.com/yuque/0/2019/png/236311/1577377523196-e78bbc08-decd-48f0-8357-4384d428ba2a.png#align=left&display=inline&height=253&margin=%5Bobject%20Object%5D&name=image.png&originHeight=984&originWidth=1304&size=366040&status=done&style=none&width=335)<br />打开 `DMG` 后，把 `LightProxy` 拖动到 `Application` 中<br />

<a name="4hCoZ"></a>
## 启动

<br />在应用列表中启动 `LightProxy` ，第一次启动时 `LightProxy` 会询问两次密码，这是用于安装辅助程序和自动安装证书。<br />

<a name="evwcw"></a>
### ![image.png](https://cdn.nlark.com/yuque/0/2019/png/236311/1577377523341-76bc3f46-547f-4a61-bf88-8a0698fe0e04.png#align=left&display=inline&height=308&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1624&originWidth=2424&size=681915&status=done&style=none&width=459)

<br />然后我们就会看到如图的界面，默认规则中有一些规则是为了不影响日常的日用软件，例如 `Apple Store` 等，如果你确定要代理这些域名可以注释掉它们。<br />

<a name="EcLsK"></a>
## 使用 / 来快速插入规则

<br />点击左上角的 ![image.png](https://cdn.nlark.com/yuque/0/2019/png/236311/1577377523458-d76dc0be-b4cc-482d-abdb-5d2bbc1e469a.png#align=left&display=inline&height=28&margin=%5Bobject%20Object%5D&name=image.png&originHeight=56&originWidth=108&size=949&status=done&style=none&width=54)新建规则，直接输入 `/` 可以快速插入规则<br />
<br />![image.png](https://cdn.nlark.com/yuque/0/2019/png/236311/1577377523534-b1127dc6-373b-4eea-8fab-8c7a3e51de95.png#align=left&display=inline&height=310&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1624&originWidth=2424&size=566011&status=done&style=none&width=463)<br />例如我们选择 `Mock JSON` <br />
<br />![image.png](https://cdn.nlark.com/yuque/0/2019/png/236311/1577377523648-aa3a58aa-3834-4d34-b79d-3909983eb73d.png#align=left&display=inline&height=310&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1624&originWidth=2424&size=565420&status=done&style=none&width=462)<br />
<br />我们会通过 `snippet` 补全一个 `JSON` 规则，可以通过 `Tab` 快速跳转。这里的 `` 类似 ES6 字符串的用法是在 `whistle` 基础上拓展的语法，可以支持多行内容直接写到规则里。<br />
<br />然后我们打开浏览器访问 `https://www.github.com/alibaba/lightproxy`<br />
<br />![image.png](https://cdn.nlark.com/yuque/0/2019/png/236311/1577377523771-c16c55b2-2f6b-4560-a855-dfdad4d9b1c5.png#align=left&display=inline&height=570&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1140&originWidth=3500&size=254921&status=done&style=none&width=1750)<br />
<br />可以看到返回的内容是我们写的 `JSON` ，返回的 `header` 中也有我们写的 `my-test-head` ，同时 `__lightproxy-real-url__`等 `header` 也可以帮助我们快速定位实际生效的文件。<br />

<a name="A1Js5"></a>
## 更多规则

<br />除了多行字符串语法外， `LightProxy` 语法就是 `whistle` 语法，可以直接参考 `whistle` 的规则文档：<br />
<br />[https://wproxy.org/whistle/principle.html](https://wproxy.org/whistle/principle.html)<br />

<a name="SmnqV"></a>
## 反馈

<br />反馈 `issue` 到 [https://github.com/alibaba/lightproxy/issues](https://github.com/alibaba/lightproxy/issues)<br />
<br />微信讨论群见：[https://github.com/alibaba/lightproxy/issues/93](https://github.com/alibaba/lightproxy/issues/93)<br />![image.png](https://cdn.nlark.com/yuque/0/2019/png/236311/1577416872302-9f04a4f9-2f27-4ff2-b1e5-4df58f28ab40.png#align=left&display=inline&height=271&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1426&originWidth=1080&size=403575&status=done&style=none&width=205)
