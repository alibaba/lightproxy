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
  scripts: [{
    content: `
    setTimeout(function() {
      try {
        document.querySelector('.__dumi-default-layout-hero h1').outerHTML='<img height="150px" src="https://cdn.jsdelivr.net/gh/alibaba/lightproxy@master/vendor/files/icon.png"></img><h1>LightProxy</h1>';
      } catch(e){}
    }, 400);
  `
  }],
  headScripts: [{content: `
  if (document.location.host.indexOf('localhost') === -1 && document.location.host !== 'lightproxy.org') {
    location.host = 'lightproxy.org';
  }
  `}, {
    src: 'https://cdn.jsdelivr.net/npm/lazysizes@5.2.0/lazysizes.min.js'
  }],
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
