import { defineConfig } from 'dumi';
import path from 'path';

export default defineConfig({
  title: 'LightProxy',
  mode: 'site',
  // more config: https://d.umijs.org/config
  logo: 'https://img.alicdn.com/tfs/TB1WGjvr8v0gK0jSZKbXXbK2FXa-128-128.png',
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
