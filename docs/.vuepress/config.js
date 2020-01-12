module.exports = {
    title: 'LightProxy',
    base: '/lightproxy/',
    description: '基于 whistle 的代理调试软件',
    locales: {
      '/': {
        lang: 'zh-CN',
        selectText: '选择语言',
        label: '简体中文',
      },
      '/en/': {
        lang: 'en-US',
        selectText: 'Languages',
        label: 'English',
        ariaLabel: 'Languages'
      },
    },
    themeConfig: {
        repo: 'alibaba/lightproxy',
        repoLabel: 'Github',
        
    },
    head: [
        ['meta', { name: 'referrer', content: 'no-referrer' }]
    ],
    plugins: [
      [
        '@xcodebuild/vuepress-plugin-yuque', {
          repoUrl: 'https://www.yuque.com/lp/doc/',
          html: true,
          home: {
            actionText: 'Quick Start →',
            actionLink: '/quick-start.html',
            heroImage: 'https://img.alicdn.com/tfs/TB19.p_rXP7gK0jSZFjXXc5aXXa-512-512.png',
            footer: `Copyright © Alibaba IFE Team`
          },
          multipleLanguage: {
            '/en': 'https://www.yuque.com/lp/doc-en/',
          }
        }
      ],
      // [
      //   '@xcodebuild/vuepress-plugin-yuque', {
      //     repoUrl: 'https://www.yuque.com/lp/doc-en/',
      //     html: true,
      //     home: {
      //       actionText: 'Quick Start →',
      //       actionLink: '/quick-start.html',
      //       heroImage: 'https://img.alicdn.com/tfs/TB19.p_rXP7gK0jSZFjXXc5aXXa-512-512.png',
      //       footer: `Copyright © Alibaba IFE Team`
      //     },
      //   }
      // ],
      [
        '@vuepress/google-analytics',
        {
          'ga': 'UA-154996514-2'
        }
      ]
    ]
}