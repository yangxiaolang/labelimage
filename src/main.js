import Vue from 'vue'
import App from './App.vue'

import { SVG } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.panzoom.js'
import '@svgdotjs/svg.draggable.js'
import '@svgdotjs/svg.topoly.js'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)

Vue.prototype.$svg = SVG

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
