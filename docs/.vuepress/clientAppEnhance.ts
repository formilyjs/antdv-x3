import AntDesign from 'ant-design-vue'
import '@formily/antdv-x3/style.ts'
import { defineClientAppEnhance } from '@vuepress/client'
import './styles/index.styl'
import DumiPreviewer from './components/dumi-previewer.vue'
import 'prismjs/themes/prism-tomorrow.css'


export default defineClientAppEnhance(({ app }) => {
  
  app.use(AntDesign)
  app.component('dumi-previewer', DumiPreviewer)
})