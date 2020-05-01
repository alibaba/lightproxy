[![Build Status](https://travis-ci.org/alibaba/lightproxy.svg?branch=develop)](https://travis-ci.org/alibaba/lightproxy)
![Stable version](https://img.shields.io/badge/dynamic/json?url=https://gw.alipayobjects.com/os/LightProxy/release.json&label=Stable%20Version&query=$.version)
![Beta version](https://img.shields.io/badge/dynamic/json?url=https://gw.alipayobjects.com/os/LightProxy/beta-release.json&label=Beta%20Version&query=$.version)
![GitHub issues](https://img.shields.io/github/issues/alibaba/lightproxy)
![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/alibaba/lightproxy)<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

<p align="center">
  <a href="https://img.shields.io/badge/chatting-DingTalk-blue)](https://alibaba.github.io/lightproxy/quick-start.html"><img src="https://img.alicdn.com/tfs/TB1yw0ysuL2gK0jSZPhXXahvXXa-400-150.png"/></a>
</p>

<p align="center">
<b><a href="https://alibaba.github.io/lightproxy/quick-start.html">Download</a></b>
|
<b><a href="https://alibaba.github.io/lightproxy/en/quick-start.html">Document</a></b>
|
<b><a href="CONTRIBUTING.org">Contribute</a></b>
|
  <b><a href="https://github.com/alibaba/lightproxy/issues/117">Introduction</a></b>

  |
<b><a href="https://github.com/alibaba/lightproxy/issues/19">介绍文章</a></b>
|
<b><a href="https://alibaba.github.io/lightproxy/start-proxy-only.html">FAQ</a></b>

</p>

--- 
:package: Out-of-box, fully automation with **certificate install & system proxy setting**

:battery: Battery include, powerful `hosts/proxy/capture` based on `whistle`, what u need is just input `/`

:dash: Rules take effect in one second, no hosts cache from browser

--- 

## Why LightProxy

- Caputure network request & response
- Real-time hosts binding
- Forward remote url to local file or other remote file
- Mock interface and pages
- Modify request & response, for example insert <script> , modify response header etc.

## Preview

![preview](https://img.alicdn.com/tfs/TB1EQtHsuH2gK0jSZJnXXaT1FXa-1500-1005.png)

## Download

[macOS Version Download](https://gw.alipayobjects.com/os/LightProxy/LightProxy.dmg)

[Windows Version Download](https://gw.alipayobjects.com/os/LightProxy/LightProxy-Setup.exe)

## Quick Start

Take a quick start at: https://alibaba.github.io/lightproxy/quick-start.html

## How to contribute

### env

- nodejs > 12 (**important**)
- `npm install -g electron-builder` if you need bundle application

### dev

```shell
git clone https://github.com/alibaba/lightproxy
cd lightproxy
yarn run install-deps
yarn run dev
```

For new contributors you can try to fix a [good-first-issue](https://github.com/alibaba/lightproxy/labels/good%20first%20issue)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://www.xcodebuild.com/"><img src="https://avatars3.githubusercontent.com/u/5436704?v=4" width="100px;" alt=""/><br /><sub><b>xcodebuild</b></sub></a><br /><a href="https://github.com/alibaba/lightproxy/commits?author=xcodebuild" title="Code">💻</a> <a href="#ideas-xcodebuild" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/alibaba/lightproxy/pulls?q=is%3Apr+reviewed-by%3Axcodebuild" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-xcodebuild" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/Runly"><img src="https://avatars3.githubusercontent.com/u/18432577?v=4" width="100px;" alt=""/><br /><sub><b>Ranly</b></sub></a><br /><a href="https://github.com/alibaba/lightproxy/commits?author=Runly" title="Code">💻</a> <a href="#question-Runly" title="Answering Questions">💬</a> <a href="https://github.com/alibaba/lightproxy/pulls?q=is%3Apr+reviewed-by%3ARunly" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://www.ahonn.me"><img src="https://avatars3.githubusercontent.com/u/9718515?v=4" width="100px;" alt=""/><br /><sub><b>Yuexun Jiang</b></sub></a><br /><a href="#design-ahonn" title="Design">🎨</a> <a href="https://github.com/alibaba/lightproxy/commits?author=ahonn" title="Code">💻</a> <a href="https://github.com/alibaba/lightproxy/pulls?q=is%3Apr+reviewed-by%3Aahonn" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/avwo"><img src="https://avatars2.githubusercontent.com/u/11450939?v=4" width="100px;" alt=""/><br /><sub><b>avenwu</b></sub></a><br /><a href="https://github.com/alibaba/lightproxy/commits?author=avwo" title="Code">💻</a></td>
    <td align="center"><a href="https://usememo.dev"><img src="https://avatars0.githubusercontent.com/u/10394160?v=4" width="100px;" alt=""/><br /><sub><b>Mashiro Wang</b></sub></a><br /><a href="https://github.com/alibaba/lightproxy/commits?author=MashiroWang" title="Code">💻</a></td>
    <td align="center"><a href="https://williamchan.me"><img src="https://avatars1.githubusercontent.com/u/9210430?v=4" width="100px;" alt=""/><br /><sub><b>William Chan</b></sub></a><br /><a href="https://github.com/alibaba/lightproxy/commits?author=luckyyyyy" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
