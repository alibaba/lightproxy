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
    .github-badge {
      position: fixed;
      top: 25px;
      left: 240px;
      z-index: 99999;
      border: 0;
      width: 150px;
      height: 20px;
    }
    `
  ],
  metas: [
    {name: 'keywords', content: 'Web debugging proxy, whistle, charles, lightproxy, proxy'},
    {name: 'description', content: 'LightProxy - 💎 Cross platform Web debugging proxy with one-click'},
    {name: 'google-site-verification', content: '_ImTTkI_QE5qFyxsenyvUF-1iUQO0cvOFLPutf07nCI'},
  ],
  scripts: [{
    content: `
    (function() {
      if (location.pathname === '/' || location.pathname === '/zh-CN') {
        var timer = setInterval(function() {
          try {
            document.querySelector('.__dumi-default-layout-hero h1').outerHTML='<img height="150px" src="https://cdn.jsdelivr.net/gh/alibaba/lightproxy@master/vendor/files/icon.png"></img><h1>LightProxy</h1>';
            clearInterval(timer);
          } catch(e){}
        }, 200);
      }

      var tag = document.createElement('iframe');
      tag.src = 'https://ghbtns.com/github-btn.html?user=alibaba&repo=lightproxy&type=star&count=true';
      
      tag.title = 'Star lightproxy on Github';
      tag.className = 'github-badge';
      document.body.appendChild(tag);
    })();
  `
  }, {
    src: 'https://www.googletagmanager.com/gtag/js?id=UA-154996514-3',
    async: true,
  }, {
    content: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-154996514-3');
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
