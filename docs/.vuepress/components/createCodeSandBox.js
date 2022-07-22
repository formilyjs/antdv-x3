import { getParameters } from 'codesandbox/lib/api/define'

const CodeSandBoxHTML = '<div id="app"></div>'
const CodeSandBoxJS = `
import Vue from 'vue'
import App from './App.vue'
import "@formily/antdv-x3/dist/antdv-x3.css";
import "ant-design-vue/dist/antd.css";

Vue.createApp(App).mount('#app')
`

const createForm = ({ method, action, data }) => {
  const form = document.createElement('form') // 构造 form
  form.style.display = 'none' // 设置为不显示
  form.target = '_blank' // 指向 iframe

  // 构造 formdata
  Object.keys(data).forEach((key) => {
    const input = document.createElement('input') // 创建 input

    input.name = key // 设置 name
    input.value = data[key] // 设置 value

    form.appendChild(input)
  })

  form.method = method // 设置方法
  form.action = action // 设置地址

  document.body.appendChild(form)

  // 对该 form 执行提交
  form.submit()

  document.body.removeChild(form)
}

export function createCodeSandBox(codeStr) {
  const parameters = getParameters({
    files: {
      'sandbox.config.json': {
        content: {
          template: 'node',
          infiniteLoopProtection: true,
          hardReloadOnChange: false,
          view: 'browser',
          container: {
            port: 8080,
            node: '14',
          },
        },
      },
      'package.json': {
        content: {
          scripts: {
            serve: 'vue-cli-service serve',
            build: 'vue-cli-service build',
            lint: 'vue-cli-service lint',
          },
          dependencies: {
            '@formily/core': 'latest',
            '@formily/vue': 'latest',
            '@formily/antdv-x3': 'latest',
            'core-js': '^3.8.3',
            'ant-design-vue': '^3.2.6',
            vue: '^3.2.37',
          },
          devDependencies: {
            '@vue/cli-plugin-babel': '~5.0.0',
            '@vue/cli-service': '~5.0.0',
            less: 'latest',
            'less-loader': 'latest',
          },
          babel: {
            presets: ['@vue/cli-plugin-babel/preset'],
          },
          vue: {
            devServer: {
              headers: {
                'Access-Control-Allow-Origin': '*',
              },
              host: '0.0.0.0',
              allowedHosts: 'all',
            },
            css: {
              loaderOptions: {
                less: {
                  lessOptions: {
                    javascriptEnabled: true,
                  },
                },
              },
            },
          },
        },
      },
      'src/App.vue': {
        content: codeStr,
      },
      'src/main.js': {
        content: CodeSandBoxJS,
      },
      'public/index.html': {
        content: CodeSandBoxHTML,
      },
    },
  })

  createForm({
    method: 'post',
    action: 'https://codesandbox.io/api/v1/sandboxes/define',
    data: {
      parameters,
      query: 'file=/src/App.vue',
    },
  })
}
