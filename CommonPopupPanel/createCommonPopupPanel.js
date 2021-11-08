import Vue from 'vue'
import CommonPopupPanel from './CommonPopupPanel.vue'

const idCache = []
const PanelInsertDom = '#app' // 弹框所处的父级元素位置，弹框的控制范围限制在该元素中

/**
 * 打开全局弹窗
 * @param {Object} styleObj -弹窗样式配置
 * @param {VNode} panel -面板的vue模板
 * @param {string} title -弹窗标题
 * @param {string} id -弹窗ID，当ID名称相同时，不重复打开
 * @param {object} props -传给vue模板的props
 * @param {string} root -弹窗的父级元素的css选择器
 */
const createCommonPopupPanel = ({ title, panel, styleObj, id, props, root } = {}) => {
  if (idCache.includes(id)) {
    return
  }

  if (id) {
    idCache.push(id)
  }

  const parentElement = root || PanelInsertDom
  let root = document.querySelector(parentElement)
  let wrapper = document.createElement('div')
  const domId = `CommonPopupPanel_${Date.now()}_${Math.floor(Math.random() * 1000)}`

  wrapper.setAttribute('id', domId)
  root.appendChild(wrapper)

  return new Vue({
    render: (h) => {
      return h(
        CommonPopupPanel,
        {
          props: { title, panel, styleObj, props, parentElement }
        }
      )
    },
    beforeDestroy() {
      let index = idCache.indexOf(id)
      id !== -1 && idCache.splice(index, 1)
    }
  }).$mount(`#${domId}`)
}

export default createCommonPopupPanel
