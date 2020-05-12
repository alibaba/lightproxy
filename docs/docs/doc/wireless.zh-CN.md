---
sidemenu: true
title: 无线端代理
toc: menu
order: 2
---

LightProxy 也可以支持无线端的代理抓包和转发，点击右侧 手机代理 的 Tab（会自动让代理在局域网可见）。

![img](../imgs/wireless-tab.png)

可以看到一个二维码（不同机器二维码不同的，需要扫描自己的二维码），扫描二维码后下载对应的证书，并且安装。

<Alert>注意：LightProxy 默认不在局域网可见，对手机抓包必须要点一下手机代理 Tab 才会开启局域网可见</Alert>

## 安装证书

安装证书对于不同的手机有不同的操作

### iOS 用户

打开相机扫描二维码，在 Safari 中打开，安装描述文件

![img](../imgs/ios-scan-qr.jpeg)


下载后去 设置 中找到 已下载的描述文件

![img](../imgs/ios-settings.jpeg)


然后安装描述文件

![img](../imgs/ios-install-cert.png)


安装完还有最后一步，到 `设置 => 通用 => 关于本机 => （拉到最下面）证书信任设置，勾上 LightProxy 的证书

![img](../imgs/ios-trust-cert.png)


在 Wifi 设置代理为界面中显示的地址以及端口号

![img](../imgs/ios-wifi-settings.png)


## Android 用户

Android 的机型比较多，不同机器安装信任证书的方法稍有不同。大致方式也是扫码下载，然后从系统 - 安全 - 授信凭据中选择安装证书。

<Alert>
另外在高版本 Android 中，需要应用主动声明才能支持用户证书，可以先尝试 Android Chrome 是否代理成功。
</Alert>

