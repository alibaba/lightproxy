import { defineConfig } from 'dumi';
import path from 'path';

export default defineConfig({
  title: 'LightProxy',
  mode: 'site',
  // more config: https://d.umijs.org/config
  logo: 'https://cdn.jsdelivr.net/gh/alibaba/lightproxy@master/vendor/files/icon.png',
  styles: [
    `.preview {
      max-width: 100%;
      display: block;
      margin: auto;
      height: 500px;
    }
    img {
      max-height: 400px;
    }
    `
  ],
  metas: [
    {name: 'keywords', content: 'Web debugging proxy, whistle, charles, lightproxy, proxy'},
    {name: 'description', content: 'LightProxy - 💎 Cross platform Web debugging proxy with one-click'}
  ],
  headScripts: [{content: `
  if (document.location.host.indexOf('localhost') === -1 && document.location.host !== 'lightproxy.org') {
    location.host = 'lightproxy.org';
  }
  `}],
  navs: {
    // 多语言 key 值需与 locales 配置中的 key 一致
    'en-US': [
      null,

      {
        title: 'GitHub',
        path: 'https://github.com/alibaba/lightproxy',
      },
    ],
    'zh-CN': [
      null,
      {
        title: 'GitHub',
        path: 'https://github.com/alibaba/lightproxy',
      },
    ],
  },
});
