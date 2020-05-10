import { defineConfig } from 'dumi';
import path from 'path';

export default defineConfig({
  title: 'LightProxy',
  mode: 'site',
  // more config: https://d.umijs.org/config
  logo: 'https://cdn.jsdelivr.net/gh/alibaba/lightproxy@master/vendor/files/icon.png',
  locales: [['zh-CN', '中文'], ['en-US', 'English']],
  styles: [
    `.preview {
      max-width: 100%;
      display: block;
      margin: auto;
      height: 500px;
    }`
  ],
});
