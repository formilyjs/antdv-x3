import { defineUserConfig } from 'vuepress'
import path from 'path'
import utils from './util'
import type { DefaultThemeOptions } from 'vuepress'
import VueJsx from '@vitejs/plugin-vue-jsx'


const componentFiles = utils
  .getFiles(path.resolve(__dirname, '../guide'))
  .map((item) => item.replace(/(\.md)/g, ''))
  .filter((item) => !['index'].includes(item))

export default defineUserConfig<DefaultThemeOptions>({
  title: 'Formily Antdv-x3',
  dest: './doc-site',
  theme: 'vuepress-theme-dumi',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '//img.alicdn.com/imgextra/i3/O1CN01XtT3Tv1Wd1b5hNVKy_!!6000000002810-55-tps-360-360.svg',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://unpkg.com/ant-design-vue@3.2.6/dist/antd.css',
      },
    ],
  ],
  themeConfig: {
    logo: '//img.alicdn.com/imgextra/i2/O1CN01Kq3OHU1fph6LGqjIz_!!6000000004056-55-tps-1141-150.svg',
    navbar: [
      {
        text: '指南',
        link: '/guide/',
      },
      {
        text: '主站',
        link: 'https://formilyjs.org',
      },
      {
        text: 'GITHUB',
        link: 'https://github.com/formilyjs/antdv-x3',
      },
    ],
    sidebar: {
      '/guide/': ['/guide/index.md', ...componentFiles],
    },
    lastUpdated: true,
    smoothScroll: true,
  },
  markdown: {
    code: {
      lineNumbers: false,
    },
  },
  plugins: [
    'vuepress-plugin-typescript',
  ],
  bundlerConfig: {
    viteOptions: {
      css: {
        preprocessorOptions: {
          less: {
            modifyVars: {},
            javascriptEnabled: true,
          },
        }
      },
      plugins: [
        VueJsx({

        }),
      ]
    }
  },
  alias: {
    '@formily/antdv-x3': path.resolve(
      __dirname,
      '../../packages/components/src'
    ),
  },
})
