module.exports = {
    title: 'LightProxy',
    base: '/lightproxy/',
    description: '基于 whistle 的代理调试软件',
    repo: 'alibaba/lightproxy',
    head: [
        ['meta', { name: 'referrer', content: 'no-referrer' }]
    ],
    plugins: [
      [
        'vuepress-plugin-yuque', {
          repoUrl: 'https://www.yuque.com/lp/doc/',
          html: true,
          home: {

            actionText: '现在开始 →',
            actionLink: '/quick-start.html',
            heroImage: 'https://img.alicdn.com/tfs/TB19.p_rXP7gK0jSZFjXXc5aXXa-512-512.png',
            footer: `Copyright © Alibaba IFE 团队`
          }
        }
      ],
      [
        '@vuepress/google-analytics',
        {
          'ga': 'UA-154996514-2'
        }
      ]
    ]
}